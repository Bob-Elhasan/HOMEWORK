#!/usr/bin/env python3
"""Curriculum refresh pipeline for the national (Egyptian MOE) catalog.

Detects when a Ministry book changes or a newer edition appears, and re-processes
only what changed. See docs/catalog/refresh.md for the full runbook.

Commands
  baseline [--all]        Store fingerprints and contents-page text for current books.
  harvest                 Find newly published Ministry links (GitHub code search) and add them to the registry.
  check [--strict]        Detect changed books and newer editions; write a report to data/catalog/refresh/.
  carry-forward REPORT    Apply safe results from a report: new editions with an unchanged contents page.

Requirements: curl, pdftoppm and pdfinfo (poppler), tesseract with the Arabic language pack, Pillow.
Only links already published (registry or incoming-links.txt) are used; file names are never guessed.
"""
import argparse, csv, datetime, difflib, json, os, pathlib, re, shutil, subprocess, sys, tempfile, urllib.parse

ROOT = pathlib.Path(__file__).resolve().parent.parent
NATIONAL = ROOT / 'data/catalog/curricula/national.json'
REGISTRY = ROOT / 'data/catalog/sources/moe-book-links.csv'
FINGERPRINTS = ROOT / 'data/catalog/sources/fingerprints.json'
INCOMING = ROOT / 'data/catalog/sources/incoming-links.txt'
REPORTS = ROOT / 'data/catalog/refresh'
CONTENT = ROOT / 'content'
STORAGE = 'https://elearnningcontent.blob.core.windows.net/elearnningcontent/'

SAME_AT = 0.80      # contents-page text similarity at or above this: same structure
CHANGED_AT = 0.55   # at or below this: structure changed; in between: needs human review
TODAY = datetime.date.today().isoformat()

# ------------------------------------------------------------------ parsing helpers (pure, unit-tested)

def folder_year(url):
    """Ministry folder -> (folder, academic_year, start_year). '2026_2027' -> 2026/2027; '2026' -> 2025/2026."""
    m = re.search(r'/elearnningcontent/(\d{4})_(\d{4})/', url)
    if m:
        return f'{m.group(1)}_{m.group(2)}', f'{m.group(1)}/{m.group(2)}', int(m.group(1))
    m = re.search(r'/elearnningcontent/(\d{4})/', url)
    if m:
        y = int(m.group(1))
        return m.group(1), f'{y - 1}/{y}', y - 1
    m = re.search(r'/elearnningcontent/content/(\d{4})/', url)
    if m:
        y = int(m.group(1))
        return f'content/{y}', f'{y - 1}/{y}', y - 1
    return '', None, None


def year_start(academic_year):
    return int(academic_year.split('/')[0]) if academic_year else None


def parse_link(url):
    """Grade, term, kind, language, and subject guess from a Ministry storage URL."""
    u = urllib.parse.unquote(url)
    grade = None
    for pat, off in [(r'/Primary/Primary(\d)/', 0), (r'/Prepratory/Prepratory(\d)/', 6), (r'/Secondry/Secondry(\d)/', 9)]:
        m = re.search(pat, u)
        if m:
            grade = int(m.group(1)) + off
            break
    term = re.search(r'/Term(\d)/', u)
    kind = re.search(r'/Term\d/([^/]+)/', u)
    f = u.rsplit('/', 1)[-1]
    fl = f.lower()
    lang = 'ar'
    if re.search(r'(^|_)(e|en|english)(_|\.|\d)|_e_|english', fl):
        lang = 'en'
    if re.search(r'(^|_)(f|fr|french|france)(_|\.|\d)|_f_|french|france', fl):
        lang = 'fr'
    subject = 'other'
    for key, pat in [('discover', r'discover'), ('religion-islamic', r'islam'), ('religion-christian', r'crist|christ|^ch_|chr_'),
                     ('social-studies', r'social|studies'), ('ict', r'ict'), ('math', r'math'), ('science', r'sci|integrated'),
                     ('english', r'english'), ('french', r'fren|france'), ('arabic', r'arab')]:
        if re.search(pat, fl):
            subject = key
            break
    if subject == 'english':
        lang = 'en'
    return dict(grade=grade, term=int(term.group(1)) if term else None, kind=kind.group(1) if kind else '',
                lang=lang, subject=subject, file=f)


DIAC = re.compile('[ؐ-ًؚ-ٰٟۖ-ۭـ]')


def norm_words(text):
    """Normalise Arabic OCR text to comparable words: no diacritics, unified letters, no digits."""
    t = DIAC.sub('', text)
    t = re.sub('[إأآا]', 'ا', t).replace('ى', 'ي').replace('ة', 'ه').replace('ؤ', 'و').replace('ئ', 'ي')
    t = re.sub(r'[0-9٠-٩۰-۹]+', ' ', t)
    t = re.sub(r'[^ء-يa-zA-Z ]+', ' ', t)
    return [w for w in t.split() if len(w) > 1]


def similarity(a, b):
    return round(difflib.SequenceMatcher(None, a, b).ratio(), 3)


def classify(score):
    if score is None:
        return 'review'
    if score >= SAME_AT:
        return 'same'
    if score <= CHANGED_AT:
        return 'changed'
    return 'review'


def candidates_for(syl, rows):
    """Registry rows that look like a newer edition of the syllabus: same grade, term, subject, Arabic edition, newer year."""
    start = year_start(syl.get('academic_year')) or folder_year(syl['source_url'])[2]
    out = []
    for r in rows:
        if r['url'] == syl['source_url'] or r.get('status', 'ok') not in ('ok', 'unchecked', ''):
            continue
        p = parse_link(r['url'])
        if p['kind'] != 'StudentBook' or p['grade'] != syl['grade_min'] or p['lang'] != 'ar':
            continue
        if p['subject'] != syl['subject']:
            continue
        if syl.get('term') and p['term'] != syl['term']:
            continue
        ystart = folder_year(r['url'])[2]
        if ystart is None or start is None or ystart <= start:
            continue
        out.append(r['url'])
    return sorted(set(out))


# ------------------------------------------------------------------ I/O helpers

def run(cmd, **kw):
    return subprocess.run(cmd, capture_output=True, text=True, **kw)


def head(url):
    r = run(['curl', '-sS', '-I', '-L', '--max-time', '30', urllib.parse.quote(url, safe=':/')])
    out = r.stdout
    codes = re.findall(r'^HTTP/\S+ (\d{3})', out, re.M)
    code = codes[-1] if codes else 'err'
    def h(name):
        m = re.findall(rf'^{name}:\s*(.+?)\s*$', out, re.M | re.I)
        return m[-1] if m else None
    return dict(status=code, md5=h('Content-MD5'), etag=h('ETag'), last_modified=h('Last-Modified'), length=h('Content-Length'))


def download(url, folder):
    path = pathlib.Path(folder) / 'book.pdf'
    r = run(['curl', '-sS', '-L', '--max-time', '600', '-o', str(path), '-w', '%{http_code}', urllib.parse.quote(url, safe=':/')])
    if r.stdout.strip() != '200':
        raise RuntimeError(f'download failed ({r.stdout.strip()}) for {url}')
    return path


def page_count(pdf):
    m = re.search(r'^Pages:\s+(\d+)', run(['pdfinfo', str(pdf)]).stdout, re.M)
    return int(m.group(1)) if m else 0


def ocr_pages(pdf, pages, folder):
    words, lines = [], []
    for p in pages:
        base = pathlib.Path(folder) / f'p{p}'
        run(['pdftoppm', '-f', str(p), '-l', str(p), '-r', '200', '-gray', '-png', '-singlefile', str(pdf), str(base)])
        if not base.with_suffix('.png').exists():
            continue
        text = run(['tesseract', str(base.with_suffix('.png')), '-', '-l', 'ara', '--psm', '4']).stdout
        words += norm_words(text)
        lines += [' '.join(norm_words(l)) for l in text.splitlines() if len(norm_words(l)) >= 2]
    return words, lines


def best_contents(pdf, baseline_words, hint_pages, folder):
    """OCR the hinted contents pages; if they do not match well, scan the first pages for a better match."""
    n = page_count(pdf)
    width = max(1, len(hint_pages or [1]))
    tried = []
    if hint_pages:
        tried.append(list(hint_pages))
    tried += [list(range(s, s + width)) for s in range(2, min(12, n) + 1) if list(range(s, s + width)) != list(hint_pages or [])]
    best = (None, None, [], [])
    for pages in tried:
        pages = [p for p in pages if 1 <= p <= n]
        if not pages:
            continue
        words, lines = ocr_pages(pdf, pages, folder)
        score = similarity(baseline_words, words) if baseline_words else None
        if best[0] is None or (score is not None and score > best[0]):
            best = (score, pages, words, lines)
        if score is not None and score >= SAME_AT:
            break
    return best


def load_json(path, default):
    return json.loads(path.read_text()) if path.exists() else default


def compact_json(obj):
    txt = json.dumps(obj, ensure_ascii=False, indent=2)
    txt = re.sub(r'\[\s*\n\s*("(?:[^"\\]|\\.)*")(?:\s*,\s*\n\s*("(?:[^"\\]|\\.)*"))?(?:\s*,\s*\n\s*("(?:[^"\\]|\\.)*"))?(?:\s*,\s*\n\s*("(?:[^"\\]|\\.)*"))?\s*\n\s*\]',
                 lambda m: '[' + ', '.join(g for g in m.groups() if g) + ']', txt)
    txt = re.sub(r'\[\s*\n\s*((?:\d+,\s*\n\s*)*\d+)\s*\n\s*\]', lambda m: '[' + re.sub(r'\s*\n\s*', ' ', m.group(1)) + ']', txt)
    return txt + '\n'


def current_syllabi(nat):
    tb = [c for c in nat['curricula'] if c['code'] == 'eg-moe-textbooks'][0]
    return tb, [s for s in tb['syllabi'] if s.get('edition_status', 'current') == 'current' and s.get('source_url', '').startswith(STORAGE)]


def read_registry():
    return list(csv.DictReader(open(REGISTRY, encoding='utf-8-sig')))


def registry_sort_key(r):
    """Rows read from CSV hold strings; rows built from new links may hold ints. Compare as strings."""
    g = str(r.get('grade', '')).strip()
    return (int(g) if g else 99, str(r.get('term', '')), str(r.get('subject_guess', '')),
            str(r.get('folder_year', '')), str(r.get('file', '')))


def write_registry(rows):
    cols = ['grade', 'stage_label', 'term', 'folder_year', 'kind', 'subject_guess', 'file', 'url', 'status', 'published_in']
    rows.sort(key=registry_sort_key)
    with open(REGISTRY, 'w', newline='', encoding='utf-8-sig') as f:
        w = csv.DictWriter(f, fieldnames=cols)
        w.writeheader()
        for r in rows:
            w.writerow({c: r.get(c, '') for c in cols})


def registry_row(url, status, source):
    p = parse_link(url)
    g = p['grade']
    label = '' if g is None else (f'Primary {g}' if g <= 6 else (f'Preparatory {g - 6}' if g <= 9 else f'Secondary {g - 9}'))
    return dict(grade=g or '', stage_label=label, term=p['term'] or '', folder_year=folder_year(url)[0], kind=p['kind'],
                subject_guess=p['subject'], file=p['file'], url=url, status=status, published_in=source)


def impacted_lessons(topic_codes):
    hits = []
    for f in CONTENT.rglob('*.json'):
        if f.name == 'schema.json':
            continue
        text = f.read_text(errors='replace')
        found = sorted(c for c in topic_codes if c in text)
        if found:
            hits.append((str(f.relative_to(ROOT)), found))
    return hits


# ------------------------------------------------------------------ commands

def cmd_baseline(args):
    nat = json.loads(NATIONAL.read_text())
    _, syls = current_syllabi(nat)
    fps = load_json(FINGERPRINTS, {})
    for s in syls:
        url = s['source_url']
        if url in fps and not args.all:
            continue
        h = head(url)
        if h['status'] != '200':
            print(f'  dead link, skipped: {url} ({h["status"]})')
            continue
        with tempfile.TemporaryDirectory() as tmp:
            pdf = download(url, tmp)
            words, lines = ocr_pages(pdf, s.get('contents_pages') or [], tmp)
        fps[url] = dict(md5=h['md5'], etag=h['etag'], last_modified=h['last_modified'], length=h['length'], checked_on=TODAY,
                        academic_year=s.get('academic_year'), contents_pages=s.get('contents_pages'), contents_words=words, contents_lines=lines)
        print(f'  baseline: {s["name"]} ({len(words)} contents words)')
        FINGERPRINTS.write_text(json.dumps(fps, ensure_ascii=False, indent=1) + '\n')
    print(f'Baseline holds {len(fps)} books.')


def cmd_harvest(args):
    r = run(['gh', 'api', '-X', 'GET', 'search/code', '-f', 'q=elearnningcontent.blob.core.windows.net', '-f', 'per_page=100'])
    if r.returncode != 0:
        print('GitHub search unavailable:', r.stderr.strip()[:200])
        return
    items = json.loads(r.stdout).get('items', [])
    rows = read_registry()
    known = {x['url'] for x in rows}
    new = {}
    for it in items:
        sha = re.search(r'/blob/([0-9a-f]{40})/', it['html_url'])
        if not sha:
            continue
        raw = f"https://raw.githubusercontent.com/{it['repository']['full_name']}/{sha.group(1)}/{urllib.parse.quote(it['path'])}"
        body = run(['curl', '-sS', '-L', '--max-time', '40', raw]).stdout
        for u in re.findall(r'https?://elearnningcontent\.blob\.core\.windows\.net/[^\s"\'<>`)\]\\,]+', body):
            u = urllib.parse.unquote(u).rstrip('.')
            if u not in known:
                new.setdefault(u, set()).add(it['repository']['full_name'])
    for u, repos in sorted(new.items()):
        p = parse_link(u)
        status = 'unchecked'
        if p['grade'] and 2 <= p['grade'] <= 8:
            h = head(u)
            status = 'ok' if h['status'] == '200' else f'http {h["status"]}'
        rows.append(registry_row(u, status, '; '.join(sorted(repos))))
    write_registry(rows)
    print(f'Harvest: {len(items)} files searched, {len(new)} new links added to the registry.')


def ingest_incoming(rows):
    if not INCOMING.exists():
        return 0
    known = {r['url'] for r in rows}
    added = 0
    for line in INCOMING.read_text().splitlines():
        u = line.strip()
        if not u.startswith(STORAGE) or u in known:
            continue
        h = head(u)
        rows.append(registry_row(u, 'ok' if h['status'] == '200' else f'http {h["status"]}', 'supplied by project owner'))
        known.add(u)
        added += 1
    return added


def cmd_check(args):
    nat = json.loads(NATIONAL.read_text())
    _, syls = current_syllabi(nat)
    fps = load_json(FINGERPRINTS, {})
    rows = read_registry()
    added = ingest_incoming(rows)
    if added:
        write_registry(rows)
    results = []
    for s in syls:
        url = s['source_url']
        base = fps.get(url)
        entry = dict(syllabus=s['name'], subject=s['subject'], grade=s['grade_min'], term=s.get('term'),
                     academic_year=s.get('academic_year'), source_url=url, findings=[])
        # 1. Has the current book itself changed or disappeared?
        h = head(url)
        if h['status'] != '200':
            entry['findings'].append(dict(kind='source-dead', detail=f'HTTP {h["status"]}', action='Find the current link; book may have moved.'))
        elif base is None:
            entry['findings'].append(dict(kind='no-baseline', action='Run: python3 scripts/refresh_catalog.py baseline'))
        elif (h['md5'] or h['etag']) != (base.get('md5') or base.get('etag')):
            entry['findings'].append(dict(kind='modified-in-place', url=url, new_md5=h['md5'], last_modified=h['last_modified']))
        # 2. Is there a newer edition among published links?
        for cand in candidates_for(s, rows):
            entry['findings'].append(dict(kind='new-edition', url=cand, academic_year=folder_year(cand)[1]))
        # 3. Compare contents pages for anything that may have changed.
        for f in entry['findings']:
            if f['kind'] not in ('modified-in-place', 'new-edition') or not base:
                continue
            try:
                with tempfile.TemporaryDirectory() as tmp:
                    pdf = download(f['url'], tmp)
                    score, pages, words, lines = best_contents(pdf, base.get('contents_words'), base.get('contents_pages'), tmp)
                ch = head(f['url'])
                f.update(score=score, verdict=classify(score), contents_pages=pages, md5=ch['md5'], etag=ch['etag'],
                         last_modified=ch['last_modified'], length=ch['length'], contents_words=words, contents_lines=lines)
                old, new = set(base.get('contents_lines') or []), set(lines)
                f['removed_headings'] = sorted(old - new)[:25]
                f['added_headings'] = sorted(new - old)[:25]
            except Exception as e:  # report, never hide
                f.update(verdict='review', error=str(e))
        codes = [t[0] for t in s['topics']]
        if any(f.get('verdict') in ('changed', 'review') for f in entry['findings']):
            entry['impacted_lessons'] = impacted_lessons(codes)
        results.append(entry)

    REPORTS.mkdir(parents=True, exist_ok=True)
    report = dict(date=TODAY, thresholds=dict(same=SAME_AT, changed=CHANGED_AT), incoming_links_added=added, results=results)
    jpath = REPORTS / f'{TODAY}.json'
    jpath.write_text(json.dumps(report, ensure_ascii=False, indent=1) + '\n')
    (REPORTS / f'{TODAY}.md').write_text(render_report(report))
    actions = [(r, f) for r in results for f in r['findings']]
    print(f'Checked {len(results)} books; {len(actions)} finding(s). Report: {jpath.relative_to(ROOT)}')
    for r, f in actions:
        print(f"  - {r['syllabus']}: {f['kind']}" + (f" -> {f.get('verdict')} ({f.get('score')})" if 'verdict' in f else ''))
    if args.strict and actions:
        sys.exit(2)


VERDICT_TEXT = {'same': 'Same contents page: republished. Safe to carry forward.',
                'changed': 'Contents changed: re-extract this book.',
                'review': 'Unclear: a person must compare the contents pages.'}


def render_report(rep):
    out = [f"# Curriculum refresh report, {rep['date']}", '',
           f"Thresholds: similarity >= {rep['thresholds']['same']} is the same structure; <= {rep['thresholds']['changed']} is changed; in between needs review.", '']
    rows = [(r, f) for r in rep['results'] for f in r['findings']]
    if not rows:
        out += ['**No changes found.** Every current book matches its stored fingerprint, and no newer editions are published yet.', '']
    else:
        out += ['| Book | Finding | Verdict | Similarity | Link |', '|---|---|---|---|---|']
        for r, f in rows:
            link = f.get('url', r['source_url'])
            out.append(f"| {r['syllabus']} | {f['kind']} | {f.get('verdict', '')} | {f.get('score', '')} | `{link.rsplit('/', 1)[-1]}` |")
        out.append('')
        for r, f in rows:
            if f.get('verdict') in ('changed', 'review') or f['kind'] in ('source-dead', 'no-baseline'):
                out += [f"## {r['syllabus']}: {f['kind']}", VERDICT_TEXT.get(f.get('verdict'), f.get('action', '')), '']
                if f.get('removed_headings'):
                    out += ['Headings no longer found:'] + [f'- {x}' for x in f['removed_headings']] + ['']
                if f.get('added_headings'):
                    out += ['New headings:'] + [f'- {x}' for x in f['added_headings']] + ['']
                if r.get('impacted_lessons'):
                    out += ['Lessons that cite this book\'s topics (send to the grade teacher and head of department):'] + [f'- `{p}`: {", ".join(c)}' for p, c in r['impacted_lessons']] + ['']
    out += ['## Next steps',
            '- `same` new editions: `python3 scripts/refresh_catalog.py carry-forward ' + f"data/catalog/refresh/{rep['date']}.json` adds the new edition and supersedes the old one.",
            '- `changed` or `review`: re-extract with the `curriculum-data-engineer` agent (see docs/catalog/refresh.md), then rebuild and test.',
            '- Always finish with `npm run build:catalog && npm run test:catalog`.', '']
    return '\n'.join(out)


def cmd_carry_forward(args):
    rep = json.loads(pathlib.Path(args.report).read_text())
    nat = json.loads(NATIONAL.read_text())
    tb, _ = current_syllabi(nat)
    fps = load_json(FINGERPRINTS, {})
    applied = 0
    for r in rep['results']:
        for f in r['findings']:
            if f.get('verdict') != 'same':
                continue
            old = next(s for s in tb['syllabi'] if s['source_url'] == r['source_url'] and s.get('edition_status', 'current') == 'current')
            if f['kind'] == 'modified-in-place':
                fps[old['source_url']].update(md5=f['md5'], etag=f['etag'], last_modified=f['last_modified'], checked_on=rep['date'])
                applied += 1
                continue
            if any(s['source_url'] == f['url'] for s in tb['syllabi']):
                continue
            new = {k: v for k, v in old.items() if k not in ('edition_status', 'note')}
            new.update(academic_year=f['academic_year'], source_url=f['url'], contents_pages=f['contents_pages'],
                       note=f"Carried forward from the {old.get('academic_year')} edition on {rep['date']}: contents page matched (similarity {f['score']}).")
            old['edition_status'] = 'superseded'
            tb['syllabi'].append(new)
            fps[f['url']] = dict(md5=f['md5'], etag=f['etag'], last_modified=f['last_modified'], length=f['length'], checked_on=rep['date'],
                                 academic_year=f['academic_year'], contents_pages=f['contents_pages'],
                                 contents_words=f['contents_words'], contents_lines=f['contents_lines'])
            applied += 1
            print(f"  carried forward: {old['name']} {old.get('academic_year')} -> {f['academic_year']}")
    tb['syllabi'].sort(key=lambda s: (s['grade_min'], s['subject'], s.get('term') or 0, s.get('academic_year') or ''))
    NATIONAL.write_text(compact_json(nat))
    FINGERPRINTS.write_text(json.dumps(fps, ensure_ascii=False, indent=1) + '\n')
    print(f'Applied {applied} safe update(s). Now run: npm run build:catalog && npm run test:catalog')


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest='cmd', required=True)
    b = sub.add_parser('baseline'); b.add_argument('--all', action='store_true', help='recompute every book, not only missing ones')
    sub.add_parser('harvest')
    c = sub.add_parser('check'); c.add_argument('--strict', action='store_true', help='exit 2 when anything needs attention')
    cf = sub.add_parser('carry-forward'); cf.add_argument('report')
    args = ap.parse_args()
    for tool in ('curl', 'pdftoppm', 'pdfinfo', 'tesseract'):
        if args.cmd in ('baseline', 'check') and not shutil.which(tool):
            sys.exit(f'Missing required tool: {tool} (see docs/catalog/refresh.md)')
    {'baseline': cmd_baseline, 'harvest': cmd_harvest, 'check': cmd_check, 'carry-forward': cmd_carry_forward}[args.cmd](args)


if __name__ == '__main__':
    main()
