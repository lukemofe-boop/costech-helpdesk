# Routes and Features Inventory

The route inventory below reflects the `server.js` included in this project copy. Protected endpoints must retain their server-side role checks.

| Method | Route | Purpose / access |
|---|---|---|
| POST | `/register` | Create a client account |
| POST | `/login` | Authenticate a user and establish a session |
| GET | `/session-user` | Return the current signed-in user; requires a session |
| GET | `/my-tickets` | Return tickets belonging to the signed-in user |
| GET | `/client-stats` | Return ticket counts for a signed-in client |
| GET | `/admin-tickets` | Return all tickets and client information; admin only |
| GET | `/admin-stats` | Return all-ticket status counts; admin only |
| GET | `/admin-priority-stats` | Return counts grouped by priority; admin only |
| GET | `/admin-category-stats` | Return counts grouped by category; admin only |
| GET | `/admin-staff-stats` | Return assigned-ticket counts by support staff; admin only |
| GET | `/admin-users` | Return client records and ticket counts; admin only |
| GET | `/support-staff` | Return support staff records; admin only |
| POST | `/add-support-staff` | Add support staff; admin only |
| POST | `/delete-support-staff` | Unassign staff from tickets and delete the staff record; admin only |
| POST | `/delete-user` | Delete a client’s tickets and client account; admin only |
| POST | `/update-ticket` | Update ticket status, resolution, assignment and payment fields; admin only |
| GET | `/logout` | Destroy the current session and redirect to login |
| POST | `/submit-ticket` | Submit a new ticket; client role required |

## Important behaviour to preserve
- Ticket ownership is derived from the authenticated session rather than trusting a client-supplied user ID.
- Administrator-only routes check the session role on the server.
- Removing a support staff record first clears its ticket assignments.
- Payment fields are record keeping only; no payment gateway is integrated.
- Frontend code may redirect users for usability, but backend access checks remain authoritative.

## Review items for a future security pass
The submitted server uses a fixed fallback session secret and hard-coded default administrator credentials. Input validation, CSRF protection, production cookie configuration, and safer default-admin provisioning should be reviewed before any public deployment. Avoid exposing real credentials in shared or public documentation.
