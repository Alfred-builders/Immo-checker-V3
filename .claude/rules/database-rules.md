# Database Rules

- NEVER use string interpolation in SQL queries — always parameterized ($1, $2...)
- NEVER expose DATABASE_URL to frontend code
- All primary keys must be UUIDs
- All timestamps must be TIMESTAMPTZ
- Use JSONB for flexible/nested data structures
- Always use connection pooling (pg Pool, max 20)