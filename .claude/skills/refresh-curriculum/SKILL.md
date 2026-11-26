---
name: refresh-curriculum
description: Run the curriculum refresh pipeline. Harvests newly published Ministry book links, checks every current national book for changes and newer editions, carries forward republished editions, sends changed books for re-extraction, then rebuilds and tests the catalog. Use at the start of each term (late August, late January), when the user sends new Ministry links, or when asked whether the curriculum data is up to date.
---

# Refresh the Curriculum Catalog

Follow `docs/catalog/refresh.md`.

1. If the user pasted Ministry links, append them to `data/catalog/sources/incoming-links.txt`.
2. Run `python3 scripts/refresh_catalog.py harvest`, then `python3 scripts/refresh_catalog.py check`. Read the report in `data/catalog/refresh/<date>.md`.
3. For every `same` result, run `python3 scripts/refresh_catalog.py carry-forward data/catalog/refresh/<date>.json`.
4. For every `changed` result, give the book to `curriculum-data-engineer` with the standard extraction brief (verify cover, read the contents page as an image, transcribe exactly, translate faithfully, skip generic items, report contents pages). Spot-check one transcription against the source page yourself. Add the new edition and mark the old one `superseded`, then run `python3 scripts/refresh_catalog.py baseline`.
5. For every `review` result, render both contents pages and compare them yourself before deciding.
6. Run `npm run build:catalog`, `npm run test:catalog`, and `python3 -m unittest scripts/test_refresh_catalog.py`.
7. If lessons are impacted, list them for the grade teacher and head of department.
8. Commit with a message naming each changed book and its new academic year.

Report to the user: books checked, unchanged, carried forward, re-extracted, and anything left for review, with the report path.
