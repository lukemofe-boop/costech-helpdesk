# Costech Help Desk

A Node.js, Express and SQLite application for managing IT support tickets.

## Features

- Client registration and login
- Client dashboard and ticket submission
- Ticket history and status viewing
- Administrator dashboard for reviewing and updating tickets
- Support staff records and assignment
- Ticket priority, service-charge and payment-status recordkeeping

## Requirements

- Node.js (LTS recommended)
- npm

## Run locally

1. Open a terminal in this folder.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the server:

   ```bash
   npm start
   ```

4. Open `http://localhost:3003` in your browser.

The application creates the SQLite database and tables when the server starts. The local database is intentionally excluded from this repository so private account and ticket records are not published.

## Demo administrator

The current source code creates a default demo administrator when one does not exist:

- Email: `admin@costech.com`
- Password: `Admin123`

**Demo credentials are not safe for a public production deployment.** Change the default credentials and move session secrets into environment variables before using this application with real users. Do not put real customer information, passwords, database files or `.env` files in a public repository.

## Deployment note

The app uses a local SQLite database. On hosting platforms with an ephemeral filesystem, the database can be lost when the service restarts or redeploys unless persistent storage is configured. Back up any database before replacing or redeploying the app, and confirm that the host supports the application's SQLite/native module requirements.

## Documentation

See the `Documentation/` folder for system design, database structure, routes/features, requirements, testing notes and changelog.

## Student / academic note

Verify the app and its documentation against the version you actually test. Do not claim that a workflow passed testing until you have tested it.
