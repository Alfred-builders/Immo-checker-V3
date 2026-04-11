---
name: shadcn-ui-management
description: Gérer l'installation et l'ajout de composants shadcn/ui via le CLI officiel
---

# Utilisation de shadcn/ui

Ce skill permet d'intégrer des composants UI de haute qualité sans installer de bibliothèque externe lourde.

## Initialisation du projet
Si le projet n'est pas encore configuré pour shadcn/ui, lancez :
`npx shadcn@latest init` 
Cela créera le fichier `components.json` et configurera les utilitaires Tailwind.

## Ajout de composants
Pour ajouter un composant spécifique au projet :
`npx shadcn@latest add [nom-du-composant]`

Exemples courants :
- `npx shadcn@latest add button` : Ajoute le composant Button.
- `npx shadcn@latest add dialog` : Ajoute les primitives de modale.
- `npx shadcn@latest add form` : Ajoute l'intégration React Hook Form + Zod.

## Maintenance
- Pour vérifier les mises à jour des composants locaux : `npx shadcn@latest diff`.
- Les composants sont physiquement situés dans `components/ui/` (ou le chemin défini dans `components.json`).
- Vous pouvez modifier librement le code source des composants générés pour les adapter aux besoins spécifiques du projet.