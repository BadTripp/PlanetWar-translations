# PlanetWar translations

Community translations for the game PlanetWar. Anyone can fix a typo or add a language with a pull request: no coding needed.

```
locales/
  manifest.json        languages the game offers
  en/<area>.json       English source (read-only here, synced from the game)
  it/<area>.json       one folder per language, same file names as en
```

Each file is a flat `"key": "text"` map. Keep the key, translate the text. See [CONTRIBUTING.md](CONTRIBUTING.md).

How changes reach the game: PR merged here → the game repository opens an automatic import PR → released with the next update.
