# Curriculum Refresh Runbook

Curricula change on different clocks. This runbook keeps the catalog current without redoing everything every year: detect what changed, re-process only that, keep every edition.

## How often each system changes

| System | What changes | Check |
|---|---|---|
| Egyptian MOE (Arabic, religion, social studies, Discover) | Books are republished every year (Term 1 around August, Term 2 around January). Content changes in reform waves; the Ministry reported redeveloping Arabic, religion, and social studies curricula in November 2026. | Every term: **late August** and **late January** |
| French programmes | New maths programmes phase in one class per year until 2028 (cycle 2 from 2025, cycle 3 from 2025 and 2026, cycle 4 from 2026 to 2028). | Every **September** until 2028, then yearly |
| American (CCSS, NGSS) | Stable since 2010 and 2013 at the national level; individual states revise. | Once a year |
| IB (PYP, MYP) | Subject reviews on a multi-year cycle, announced in advance. | Once a year, against IB announcements |

## The national pipeline: `scripts/refresh_catalog.py`

Requirements: `curl`, poppler (`pdftoppm`, `pdfinfo`), Tesseract with Arabic (`tesseract-ocr`, `tesseract-ocr-ara`), Python Pillow.

### How it decides
1. **Fingerprint (free).** A header request to the Ministry storage returns `Content-MD5`, `ETag`, and `Last-Modified`. Unchanged fingerprint means the book is unchanged.
2. **New editions.** It looks in the link registry for the same grade, term, subject, and Arabic edition in a newer year folder (for example `2026_2027` after `2026`). It never guesses file names.
3. **Contents comparison (only when something changed).** It downloads the book, OCRs the contents page, and compares it with the stored contents text:
   - similarity **0.80 or more**: same structure (republished); safe to carry forward
   - **0.55 or less**: structure changed; re-extract
   - in between: a person compares the two contents pages

   Calibration (2026-11-25): the same book across 2025/2026 and 2026/2027 scored 0.92; different books on the same template scored 0.42 to 0.48; different subjects scored 0.07.
4. **Impact.** For changed books, it lists lessons in `content/` that cite the book's topic codes, so the grade teacher and head of department can review them.

### Commands
```bash
python3 scripts/refresh_catalog.py harvest        # find newly published Ministry links
python3 scripts/refresh_catalog.py check          # detect changes; writes data/catalog/refresh/<date>.md and .json
python3 scripts/refresh_catalog.py carry-forward data/catalog/refresh/<date>.json   # apply safe results
npm run build:catalog && npm run test:catalog     # always finish with these
```
`baseline` stores fingerprints and contents text for current books; it runs automatically for any book missing from `data/catalog/sources/fingerprints.json`.

### Adding links by hand
Paste Ministry links, one per line, into `data/catalog/sources/incoming-links.txt`. The next `check` adds them to the registry and treats them like any other published link.

### When a book changed
1. Give the book to the `curriculum-data-engineer` agent with the extraction brief used before: verify the cover, read the contents page as an image, transcribe exactly, translate faithfully, skip generic items.
2. Add the new edition to `data/catalog/curricula/national.json` with `academic_year`, `term`, `source_url`, and `contents_pages`; set the old edition's `edition_status` to `superseded`. Never delete the old edition.
3. Run `python3 scripts/refresh_catalog.py baseline` to fingerprint the new edition.
4. Rebuild and test. Send impacted lessons to the grade teacher and head of department.

## Editions in the database
`syllabi.edition_status` is `current` or `superseded` (migration 0005). The catalog views show current editions only; `syllabus_editions` lists every edition. The database refuses two current editions of the same syllabus.

## Other systems
- **French:** each September, check the Bulletin officiel calendar for the classes that switch programme, update `data/catalog/curricula/french.json`, and record sources and dates.
- **American and IB:** once a year, check for announced revisions; record the check in the curriculum's `verified` block even when nothing changed.
