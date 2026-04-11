---
name: deploy-railway
description: Use when the user asks to deploy, check deployment status, or manage Railway services for this project.
allowed-tools: Bash(git *), mcp__railway__*
---

# Deploy to Railway

## Steps
1. Check git status — ensure working tree is clean
2. Use MCP Railway tools to verify service exists
3. Push to GitHub: `git push origin main`
4. Monitor deployment via `deployment_list` + `deployment_logs`
5. Verify production URL returns 200

## Important
- Railway auto-deploys on push to main branch
- Always verify logs after deploy
- Use `variable_set` to configure environment variables