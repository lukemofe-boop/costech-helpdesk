# Project Requirements — Costech IT Support Ticket System

## Problem statement
IT support requests can be difficult to record, assign, and follow when handled through informal channels. This project provides a central web application for recording and tracking support requests.

## Aim
To develop a web-based IT Support Ticket System that improves the organisation and tracking of client support requests at Costech Computers Ltd.

## Main objectives
- Allow clients to register and sign in.
- Allow authenticated clients to submit support tickets and view only their own tickets.
- Provide an administrator interface for reviewing and updating tickets.
- Support assignment of tickets to support staff.
- Record status, resolution notes, service charges, and payment status.
- Provide statistics and reports that help the administrator review ticket workload.
- Keep the interface consistent, responsive, and maintainable.
- Keep implementation and test documentation aligned with the actual source code.

## User roles
- **Client:** registration, login, request submission, personal request statistics, and request history.
- **Administrator:** ticket management, client and support-staff management, assignments, payment tracking, and reports.

## Functional requirements
1. Register a client with a unique email and hashed password.
2. Authenticate users and store their identity and role in a session.
3. Save a ticket with title, category, description, priority, client ID, and default status.
4. Return only the signed-in client’s tickets from the client history endpoint.
5. Restrict administrator API endpoints to the administrator role.
6. Allow an administrator to update ticket status, resolution notes, assigned staff, and payment fields.
7. Allow the administrator to add and remove support staff and remove client accounts.
8. Provide ticket counts by status, priority, category, and support staff.

## Non-functional requirements
- Usable in a current desktop or mobile browser.
- Maintainable separation of HTML, shared CSS, browser JavaScript, server routes, and database operations.
- Use parameterised SQLite queries for database values.
- Hash stored passwords with bcrypt.
- Apply server-side access checks to protected data routes.
- Provide clear setup steps and a regression test checklist.

## Scope and limitations
The current application records service charges and Paid/Unpaid status; it does not process online payments. The current server creates a default demo administrator account when needed. Production deployment requires stronger credential provisioning, a protected session secret, secure cookie settings appropriate to HTTPS, and a review of request validation and CSRF protections.
