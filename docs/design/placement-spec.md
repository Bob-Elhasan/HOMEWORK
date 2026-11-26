# Placement spec: a one-strand starting point

Status: **draft for the council blocker** (owner `assessment-specialist`, with `learning-analytics-scientist`). Written 2026-11-25.
Implements the placement parts of the decision in [`docs/school/council/2026-11-25-onboarding-voice-flow.md`](../school/council/2026-11-25-onboarding-voice-flow.md). Where this spec and [`onboarding-voice-flow.md`](onboarding-voice-flow.md) disagree, this spec wins on placement (the flow doc's step 5, "starts at the current grade" and "a starting estimate for each skill", is replaced by this spec).

All numbers marked **(target)** or **(working value)** are our own choices, to be confirmed or changed after the pilot. None of them comes from published research.

---

## 1. What placement is, and what it is not

**It is:** a short check that gives one **starting point** for one **placement strand** in one subject: the grade level of work the tutor should start with in that strand. The result is one of three bands, `below`, `at`, or `above` grade, plus a confidence.

**It is not:**
- Per-skill mastery. Placement never writes to the mastery model, never marks a skill mastered, and never marks a skill as not known. The mastery model (`learning-analytics-scientist`) may use the starting point only as a starting assumption for lessons in that strand.
- A test. The child never sees a score, a level, a right or wrong mark, or a comparison with anyone. The parent sees a "starting point" label (section 8).
- A placement for other strands or subjects. Strands with no placement start with the mastery model's default.

**Known limit (from the council dissent):** five or fewer items lean low. Two rules reduce this: the item-4 rule (section 5) and the re-checks in sessions 2 and 3 (section 9). Re-checks also make upgrades easier than downgrades (section 9.3).

---

## 2. Terms

| Term | Meaning |
|---|---|
| `G` | The child's grade (2 to 8), from parent setup. |
| Level | The grade whose content an item tests, as an integer. Level 0 is KG (used only as the grade 2 floor); level 9 is the year after grade 8 (used only as the grade 8 ceiling). |
| Floor | `G - 2`. The lowest level used for this child. |
| Ceiling | `G + 1`. The highest level used for this child. |
| Placement strand | A vertical strand that runs across levels (for example "Number and operations" in American math). Defined in a strand map (section 3), not taken straight from the catalog `strand` column. |
| Scored item | An item whose outcome is evidence. At most 5 per placement. |
| Closing item | An unscored item at the end whose only job is to end on a win (section 5.4). |
| Outcome | One of `correct`, `wrong`, `dont_know`, `no_evidence` (section 6). |
| Miss | A `wrong` or `dont_know` outcome. Used for routing. |

---

## 3. Placement strands and the catalog

The catalog export (`data/catalog/export/curriculum_topics_by_grade.csv`) cannot be used directly as the placement strand, because its `strand` column means different things per system:

| System | What `strand` holds today | Problem for placement |
|---|---|---|
| American, CCSS math | The CCSS domain, for example "Operations and Algebraic Thinking", "Number and Operations in Base Ten" | Domains change across grades (Base Ten and Fractions end at grade 5; "The Number System", "Ratios and Proportional Relationships", "Expressions and Equations" start at grade 6). One level below grade 6 has no "Ratios" domain. |
| American, NGSS science | Discipline, for example "Physical Science", "Life Science" | Grades 6 to 8 share one middle school band; the catalog repeats the same topics for 6, 7, and 8, so "at" and "above" cannot be told apart from the catalog alone. |
| IB (PYP) | The literal word "Strand"; the real strand name is in `topic` ("Number", "Data handling") | Needs remapping. |
| French | The programme domain, for example "Nombres, calcul et résolution de problèmes" (cycle 2), "Nombres et calculs" (cycle 4) | Names change between cycles; science is per cycle, not per year. |
| National (MOE) | Unit titles, for example "الوحدة الأولى: أخلاقي تصنع عالمي" | Thematic units per term, not progression strands. For Arabic, the topic code suffix gives a usable strand: `-R` reading, `-G` grammar, `-S` spelling, `-W` writing. |
| British | No rows in the current export | No placement possible until catalog rows exist. |

**Requirement:** a strand map file, proposed as `data/catalog/placement-strands.json`, owned by `curriculum-data-engineer` with `international-curriculum-specialist` and the subject specialists, approved by the head of department (HoD) for each subject. Each entry lists, per level, the catalog `topic_code`s that belong to the strand.

```json
{
  "key": "math.number",
  "subject": "math",
  "system": "american",
  "label": { "en": "Number and operations", "ar": "الأعداد والعمليات" },
  "levels": {
    "3": ["3.OA.A", "3.OA.B", "3.OA.C", "3.OA.D", "3.NBT.A", "3.NF.A"],
    "4": ["4.OA.A", "4.NBT.A", "4.NBT.B", "4.NF.A", "4.NF.B", "4.NF.C"],
    "5": ["5.NBT.A", "5.NBT.B", "5.NF.A", "5.NF.B"],
    "6": ["6.NS.A", "6.NS.B", "6.NS.C", "6.RP.A"]
  },
  "approved_by": { "reviewer": "", "date": "" }
}
```

The codes above are an illustration of the shape, not the approved map. Whether ratio and fractions sit in "Number" or in their own strand is the math specialist's call.

**Rules for the map:**
- Every level from floor to ceiling for every grade served must have at least one topic code, or placement is turned off for that (system, strand, grade).
- Religion subjects are never placed. Placement for v1 runs only where a strand map entry and a full item bank exist (section 10).

---

## 4. Which strand, by age band

**Grades 2 to 3 (placement first, before any lesson):**
1. Subject: from the parent's note if it names one, else Math.
2. Strand: from the parent's note if it maps to a strand (for example "struggling with subtraction"), else the subject's default strand in the strand map (`default: true`, normally Number).
3. `strand_source` is stored as `parent_note` or `default`.

**Grades 4 to 8 (topic and mini-lesson first):**
1. The child picks a topic; the companion asks if it is unclear (flow doc). The topic maps to a catalog `topic_code`.
2. Strand: the placement strand that contains that `topic_code` at any level.
3. If the topic maps to no strand, or the strand has no complete item bank for this system and grade, use the subject's default strand; if the subject has none (for example a religion topic), use Math's default strand. The companion says so honestly ("One quick check in math so I know where to start").
4. `strand_source` is `chosen_topic` or `default`.

---

## 5. Item selection (session 1)

### 5.1 Rules
- **R1, start:** the first scored item is at level `G - 1`.
- **R2, two misses step down:** two misses at the current level (counted since arriving at that level, not necessarily in a row) move the next item down one level and reset the miss count. At the floor, two misses **stop** the scored items.
- **R3, item-4 rule:** if items 1, 2, and 3 are all `correct`, item 4 is at level `G`. For grades 4 to 8 only, item 4 is at `G + 1` instead when the mini-lesson signal is strong: the lesson's level is `G` or higher and every lesson question was done with hint level 0.
- **R4, step up before item 5:** item 5 goes up one level (never above the ceiling) when every scored item at the current level was `correct`, or when the current level's evidence `e(L)` (section 7) is 2 or more. R4 never moves back up into a level where the child already has two misses (so a child who stepped down is not sent straight back to the level that was hard).
- **R5, maximum:** at most 5 scored items. Items with `no_evidence` do not count toward the 5.
- **R6, end on a win:** see 5.4.
- **R7, early stop:** stop the scored items (then go to the closing item) when: the time budget is used (5.5), the child asks to stop, the distress script in `docs/safety/` is triggered, or two items in a row get no response at all even after the tap offer.

When R2 and R3 or R4 both apply, R2 wins (a step down is never overridden by a step up on the same item).

### 5.2 Picking an item within a level
1. Candidates: published items for (system, subject, strand, level), excluding any item this child has seen before (any session, any year).
2. Grades 4 to 8: exclude items whose `source_outcomes` overlap the mini-lesson's `source_outcomes`, so the check does not just measure what was taught two minutes ago. If this empties the list, allow them and set `lesson_overlap = true` on the response.
3. Do not give two items in a row with the same `source_outcomes`.
4. Among the rest, pick the item with the lowest exposure count; break ties at random.
5. If no candidate is left, stop the scored items and set `ended_early_reason = bank_exhausted` (this is a bank defect; it should be alerted to content staff).

### 5.3 Pseudocode

```
level      = G - 1
floor      = G - 2
ceiling    = G + 1
misses     = 0        # misses at current level since arriving
scored     = []       # list of (level, outcome)

while len(scored) < 5 and not early_stop():
    n = len(scored)
    if n == 3 and all(o == correct for _, o in scored):
        level  = G + 1 if (band_4_8 and strong_lesson_signal) else G
        misses = 0
    elif n == 4 and step_up_allowed(level, scored) and level < ceiling:
        level  = level + 1
        misses = 0

    item    = pick_item(level)
    outcome = administer(item)          # loops on no_evidence (section 6.2)
    if outcome == no_evidence_exhausted: count_no_response(); continue
    scored.append((level, outcome))

    if outcome in (wrong, dont_know):
        misses += 1
        if misses >= 2:
            if level == floor: break    # stop at floor
            level  = level - 1
            misses = 0

closing_item()                          # section 5.4
estimate = compute_estimate(scored, lesson_signal)   # section 7
```

`step_up_allowed(level, scored)` is true when (every scored item at `level` is `correct` and there is at least one, or `e(level) >= 2`) and `level + 1` has fewer than two misses so far.

### 5.4 Ending on a win
- **Grades 2 to 3:** the last item is **always** a closing item: a picture from this week's book in the placement subject (how we know the week is open question 2). It is low demand ("What do you see happening here?", "Point to the..."), and the tutor scaffolds with the item's hints until the child succeeds, without ever saying the answer. It is **unscored** in this spec, because its level is not controlled and the class has just studied it. Its outcome is stored as an observation only. (Whether it should be scored is open question 1.)
- **Grades 4 to 8:** if the last scored item was `correct`, no closing item is needed. Otherwise give one closing item, unscored, from the closing pool at level `max(floor, start_level - 1)`, scaffolded to success the same way.
- The companion's reaction to every placement answer, right or wrong, is the same warm line ("Thanks, that helps me know where to start"). It **never says the correct answer** and never says "wrong" or "right". The answer key stays on the server (section 11).

### 5.5 Time budget
- Grades 2 to 3: placement, including the closing item, uses at most **4 minutes (target)** of the 8-minute child part.
- Grades 4 to 8: at most **5 minutes (target)** of the 15-minute child part.
- When the budget runs out, the current item finishes, then the closing item runs. `ended_early_reason = time`.

---

## 6. Scoring each answer

### 6.1 Outcome classes and weights

| Outcome | When | Routing (R2) | Evidence weight in `e(L)` |
|---|---|---|---|
| `correct` | Answer matches the key or rubric | not a miss | +1 |
| `wrong` | A clearly heard or tapped answer that does not match | miss | -1 |
| `dont_know` | The child says "I don't know" (any language, any phrasing the NLU recognises) or taps the "I don't know" button | miss | -0.5 |
| `no_evidence` | See 6.2 | ignored | 0, not counted as a scored item |

Why `dont_know` is a miss for routing but weighs half for the estimate: for routing we care about the child's comfort, so a child who says "I don't know" twice gets an easier item. For the estimate, "I don't know" from a shy 7-year-old or a teen who does not want to look wrong is weaker evidence than an actual wrong answer. The 0.5 is a **working value** to calibrate in the pilot.

### 6.2 Misheard or low-confidence speech is never evidence
An answer is `no_evidence` when any of these is true:
- Speech recognition confidence is below the threshold set by `voice-engineer` per language and age band (`reason = low_confidence`).
- The heard text does not map to any response option or rubric category (`reason = unparsed`).
- The child taps "That's not what I said" on the caption of what was heard (`reason = child_corrected`). The caption of the heard answer is shown after **every** voice answer, so the child cannot learn that the caption means "wrong".
- No answer within the wait time, even after one re-prompt (`reason = silence`).
- Background noise or overlapping speech is detected (`reason = noise`).

Handling:
1. First `no_evidence` on an item: the companion says "I didn't quite catch that. Can you tap it?" and shows the item's tap form. The **same item** stays open.
2. Second `no_evidence` on the same item: tap only for that item.
3. After three `no_evidence` events in the session: the rest of placement is tap-first (voice still accepted).
4. Silence on two items in a row, even with the tap form: early stop (R7), closing item, `ended_early_reason = no_response`.
5. The child is never told "I can't understand you" (flow doc).

`no_evidence` is never converted into a miss later, by any rule or model.

### 6.3 Mini-lesson hint level (grades 4 to 8 only)
The validated mini-lesson from `content/` runs before placement. For each lesson question, the hint level `h` is the number of hints used (0 to 3; "tutor walked through the smallest step" counts as 3). Map each question to a value and take the mean:

| `h` | Value |
|---|---|
| 0 (done alone) | +0.5 |
| 1 | +0.25 |
| 2 | 0 |
| 3 | -0.25 |

The mean, called `lesson_signal`, is added to `e(L)` at the lesson's level `L = lesson.grade`, capped between -0.5 and +0.5. It is less than one item by design. It cannot make a level "secure" on its own (section 7 needs at least one correct scored item). These values are **working values**.

Grades 2 to 3 have no mini-lesson before placement, so `lesson_signal` is null.

---

## 7. Turning answers into an estimate

For each level `L` with scored items: `c(L)` = count correct, `w(L)` = count wrong, `d(L)` = count "I don't know".

```
e(L) = c(L) - w(L) - 0.5 * d(L) + (lesson_signal if L == lesson level else 0)
secure(L) = c(L) >= 1 and e(L) >= 1
```

- **`start_level`** = the highest tested level that is secure. If none is secure: the lowest tested level, with `floor_reached = true`.
- **`band`** = `below` if `start_level < G`, `at` if `start_level == G`, `above` if `start_level > G`.
- **`confidence`** in session 1 is `low` or `medium`, never `high`:
  - `medium` when all of these hold: at least 4 scored items; at most 1 `no_evidence` event; no early stop; band is not `above`; `start_level + 1` was tested and is not secure, or `start_level` is the ceiling; and either `c(start_level) >= 2` or `start_level - 1` is secure.
  - `low` otherwise. An `above` result from session 1 is always `low`.
  - `high` is only reachable through the re-checks (section 9).

### 7.1 Worked examples (grade 4, so levels 2 to 5)

| Path (level: outcome) | Closing item | start_level | band | confidence |
|---|---|---|---|---|
| 3: C, C, C; 4: C; 5: W | yes, level 3 | 4 | at | medium |
| 3: C, W, W; 2: C, C | no | 2 | below | medium |
| 3: C, DK, C, C (e = 2.5, so R4 steps up); 4: W | yes, level 2 | 3 | below | medium |
| strong lesson signal; 3: C, C, C; 5: C, C | no | 5 | above | low |
| 3: W, W; 2: W, DK (stop at floor) | yes, level 2 | 2 | below | low, `floor_reached` |

C = correct, W = wrong, DK = "I don't know".

For grade 2 the levels are 0 to 3, and the closing item is always the book picture.

---

## 8. Output

### 8.1 Stored record (one row per child, subject, strand)
Table proposed as `strand_placements`. `backend-engineer` writes it as the next numbered migration, with RLS (a parent can read only their own children's rows; children's clients never read answer keys).

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | |
| `child_id` | uuid | FK to children |
| `subject` | text | `math`, `science`, `arabic`, ... |
| `curriculum_system` | text | `american`, `ib`, `french`, `national`, ... |
| `placement_strand` | text | key from the strand map |
| `strand_source` | text | `chosen_topic`, `parent_note`, `default` |
| `grade_at_placement` | int | 2 to 8 |
| `start_level` | int | 0 to 9 |
| `band` | text | `below`, `at`, `above` (derived from `start_level` and grade) |
| `confidence` | text | `low`, `medium`, `high` |
| `status` | text | `provisional` (sessions 1 to 2), `settled` (after session 3) |
| `floor_reached` | bool | |
| `ended_early_reason` | text, null | `time`, `child_stop`, `distress`, `no_response`, `bank_exhausted` |
| `scored_items` | int | |
| `no_evidence_events` | int | |
| `lesson_signal` | numeric, null | grades 4 to 8 |
| `algorithm_version` | text | so results can be re-scored when rules change |
| `item_bank_version` | text | |
| `created_at`, `updated_at`, `settled_at` | timestamptz | |

Per-item log, proposed as `placement_responses`: `placement_id`, `session_number` (1 to 3), `item_id`, `level`, `role` (`scored`, `closing`, `recheck`), `outcome`, `no_evidence_reason`, `input_mode` (`voice`, `tap`), `lesson_overlap`, `created_at`. **No audio, no transcript, no free-text answer** is stored; only the item id and the outcome class. Changes to the estimate go to `placement_changes`: `from_level`, `to_level`, `reason`, `session_number`.

The raw response log is kept so that `learning-analytics-scientist` can re-score with a better model later without asking children again. Retention is set by `security-privacy-engineer`.

### 8.2 What the parent sees
A "starting point" card, never a score:
- Wording pattern (final copy by `product-designer`, checked against `docs/school/ethics-checklist.md`): "Starting point in {strand label}: Ibi is starting with {school grade word, e.g. Primary 3} work. This comes from a short check, not a test. Ibi will check it again over the next two sessions."
- The band is shown as the grade of work, using the school's grade words, not as "below grade". This is an estimate from five items or fewer; it must not read as a verdict.
- Confidence in plain words: `low` and `medium` show "early estimate"; `high` shows "checked over three sessions". No percentages, no item counts, no comparison with other children.
- Item content and per-item outcomes are not shown to the parent (it would expose items and invite coaching).

### 8.3 What the child sees
Nothing about levels or results. The child sees "Things you figured out" per the council decision, built from logged events only.

---

## 9. Re-checks in sessions 2 and 3

### 9.1 When and how
- 2 to 3 **new** items (never seen by this child) on the same placement strand, at the **start** of sessions 2 and 3, framed as a warm-up ("Two quick ones to warm up"), never as a test.
- Same scoring rules as section 6, including `no_evidence` and the tap retry.
- Grades 2 to 3: at most 2 items per session (working value), and the warm-up still ends on a win (closing item if the last was a miss).
- If session 2 or 3 is in a different subject, the re-check still runs on the placed strand (it is short). If the child does not return within 30 days (working value), the next session runs a fresh 3-item re-check and the counting restarts from that session.

### 9.2 Which levels
Session 2:
1. Item A at `start_level` (likely win first).
2. Item B at `start_level + 1` (or at `start_level` if it is the ceiling). This is the probe that counters the low lean.
3. Item C only if B was `correct`: another item at `start_level + 1`, so an upgrade can happen in session 2.

Session 3, aimed at the boundary that is still open:
- If session 2 suggested up (B correct): two items at `start_level + 1` (after any upgrade, `start_level + 1` of the new level).
- If session 2 agreed (A correct, B missed): one at `start_level + 1`, one at `start_level`.
- If session 2 suggested down (A missed): one at `start_level`, one at `start_level - 1` (not below the floor).

### 9.3 How strong evidence overrides the placement
After each re-check, pool all scored evidence from sessions 1 to 3 (re-check items plus session 1 items) and apply:

- **Upgrade:** at least 2 `correct` re-check items at `start_level + 1`, and pooled `e(start_level + 1) >= 2`. Then `start_level` goes up one, never above the ceiling.
- **Downgrade:** at least 2 `wrong` re-check items at `start_level` (`dont_know` does not count toward these 2), and pooled `e(start_level) <= -1`. Then `start_level` goes down one, never below the floor.
- At most one level of change per session.
- Upgrades are deliberately easier than downgrades, because the short check is known to lean low and a shy "I don't know" should not push a child down.
- Hint levels from ordinary lessons in sessions 2 and 3 on this strand add to `e(L)` at the lesson's level with the same mapping as 6.3, capped at 0.5 per session. They can never trigger a change on their own.
- Every change is logged in `placement_changes` and updates the parent card ("Ibi moved the starting point to Primary 4 work after more practice").

**Confidence after session 3:** `high` if no change happened in session 3 and at least 75% (working value) of at least 4 re-check items agree with the final `start_level` (agree means `correct` at or below it, a miss above it). Otherwise `medium`. Then `status = settled`.

**After settling:** the placement is frozen and kept as history. Later evidence goes only to the per-skill mastery model, which owns everything from here. A parent or teacher who says "my child is ahead / behind in this" does not overwrite the placement; it triggers one extra 3-item re-check at the suggested level, scored with the same rules.

---

## 10. Item bank requirements

### 10.1 How many items
Per (system, subject, placement strand, level), for every level from the floor of the lowest grade served to the ceiling of the highest:

| Pool | Launch minimum | Target | Why |
|---|---|---|---|
| Scored and re-check items | 12 published | 20 | One child can see up to about 9 items at one level across sessions 1 to 3 (up to 5 in session 1, up to 3 in each re-check); siblings, retakes in a new school year, and exposure control need more. |
| Closing-win items | 6 | 10 | Low-demand items with full hint ladders, used for 5.4. |
| Book-picture items (grades 2 to 3) | 2 per catalog lesson for the placement subject | 3 | One per week is needed; the spare avoids repeats for siblings. |

These counts are **targets**, set from the exposure arithmetic above, and will be revised after item analysis. A (system, strand, grade) combination with fewer than the launch minimum at any of its four levels does not run placement; it falls back as in section 4.

Items in a level should spread across the topic codes the strand map lists for that level, not cluster on one.

For the pilot, scope the bank to the pilot schools' systems and one or two strands per subject, rather than the whole catalog.

### 10.2 Authoring and review
1. **Authored by teachers** (school staff for that subject and grade).
2. **Reviewed by the HoD** for the subject: correct level, correct key, fits the strand.
3. **Checked by `assessment-specialist`:** one correct answer (or a clear rubric), plausible distractors drawn from known misconceptions, clear stem, no cue to the answer, no reading load beyond the level for non-reading strands, culturally fair, and a tap form that is equivalent to the voice form.
4. **Arabic items:** `arabic-language-specialist` checks MSA wording; `arabic-nlp-engineer` checks that likely spoken answers map correctly.
5. Status `draft`, `in-review`, `published`, `retired`, as for lessons.

### 10.3 Never reused as lesson questions
- Placement item ids use their own prefix (`pl.`) and live in their own folder, `content/placement/`.
- `scripts/validate-content.mjs` should fail if a placement item's stem or answer key matches, or is a near copy of, any lesson `think_prompt` or `answer_key` in `content/`, and the reverse. Exact matching first; a near-copy check (normalised text similarity) is a follow-up for `curriculum-data-engineer`.
- Lesson authors must not take items from the placement bank, and once an item has been used for placement it is never moved into a lesson.

### 10.4 Proposed JSON shape
For `curriculum-data-engineer` to turn into `content/placement-item.schema.json`. As in the lesson schema, answer keys are private and never sent to the child's device.

```json
{
  "id": "pl.ma.us.number.l3.0007",
  "kind": "scored",
  "curriculum_system": "american",
  "subject": "math",
  "placement_strand": "math.number",
  "level": 3,
  "source_outcomes": ["3.NBT.A"],
  "language": "en",
  "stem": {
    "say": "A shop has 4 boxes with 10 pencils in each, and 6 loose pencils. How many pencils is that?",
    "caption": "4 boxes of 10 pencils and 6 loose pencils. How many pencils?",
    "image": { "id": "img.pencils-boxes", "license": "own", "alt": "Four boxes of ten pencils and six loose pencils" }
  },
  "response": {
    "type": "choice",
    "choices": [
      { "id": "a", "label": "46" },
      { "id": "b", "label": "410" },
      { "id": "c", "label": "64" },
      { "id": "d", "label": "20" }
    ],
    "voice_accept_hint": "number"
  },
  "answer_key": { "choice": "a", "spoken": ["46", "forty-six", "ستة وأربعين"] },
  "distractor_rationale": [
    { "choice": "b", "misconception": "Writes tens and ones side by side without place value" },
    { "choice": "c", "misconception": "Swaps tens and ones" },
    { "choice": "d", "misconception": "Adds the visible numbers 4, 10, and 6" }
  ],
  "hints": [],
  "estimated_seconds": 40,
  "status": "in-review",
  "author": "teacher-id",
  "hod_review": { "reviewer": "", "date": "" },
  "assessment_review": { "reviewer": "", "date": "" },
  "version": 1
}
```

Field rules:
- `kind`: `scored` (used for session 1 and re-checks), `closing`, or `book_picture`.
- `response.type`: `choice`, `number`, `short_text` (rubric scored), or `tap_region` (point on a picture). Every item must have a tap-answerable form; `short_text` items need a `choices` fallback for tap.
- `hints`: empty for `scored` items (no hints during scored placement); exactly 3 for `closing` and `book_picture` items, used to scaffold to a win without giving the answer.
- `book_picture` items add `catalog_topic_code` (the lesson of the week) and use `level = G`.
- Exposure counts and item statistics are kept in the database, not in the content file.

---

## 11. Safety, privacy, and the never-answer rule
- Scoring runs on the server. The device sends the choice id or the recognised text; the key never reaches the device.
- The companion never reveals the correct answer to a placement item, including after a wrong answer. Closing items reach the win through hints only.
- No audio, transcript, or free text is stored for placement (section 8.1). Only outcome classes.
- The parent being nearby (grades 2 to 3) can help, but a parent answering for the child would corrupt the estimate. The parent hand-off screen should say "Stay close, and let {name} answer, even 'I don't know'." Detection of adult answers is not attempted (open question 6).
- `child-development-specialist` reviews the reaction lines and the closing-item scaffolding for grade 2.

---

## 12. Validation plan (pilot)

The pilot compares the placement with an independent point of comparison. It is **not** a learning-gain study, and no learning gain will be claimed from it.

### 12.1 Comparison points
1. **Teacher judgment (primary).** For each pilot child, their class teacher places the child on the same strand as `below`, `at`, or `above` grade, using a short anchored description per band written by the HoD. The teacher records this **before** seeing our result, and our result is not shown to the teacher until the pilot ends. For a subset of children (target: about a quarter), a second teacher who knows the child also rates them, so we know how far two teachers agree. Teacher agreement is the realistic ceiling for our agreement; teacher judgment is not the truth.
2. **Delayed strand check (secondary).** In week 2 to 3, after session 3: a fixed 12-item check on the strand (4 items each at `G - 1`, `G`, `G + 1`), all new items not in the placement bank and not in any lesson, tap-first to remove speech recognition as a factor, with an adult supervising. Its band comes from a cut rule written down before the data comes in.

### 12.2 What we report
- Sample size per grade band, system, and subject, and how many children dropped out before session 3.
- A 3 by 3 table of our band against each comparison point.
- Exact agreement, agreement within one band, and weighted kappa, each with a 95% confidence interval.
- Direction of disagreement: how often we are lower than the comparison and how often higher (checks the known low lean).
- Session 1 only versus after session 3, to see whether re-checks help.
- Splits by grade band (2 to 3, 4 to 5, 6 to 8), input mode (mostly voice versus mostly tap), lesson language, and `no_evidence` rate, to catch bias, for example voice users placed lower because of recognition errors.
- Item analysis: proportion correct per item among children at the item's intended level, and how well each item separates children the comparison puts in different bands. Items far outside the expected range, or that do not separate, are flagged for HoD review. Item statistics are not trusted until an item has about 30 responses (working rule).

### 12.3 Success threshold (**target to confirm**)
I am proposing the following threshold. The council record does not write a number down, so it must be confirmed with `learning-analytics-scientist`, `product-manager`, and the council before the pilot starts:
- After session 3, exact band agreement with teacher judgment of **at least 70% (target)**.
- Agreement within one band of **at least 95% (target)**.
- Gross disagreement (we say `above`, teacher says `below`, or the reverse) **2% or less (target)**.
- We place lower than the teacher in **no more than 25% of children (target)**.

How precise this can be: with 60 children, an observed 70% agreement has a 95% interval of roughly plus or minus 12 percentage points (normal approximation). A small pilot can show the placement is roughly sensible or clearly not; it cannot prove the threshold is met. Results will be reported that way, with sample sizes and limits.

### 12.4 If we miss the target
Options, in order: fix or retire weak items; change the start level or the R4 step-up rule; add a third re-check item; drop `above` from session 1 and allow it only through re-checks. Any rule change bumps `algorithm_version`, and stored response logs are re-scored to compare.

`ux-researcher` owns consent and assent for the pilot; `school-partnerships-lead` arranges teacher time; `learning-analytics-scientist` owns the analysis plan.

---

## 13. Hand-offs

| Owner | Task |
|---|---|
| `curriculum-data-engineer`, with `international-curriculum-specialist` and subject specialists | Strand map `data/catalog/placement-strands.json`; placement item schema; validator check for reuse against lessons |
| HoDs and teachers | Author and review items to the counts in section 10 |
| `backend-engineer` | `strand_placements`, `placement_responses`, `placement_changes` in the next numbered migration, with RLS |
| `ai-tutor-engineer` | Run the selection and scoring rules server-side; neutral reactions; never-answer checks on closing items |
| `voice-engineer` | Confidence thresholds per language and age band; the "That's not what I said" caption control |
| `arabic-nlp-engineer` | Spoken-answer matching for Arabic, including Egyptian Arabic number words |
| `product-designer` | Parent "starting point" card copy; "let your child answer" line |
| `learning-analytics-scientist` | Confirm working values and thresholds; analysis plan; how the mastery model uses `start_level` |
| `security-privacy-engineer` | Retention for `placement_responses` |

---

## 14. Open questions
1. **Book-picture item for grades 2 to 3:** unscored here. Do the grade heads want it scored? (`grade-head-g2`, grade 3 head.)
2. **How do we know "this week's book"?** The catalog has terms, not weeks. Options: an optional parent pick at setup ("Which lesson is {name} on this week?"), school pacing calendars through partnerships, or the first unit of the current term as a fallback. (`product-designer`, `school-partnerships-lead`.)
3. **Strand map gaps:** MOE subjects other than Arabic have no progression strands in the catalog; NGSS grades 6 to 8 cannot separate `at` from `above` without a school's own sequence; British rows are missing. Until fixed, which subjects run placement in v1? My proposal: math for all systems with a strand map, plus MOE Arabic reading; no science for grades 6 to 8 yet. (`curriculum-data-engineer`, `international-curriculum-specialist`, `science-education-specialist`.)
4. **Floor and ceiling content:** grade 2 needs KG-level items (level 0) and grade 8 needs year-9 items (level 9) for each system. Is that authoring worth it, or do we clamp to levels 1 and 8 and accept a coarser result at the edges?
5. **Children not at their age's grade** (repeated or skipped a year): we use the school grade, not age. Confirm.
6. **Parent answering for a young child:** accept the risk with a clear instruction, or add a light check? (`grade-head-g2`, `child-development-specialist`.)
7. **Speech thresholds:** what confidence threshold, per language and age band, and how often do children trigger `no_evidence`? Needs pilot data. (`voice-engineer`.)
8. **Working values** (0.5 weight for "I don't know", lesson signal mapping, 75% agreement for `high`, 30-day gap, bank counts) need calibration from pilot data. (`learning-analytics-scientist`.)
9. **Success threshold** in 12.3 needs council confirmation before the pilot.
10. **Teen framing:** the grade 8 head asked for "quick check so I don't waste your time". Does the companion tell teens the result band? Current spec: no, the child never sees levels. (`grade-head-g8`, `course-designer-ethics`.)
