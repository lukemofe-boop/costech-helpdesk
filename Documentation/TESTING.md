# Regression Testing Checklist

## Status convention
The older user manual contains a table of tests recorded as passed. Because the CSS/JavaScript separation and default-port change have been made in this cleanup copy, those results must be rerun against this copy before they are presented as current. Record the date, environment, actual result, and any defect for each test below.

| ID | Test | Expected result | Current cleanup status |
|---|---|---|---|
| T01 | Start from the application folder with `npm start` | Server starts and reports port 3003 unless `PORT` is set | Pending browser/runtime test |
| T02 | Open `http://localhost:3003` | Home page loads and shared stylesheet is applied | Pending browser/runtime test |
| T03 | Check logos on all pages | Official Costech image is used; no CSS-drawn logo remains | Passed static source check 2026-10-16; visual browser confirmation pending |
| T04 | Inspect every HTML page | Each page links to `css/style.css`; no embedded `<style>` blocks remain | Passed static source check 2026-10-16 |
| T05 | Register a new client | Account is created and password is hashed | Pending browser/runtime test |
| T06 | Register with an existing email | Registration is rejected with a usable message | Pending browser/runtime test |
| T07 | Sign in with valid client credentials | Client dashboard opens | Pending browser/runtime test |
| T08 | Sign in with invalid credentials | Login is rejected | Pending browser/runtime test |
| T09 | Submit a client ticket | Ticket is saved with the current client ID and Pending status | Pending browser/runtime test |
| T10 | Open My Requests | Only the signed-in client’s tickets are shown | Pending browser/runtime test |
| T11 | Load client statistics | Counts match the client’s tickets | Pending browser/runtime test |
| T12 | Sign in as administrator | Admin dashboard loads | Pending browser/runtime test |
| T13 | Search and filter admin tickets | Matching tickets are displayed; reset clears filters | Pending browser/runtime test |
| T14 | Update ticket status and resolution notes | Values persist and appear in client history | Pending browser/runtime test |
| T15 | Assign support staff | Selected staff member appears on the ticket | Pending browser/runtime test |
| T16 | Set service charge and payment status | Values persist and display correctly | Pending browser/runtime test |
| T17 | Add and remove support staff | Staff list updates and deleted staff assignments are cleared | Pending browser/runtime test |
| T18 | Review admin statistics and reports | Counts reflect current database records | Pending browser/runtime test |
| T19 | Try admin API as a client | Server denies access | Pending browser/runtime test |
| T20 | Open protected data endpoint without a session | Server denies access or redirects as designed | Pending browser/runtime test |
| T21 | Log out | Session is destroyed and login page opens | Pending browser/runtime test |
| T22 | Test mobile layout and menu | Navigation, forms, cards and tables remain usable | Pending browser/runtime test |
| T23 | Enable reduced-motion preference | Nonessential motion is reduced | Pending browser/runtime test |
| T24 | Check JavaScript syntax | Server and all external page scripts parse without syntax errors | Passed `node --check` 2026-10-16 |
| T25 | Check shared CSS structure | CSS opening and closing brace counts match | Passed basic static check 2026-10-16; this is not a full CSS parser test |

## How to record results
For each test, write `Passed`, `Failed`, or `Blocked`, plus a short observation. Do not mark a test as passed based only on reading the code. Keep a backup of the SQLite database before testing deletion operations.


## Fresh stylesheet regression checks — 16 October 2026

After replacing the shared stylesheet, manually verify these visual checks in a browser at desktop and mobile widths:

- [ ] Every page displays the official Costech logo image in its header; the homepage and About-page footer use the same official image.
- [ ] No CSS-generated logo, old square-mark, or logo text treatment appears.
- [ ] About-page hero, highlight cards, system cards, values, industry tags, commitment panel, contact section, and footer all have spacing and readable contrast.
- [ ] Navigation works on all pages; About-page mobile menu opens and closes.
- [ ] Login and registration fields, password toggles, and form feedback remain usable.
- [ ] Client dashboard statistics and action links remain readable and responsive.
- [ ] Admin filters, ticket update forms, staff management, client management, and reports remain readable and usable.
- [ ] Ticket submission and ticket history cards, status badges, payment information, assigned staff, and resolution notes remain readable.
- [ ] At 320–520px width, content does not cause unintended horizontal page overflow (wide data tables may scroll within their own area).
- [ ] Keyboard focus is visible and reduced-motion preferences are respected.

The stylesheet was checked statically, but these browser checks have not been marked passed until they are performed against the running application.
