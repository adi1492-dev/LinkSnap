# Prompt 15: Auth Registration and Login API Routes

## Objective
Implement backend API handlers for developer authentication under `app/api/auth/register` and `app/api/auth/login`.

## Requirements
- **Register**:
  - Accept `name`, `email`, and `password`.
  - Validate if the email already exists in the `users` table.
  - Insert user and auto-generate a default API key.
- **Login**:
  - Validate email and password.
  - Fetch active developer keys from the database, pre-computing usage logs count.
- Implement cross-runtime safe identifier generators using `crypto.randomUUID()`.
