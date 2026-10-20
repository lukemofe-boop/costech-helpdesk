# Changelog

## 2026-10-16 — Project structure and branding cleanup
- Standardised page branding to use the official Costech Computers logo image only.
- Removed the home-page footer’s CSS-drawn logo markup and legacy logo styles.
- Moved embedded page styles into `public/css/style.css`; HTML pages now use the shared local stylesheet.
- Moved inline page scripts into separate files under `public/js/`.
- Consolidated shared logo sizing, interaction transitions, focus-visible styling, and reduced-motion handling.
- Changed the default local port from 3002 to 3003 to avoid the developer’s other local projects. `process.env.PORT` remains supported.
- Added an `npm start` script and updated the README setup instructions.
- Removed the stray empty root-level package-lock file; the active lockfile remains beside the application package.json.
- Added requirements, system design, database, route inventory, testing, and changelog documents.
- Runtime regression testing is still required after these structural changes; see `TESTING.md`.

## 16 October 2026 — Fresh shared stylesheet reset

- Replaced the accumulated stylesheet with a fresh, organised shared stylesheet covering the home, About, login, registration, client dashboard, admin dashboard, ticket submission, and ticket history pages.
- Removed legacy/duplicate selectors, obsolete About-page layout rules, and CSS pseudo-element rules that attempted to draw a Costech logo.
- Standardised all `.brand` areas on the official Costech Computers logo image URL; no brand mark is drawn with CSS.
- Rebuilt shared responsive navigation, buttons, forms, dashboard cards, ticket cards, reports, and About-page sections from the current HTML and JavaScript-generated markup.
- Retained orange accents, dark styling, transitions, entrance animation, responsive layouts, visible keyboard focus, and reduced-motion support.
- Verification performed: HTML structure and stylesheet references inspected; legacy CSS logo selectors checked; JavaScript and server files unchanged. Full browser/runtime regression testing remains required.
