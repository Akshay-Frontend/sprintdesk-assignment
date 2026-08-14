# SprintDesk — Sprint Management Dashboard

A production-oriented Kanban sprint dashboard for software teams. Built as a technical assignment demonstrating clean architecture, strong TypeScript, dnd-kit drag-and-drop, TanStack Query server state, Zustand client state, and a from-scratch Tailwind design system.

## Demo credentials

Use the pre-filled credentials on the login screen (DummyJSON test user):

```
username: emilys
password: emilyspass
```

## Getting started

```bash
# 1. install
npm install

# 2. dev
npm run dev              # http://localhost:5173

## Tech stack

| Framework | React 18 + Vite 5 |
| Language | TypeScript (strict mode) |
| Routing | React Router v6 (browser router, route-level lazy) |
| Server state | TanStack Query v5 |
| Client state | Zustand + `persist` middleware |
| Styling | Tailwind CSS v3 with CSS-variable-driven theming (light/dark) |
| Drag & drop | `@dnd-kit/core` + `@dnd-kit/sortable` |
| Charts | Recharts (responsive containers) |
| Icons | lucide-react (SVG only — not a component library) 
