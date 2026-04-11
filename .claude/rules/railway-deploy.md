# Railway Deployment Rules

- Always use MCP Railway tools over CLI for Railway operations
- Never hardcode Railway URLs — use environment variables
- Verify deployment logs after every push
- Use `${{SERVICE.VAR}}` syntax for variable references between services
- Private networking: use `service-name.railway.internal` for inter-service communication