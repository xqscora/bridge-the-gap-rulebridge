# RuleBridge

RuleBridge keeps conflicting event requirements visible, links each claim to its source, plans against the stricter published constraint, and exports a local Markdown audit packet.

## Bridge The Gap case

The included case records two published deadline statements for Bridge The Gap Hacks 2026: November 20 at 11:45 PM PST on the overview and 11:59 PM PT in the rules. It also preserves two different eligibility phrasings. RuleBridge converts both deadline claims to the selected timezone, highlights disagreement, and uses the earlier time for planning. Checklist notes remain in browser local storage; the report is generated locally and is not sent to the organizer.

The source excerpts are manually prepared examples. Reopen the linked official pages before acting; this app does not determine eligibility or establish an organizer ruling.

## Run

Open `index.html` in a modern browser. No build step, dependency install, account, API, or backend is required.

To run the focused checks with Node.js:

```sh
node tests/app.test.mjs
```

## Scope

This is a single-event prototype, not a rules scraper. It does not verify registration, prove when a project started, determine eligibility, or measure reductions in missed deadlines. No user checklist data is transmitted.

AI coding assistance was used to draft implementation and tests. The running application does not call an AI model or remote service.

## Screenshots

- `assets/demo/rulebridge-overview-20261116-0442.png`
- `assets/demo/rulebridge-evidence-20261116-0435.png`
- `assets/demo/rulebridge-checklist-20261116-0435.png`

## Attribution

Implementation: HTML, CSS, JavaScript, browser `Intl` and localStorage APIs. The repository does not grant a license to reuse the code; all rights are reserved unless the author publishes a separate license.
