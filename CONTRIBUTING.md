# How to contribute

## Fix an existing translation
1. Open the file in `locales/<lang>/` (GitHub's pencil button works), edit the text, and propose the change as a pull request.
2. CI checks the file. Fix anything it reports and push again.

## Add a language
1. Copy `locales/en/` to `locales/<code>/` (use the [IETF code](https://en.wikipedia.org/wiki/IETF_language_tag): `de`, `pt-BR`, …).
2. Add it to `locales/manifest.json`: `"de": { "name": "German", "native": "Deutsch" }`.
3. Translate what you can. **Delete** the keys you have not translated: the game shows English for missing keys. Do not leave English copies or empty strings.

## Rules
- **Never change keys** (left side) and never edit `locales/en`.
- Keep placeholders exactly: `Hello {name}` → `Ciao {name}`. Plurals use ICU syntax:
  `{n, plural, one {# ship} other {# ships}}` — write the forms your language needs (`one`, `few`, `many`, `other`…); `#` is the number.
- `{n, number}` prints a number with the language's digit grouping; keep it as is.
- Keep HTML tags such as `<em>…</em>` and symbols like `✓` and `→`.
- Names of ships, aliens and sectors are proper names: translate them only if the community agrees on it (see GLOSSARY.md). Files named `data*.json` hold them as `<id>.<field>`.
- Short UI labels have limited space: stay about as short as the English.
- Game terms: use the same word everywhere. Add agreed terms to the glossary below via PR.

## Check locally
`node tools/check.mjs` — shows coverage and errors (needs Node 22).

## Glossary
Add `English → your language` entries per language in `GLOSSARY.md`.
