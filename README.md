# Emberwall: site source

Source for [emberwall.net](https://emberwall.net), working notes by Will Brooke. The site is built with [Quarto](https://quarto.org) from plain Markdown (`.qmd`) files and published by GitHub Pages.

## What's here

| Path | Page |
|---|---|
| `index.qmd` | Home: short intro and an automatic list of notes, newest first |
| `notes/delegation-assurance/index.qmd` | The working note "Assuring one delegation" (web page and PDF) |
| `cases/index.qmd` | Tests: the small experiments behind the note |
| `reading.qmd` | Reading: the sources behind the notes and what was taken from each |
| `contract.qmd` | The generic delegation contract template, linked from the Reading page |
| `about.qmd` | About and contact |
| `404.qmd` | Page-not-found page |
| `_quarto.yml` | Site settings and navigation |
| `theme.scss` | Fonts and layout shared by both modes |
| `theme-light.scss`, `theme-dark.scss` | Colours for light and dark mode |
| `pdf-links.lua` | Turns links between pages into full web addresses in the PDF |
| `.github/workflows/publish.yml` | Builds and publishes the site on every push to `main` |

## Editing and previewing

1. Install Quarto from https://quarto.org/docs/get-started/.
2. From this folder, run:

   ```powershell
   quarto preview
   ```

   A browser opens, and it reloads every time a file is saved.
3. Edit the `.qmd` files in any text editor.

Every push to `main` rebuilds and publishes the site.

## Notes and versions

- Each note's front matter carries `date:` and `version:`. The line under the title repeats them, so update both together.
- The first posted version of a note has no version history. From the second version on, add a **Version history** table at the bottom with one row per published version.
- A note keeps one web address. Each version deposited on Zenodo is the frozen copy of that version, and its DOI goes in the line under the title.
- Each note is also built as a PDF from the same file. The `format:` block in the note's front matter controls it.
- To add a note, make a new folder under `notes/` with an `index.qmd`. It appears on the home page automatically.
- Link to other pages of the site from the project root, for example `/cases/index.qmd`, so the links also work in the PDF.
