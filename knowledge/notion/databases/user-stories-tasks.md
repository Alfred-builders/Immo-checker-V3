---
notion_id: "2c51d95b-2f8a-800e-acac-f3670d50eab1"
type: database_schema
source: linked_global
last_synced: "2026-03-26T12:50:13.508Z"
---

# 📊 User Stories ⎪ Tasks — Schema (global database, not synced)

> This is a shared database across all Alfred projects. Only the schema is synced here.
> Use MCP Notion to query entries filtered by project.

| Propriete | Type | Options |
|-----------|------|---------|
| Sprint | select | SP3, SP10, SP4, SP1, SP2, SP5, SP6, SP8, SP7, SP9 |
| Not included in audit | checkbox |  |
| Catégorie | select | Spike, Bug, User Story, Task, Meeting |
| Delay | formula |  |
| Identifiant | unique_id |  |
| Created by | created_by |  |
| Builder Projet Price | rollup |  |
| Priority | select | 🔴 P0, 🟠 P1, 🟡 P2, 🟢 P3 |
| Sponsors | people |  |
| Bloque | relation |  |
| Time spent | formula |  |
| Pricing (h) | number |  |
| Nom | rich_text |  |
| Pricing | formula |  |
| Bloqué par | relation |  |
| Epic | relation |  |
| Builder Project Pricing | relation |  |
| Notes | relation |  |
| Brique Fonctionnelle | relation |  |
| Status | status | 📋 Backlog, 📌 Ready, ❓ À cadrer, 🚀 In Progress, 🔎 To validate, 👀 In Review (client), ✅ Done, 🚫 Cancelled |
| Builders | people |  |
| Coefficient pricing | rollup |  |
| Type | select | Formulaire, Base de données, Automatisation, Notification, Interface |
| Date de création | created_time |  |
| Description | rich_text |  |
| Custom price | number |  |
| Sessions | relation |  |
| Code | title |  |
| Time Spent Activation | checkbox |  |
| Deadline | date |  |