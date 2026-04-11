# ImmoChecker — Design System "Minimal Pro"

## Colors
- **Primary**: #2563eb (Blue-600)
- **Primary hover**: #1d4ed8 (Blue-700)
- **Primary light**: #eff6ff (Blue-50) — active states, hover tints
- **Primary shadow**: shadow-blue-500/15
- **Background**: #f1f5f9 (Slate-100)
- **Card bg**: #ffffff
- **Card border**: #e2e8f0 (Slate-200)
- **Card shadow**: 0 1px 3px rgba(0,0,0,0.04)
- **Foreground**: #0f172a (Slate-900)
- **Muted text**: #64748b (Slate-500)
- **Label text**: #94a3b8 (Slate-400)
- **Destructive**: #ef4444
- **Success**: #16a34a
- **Warning**: #ca8a04

## Typography
- **Font family**: 'Nunito Sans', sans-serif (Google Fonts)
- **Mono**: 'JetBrains Mono', monospace
- **Page titles**: 28px, font-weight 700, tracking-[-0.5px]
- **Section titles**: 20px, font-weight 700
- **Body**: 14px, font-weight 400-500
- **Labels**: 11px, font-weight 700, uppercase, tracking-wider, color #94a3b8
- **Small text**: 13px, font-weight 500

## Radius
- **Cards**: rounded-xl (12px)
- **Buttons**: rounded-lg (8px)
- **Badges**: rounded-full
- **Inputs**: rounded-lg (8px)

## Sidebar (260px)
- Background: white #fff
- Right border: 1px solid #e2e8f0
- Logo: Blue square icon (rounded-lg, shadow-lg shadow-blue-500/20) + "ImmoChecker" bold text with "Checker" in blue
- Section groups: 11px uppercase labels #94a3b8 (OPÉRATIONNEL, RÉFÉRENTIEL, ADMINISTRATION)
- Nav items: 14px, icon + text, border-l-[3px] transparent
- Active: bg-[#eff6ff] text-[#2563eb] border-l-[#2563eb]
- Hover: bg-slate-50 text-slate-900
- User section: avatar circle + name (14px bold) + role (12px muted)

## Elevation System (5 levels)
- **Sunken** (`bg-surface-sunken`): Table headers, expanded rows, tab list backgrounds, filter bars. No shadow.
- **Default** (`bg-background` ~#fafafa): Page background only. No shadow.
- **Raised** (`elevation-raised` or `bg-card` + `shadow-elevation-raised`): Cards, sidebar, header, detail sections. Subtle shadow.
- **Overlay** (`bg-popover` + `shadow-elevation-overlay`, z-40): Dropdowns, popovers, selects, autocomplete.
- **Floating** (`elevation-floating` or `bg-surface-floating` + `shadow-elevation-floating`, z-50): Modals, sheets, floating save bar.

## Cards
- Use `elevation-raised rounded-xl` (combines bg-white + subtle shadow + 1px border)
- No heavy shadows — subtle, clean elevation

## Table
- Container: white card with rounded-xl
- Header: bg-[#f8fafc] border-b border-[#e2e8f0]
- Header text: 11px uppercase tracking-wider font-bold #94a3b8
- Rows: border-b border-[#f1f5f9]
- Row hover: bg-[#eff6ff]/30
- Cell text: 14px, designation font-bold, address text-slate-500
- Pagination: infinite scroll (load more on scroll down)

## Badges
- Immeuble: bg-blue-50 text-blue-600 border-blue-100
- Maison: bg-green-50 text-green-600 border-green-100
- Commercial: bg-amber-50 text-amber-600 border-amber-100
- Lot count: bg-slate-100 text-slate-600 rounded-md

## Buttons
- Primary: bg-[#2563eb] text-white rounded-lg font-bold shadow-lg shadow-blue-500/15, hover bg-[#1d4ed8]
- Secondary/Outline: bg-white border border-[#e2e8f0] text-slate-700 rounded-lg font-bold shadow-sm, hover bg-slate-50
- Ghost: bg-transparent text-slate-600 hover bg-slate-100

## Animations (Framer Motion)
- Page transitions: fade+slide (y:8 → 0, opacity 0→1, 200ms ease)
- Edit mode toggle: smooth height collapse/expand with layout animation
- Save feedback: green flash pulse on saved card (0.5s), then smooth collapse
- Card appear: staggered fadeIn (each card 50ms delay)
- Table rows: subtle fadeIn on load
- Floating save bar: spring animation from bottom (y:80→0)
- Modal open/close: scale 0.95→1 + opacity, 200ms
- Badge/status changes: crossfade transition

## Edit Mode (Detail Pages)
- Single "Modifier" button at top of page — toggles ALL fields to inline edit
- Fields switch from text display → input in-place (no separate form)
- Floating save bar at bottom (animated) with "Annuler" + "Enregistrer"
- On save: green flash animation on the card, then smooth close of edit mode
- On cancel: smooth revert with fade

## Breadcrumb
- 13px text, muted color, "Référentiel / Parc immobilier" pattern
- ChevronRight icon separator

## Spacing
- Page padding: p-8 (32px)
- Section gaps: space-y-8
- Card internal: p-6
- Table cell: px-6 py-4
