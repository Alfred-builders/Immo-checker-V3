# Notion Knowledge Rules

## Local knowledge (fast, always available)
- The `knowledge/notion/` directory contains synced Notion content
- Always read `_index.md` first to understand what is available
- Each page file includes full frontmatter with notion_id, properties, URL
- NEVER edit files in `knowledge/notion/` — they are overwritten on sync

## Live queries (real-time, requires network)
- Use MCP Notion tools for real-time data
- Prefer local files for reading, MCP for writing/querying

## When user mentions a Notion link
- Extract the ID from the URL
- Check if it already exists in local knowledge (`knowledge/notion/`)
- If not, use MCP to fetch and inform user to trigger sync

## Data completeness
- Every Notion page is exported with ALL properties, ALL blocks, ALL comments
- Unknown block types are serialized as JSON — nothing is lost
- Pagination handles databases with 100+ pages