---
notion_id: "3271d95b-2f8a-8141-8819-de8b78d33994"
notion_url: "https://www.notion.so/Notifications-Sp-cification-3271d95b2f8a81418819de8b78d33994"
last_synced: "2026-03-26T12:52:20.873Z"
created: "2026-03-18T14:30:00.000Z"
last_edited: "2026-03-18T14:43:00.000Z"
properties:
  title: "🔔 Notifications — Spécification"
---

# 🔔 Notifications — Spécification

| Propriete | Valeur |
|-----------|--------|


# Objectif
Centraliser la liste des notifications de la plateforme ImmoChecker. Les notifications sont le mécanisme principal pour informer les utilisateurs des événements importants.
**Mode principal** : Email. Les notifications in-app (cloche) sont un complément.

---


# Notifications Admin / Gestionnaire
| Événement | Canal | Déclencheur | Destinataire |
| Mission créée | Email + in-app | Création d'une mission | Admin/Gestionnaire (si créée par API) |
| Technicien assigné | Email + in-app | Assignation d'un technicien | Admin/Gestionnaire (confirmation) |
| **Technicien a accepté la mission** | Email + in-app | `statut_invitation` = accepté | Admin/Gestionnaire |
| **Technicien a refusé la mission** | Email + in-app | `statut_invitation` = refusé | Admin/Gestionnaire |
| **Mission annulée par le technicien** | Email + in-app | Annulation côté technicien | Admin/Gestionnaire |
| EDL signé | Email + in-app | `EDL.statut` = signé | Admin/Gestionnaire |
| EDL infructueux | Email + in-app | `EDL.statut` = infructueux | Admin/Gestionnaire |
| Invitation acceptée | In-app | Nouvel utilisateur rejoint le workspace | Admin |
| Invitation expirée (J+7) | Email | Expiration sans acceptation | Admin |

---


# Notifications Technicien
| Événement | Canal | Déclencheur | Destinataire |
| **Nouvelle mission assignée** | Email + push mobile | Assignation | Technicien |
| Mission modifiée (date, heure) | Email + push mobile | Modification par admin | Technicien |
| **Mission annulée** | Email + push mobile | Annulation par admin | Technicien |
| Rappel mission J-1 | Push mobile | 24h avant la mission | Technicien |
| Rappel clés à déposer | Push mobile | Mission terminée + clés statut « à déposer » | Technicien |
| Retour qualité admin | In-app (mobile) | Admin laisse un commentaire QA | Technicien |

---


# Notifications Locataire (V2)
| Événement | Canal | Déclencheur | Destinataire |
| EDL signé — documents disponibles | Email | Génération PDF post-signature | Locataire |
| Demande d'avenant reçue | Email | Locataire soumet un avenant (V2) | Admin |

---


# Règles générales
- L'email reste le canal principal de notification
- Les notifications in-app (cloche 🔔) sont un complément pour les utilisateurs connectés
- Les push notifications mobiles sont réservées aux techniciens (app mobile)
- Chaque notification a un lien direct vers l'objet concerné (mission, EDL, etc.)
- Les notifications in-app sont marquées comme lues au clic
- Pas de préférences de notification en V1 (tout est activé par défaut). Préférences en V2.

---


# Impact data model
- `Notification` : nouvelle table (user_id, type, titre, message, lien, est_lu, created_at)
- Pas de table pour les templates email en V1 (hardcodés dans le code)