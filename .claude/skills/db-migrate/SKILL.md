---
name: db-migrate
description: Use when the user asks to run database migrations, create tables, or modify the schema.
allowed-tools: Bash(node *), Bash(psql *), Read, Write
---

# Database Migration

1. Read the current schema file
2. Add new tables/columns as needed
3. Run the migration script
4. Verify the changes with a test query

## Rules
- Always use parameterized queries ($1, $2...)
- UUIDs for primary keys (uuid_generate_v4())
- TIMESTAMPTZ for all timestamps
- JSONB for flexible/nested data