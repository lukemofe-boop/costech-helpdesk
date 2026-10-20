# Database Documentation

The application connects to `database/costech_helpdesk.db` through `better-sqlite3`. Table creation and incremental column additions are currently defined in `server.js`; there is no separate SQL schema file in the submitted source at this time.

## `users`
| Field | Purpose |
|---|---|
| `id` | Primary key for each account |
| `full_name` | Account holder name |
| `email` | Unique login email |
| `password` | bcrypt password hash, not the original password |
| `role` | Account role; defaults to `client`, with an administrator role used for admin access |
| `created_at` | Record creation timestamp |

## `support_staff`
| Field | Purpose |
|---|---|
| `id` | Primary key for a support staff record |
| `full_name` | Staff member name |
| `email` | Unique staff email |
| `created_at` | Record creation timestamp |

## `tickets`
| Field | Purpose |
|---|---|
| `id` | Primary key for a ticket |
| `user_id` | Client account that owns the ticket |
| `title` | Short issue title |
| `category` | Support category |
| `description` | Issue description |
| `priority` | Ticket priority |
| `status` | Workflow status; defaults to `Pending` |
| `resolution_notes` | Administrator’s resolution notes |
| `amount` | Recorded service charge amount |
| `payment_required` | Flag indicating whether payment is required |
| `payment_status` | Recorded payment state, defaulting to `Unpaid` when added |
| `assigned_staff_id` | Optional reference to a support staff member |
| `created_at` | Ticket creation timestamp |

## Relationships
- `tickets.user_id` links each ticket to a user.
- `tickets.assigned_staff_id` links a ticket to support staff when assigned.
- The client history query uses the signed-in user’s session ID so one client does not retrieve another client’s tickets through the intended route.

## Important implementation note
The database schema is created and migrated by `server.js` using `CREATE TABLE IF NOT EXISTS` and `ALTER TABLE` attempts. Before modifying tables, make a backup of the SQLite file and test changes against a copy. A future maintainability improvement would be to extract schema creation and migrations into versioned SQL/migration files.
