# Prompt 14: API Keys CRUD Endpoints

## Objective
Create backend route handlers in `app/api/keys/route.ts` to manage API key lifecycles.

## Requirements
- **GET**: Retrieve all active API keys for a given `userId`. Join with `api_usage_logs` to dynamically return call count metrics.
- **POST**: Generate a new API key with a `pk_` prefix, saving it to `api_keys` table. Allow custom `keyValue` inputs to sync browser-generated keys.
- **DELETE**: Soft delete/revoke keys by updating status to `'revoked'` to preserve relational logs.
- Add generic CORS option handshakes for browser clients.
