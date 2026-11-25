# Source registries

## `moe-book-links.csv`

Links to Egyptian Ministry of Education files on the Ministry's e-learning storage (`elearnningcontent.blob.core.windows.net`): student books, assessment books, and weekly class and home assessments.

- **How it was built:** links were collected from public GitHub projects that had published them (GitHub code search, 2026-11-25). The `published_in` column names the project. No link was guessed.
- **Status:** `ok` means the file answered a header request on 2026-11-25. `http 404` or similar means the link was dead that day. Only grades 2 to 8 were checked; other rows are `unchecked`.
- **Folders:** `2026_2027` holds current-year (2026/2027) files, `2026` holds 2025/2026 files, and `content/...` holds older editions.
- **Subject:** `subject_guess` comes from the file name and is a guess. The book cover is the authority.
- **Use:** a link is a lead. Before data from a book enters the catalog, its cover is checked for Ministry branding, grade, term, and printed academic year, and its contents page is read (see `data/catalog/curricula/national.json`).
- **Gaps:** this list only holds links someone published. Missing books are not evidence that the Ministry has no such book.
