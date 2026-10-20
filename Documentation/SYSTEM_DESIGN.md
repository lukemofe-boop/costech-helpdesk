# System Design — Costech IT Support Ticket System

## Architecture overview

```text
Browser (HTML + shared CSS + page JavaScript)
              | HTTP requests / form submissions
              v
        Express application (server.js)
              | authentication/session checks
              v
       better-sqlite3 database layer
              | SQL queries
              v
        SQLite database file
```

## Main components
- **HTML pages (`public/*.html`):** page structure, forms, navigation, and content.
- **Shared stylesheet (`public/css/style.css`):** common Costech colours, typography, layout, responsive rules, official-logo sizing, and motion/interaction styles. Page-specific selectors live in the same file so there is one local stylesheet to maintain.
- **Browser JavaScript (`public/js/*.js`):** client-side interactions and fetch requests for each page. This code improves usability but is not a substitute for server-side authorization.
- **Express backend (`server.js`):** serves the frontend, parses form submissions, manages sessions, performs authentication and role checks, and handles application routes.
- **SQLite (`database/costech_helpdesk.db`):** persistent storage for users, tickets, and support staff.

## Main workflow
1. A client registers; the server hashes the password with bcrypt and stores the user record.
2. The client signs in; the server compares the submitted password to the stored hash and records the authenticated user in the session.
3. The client submits a ticket; the server takes the client ID from the session and inserts the request with its default Pending status.
4. The client history endpoint filters records by the authenticated client ID.
5. An administrator retrieves all tickets, assigns staff, updates status and resolution notes, and records applicable charge/payment fields.
6. Dashboard endpoints return counts used for administrator and client statistics and reports.

## Current routes
See `ROUTES_AND_FEATURES.md` for the endpoint inventory and role requirements.

## Database relationships
- One user with the client role can have many tickets (`tickets.user_id` references `users.id`).
- A support staff member can be assigned to multiple tickets (`tickets.assigned_staff_id` identifies the assigned staff record).
- A ticket can exist without an assigned staff member.

## UI and motion decisions
The frontend uses one local stylesheet and the official Costech logo image. Transitions and entrance effects should remain subtle, support keyboard focus, and respect `prefers-reduced-motion`. Browser animations must not control whether a form or ticket operation succeeds; the server response is authoritative.
