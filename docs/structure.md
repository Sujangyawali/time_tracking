# Dashboard structure

## Folder layout
- src/components/dashboard: dashboard UI shell and tab components.
- src/components/dashboard/tabs: overview, tasks, and trends views.
- src/components/dashboard/shared.jsx: shared UI primitives used across tabs.
- src/data: demo seed data and sample payloads.
- src/lib: date helpers and persistence helpers.
- src/styles: color/theme constants.
- docs: architecture notes and migration guidance.

## Why each folder exists
- components/dashboard keeps the app shell and page-level orchestration separate from business logic.
- tabs isolates each major view so it is easier to maintain and extend.
- shared.jsx centralizes repeated small UI components such as buttons and cards.
- data holds demo content and future seed/import data.
- lib keeps utility logic independent from React UI concerns.
- styles stores design tokens so colors and spacing are consistent.
