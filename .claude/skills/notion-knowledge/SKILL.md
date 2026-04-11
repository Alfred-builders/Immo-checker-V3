---
name: notion-knowledge
description: Use when the user asks about Notion content, user stories, epics, specs, or any project documentation that might be in Notion. Also use when asked to sync or import from Notion.
allowed-tools: Read, Glob, Grep, mcp__notion__*, Bash(node *)
---

# Notion Knowledge

## Finding information
1. FIRST: Read `knowledge/notion/_index.md` for the full overview
2. Read `knowledge/notion/_routes.json` for exact file paths
3. Search with Grep in `knowledge/notion/` for specific terms
4. Read specific page files for full content with properties

## File structure
```
knowledge/notion/
  _index.md              <- Start here: overview + links
  _routes.json           <- Machine-readable route map
  databases/
    {db-name}.md         <- Schema (properties, types, options)
    {db-name}/
      {page-title}.md    <- Full page content + properties
  pages/
    {page-title}.md      <- Standalone pages
```

## For live Notion queries (when local data is stale)
Use MCP Notion tools:
- `API-post-search` to find pages/databases
- `API-query-data-source` to query database entries
- `API-get-block-children` to read page content

## For documenting in Notion
1. Use MCP Notion `API-post-page` to create pages
2. Follow naming: `{CODE} - US{number} {description}`
3. After creating: trigger sync to update local knowledge