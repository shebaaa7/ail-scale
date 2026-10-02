# AIL Scale — AI Involvement Level

A voluntary disclosure standard for authors to communicate how much AI contributed to a written work (AIL-1 to AIL-12).

**[Try it live: shebaaa7.github.io/ail-scale](https://shebaaa7.github.io/ail-scale/)**

This site has the full scale, a "find your level" questionnaire, and a badge and disclosure-statement generator.

## Run locally
Open `index.html` in a browser. There is no build step and no dependencies.

## Edit the scale
All level text is in `levels.js`. Change the wording there and the cards, questionnaire results, and statements update.
The questionnaire's questions are in `app.js` (`Q1`, `Q2`).

## Publishing
The site is served by GitHub Pages from the `main` branch, root folder. Pushing to `main` updates the live site in about a minute.

## License
- **The AIL Scale text** (level definitions and wording): [CC BY 4.0](LICENSE-CC-BY-4.0.txt). Reuse and adapt freely with credit to shebaaa7.
- **Site code** (`index.html`, `app.js`, `style.css`): [MIT](LICENSE).

If you publish a modified version of the scale, please give it a different name so it isn't confused with the original AIL Scale.
