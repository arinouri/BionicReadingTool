# ReadEasier

ReadEasier is a free, client-side reading and writing tool hub. The production site is served through GitHub Pages at [readeasier.ca](https://readeasier.ca).

## Included tools

- Focus reader with display controls, a reading ruler, word anchors, and sentence-highlighted text-to-speech
- Adjustable word anchors, chunked reading, and a paced one-word reader
- Readability and clarity checks, word counts and goals, local text cleanup, and draft comparison
- Extractive summaries, key terms, active-recall prompts, notes, and common webpage citation formatting

## Privacy

Text processing is performed in the browser. Drafts and preferences use local browser storage; there is no account or application database.

## Structure

- `index.html`, `style.css`, `script.js` — public homepage
- `studio/` — unified interactive workspace
- legacy tool paths redirect into the matching workspace tool so existing bookmarks keep working
- `privacy.html`, `tos.html` — project policies

No build step or external package is required. Serve the repository root with a static server for local development.
