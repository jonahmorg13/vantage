# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from the `frontend/` directory:

```bash
npm run dev       # Start dev server at http://localhost:5173
npm run build     # Type-check + production build
npm run lint      # Run ESLint
npm run preview   # Preview production build
```

Docker (from repo root):
```bash
docker compose up --build   # Build and serve frontend via Nginx on port 3000
```

## Architecture

This is a **frontend-only SPA** — no backend yet. All data persists in `localStorage`.

**Stack:** React 19 + TypeScript + Vite + Tailwind CSS v4 + React Router v7 + Recharts

### State Management

Central `AppContext` (`frontend/src/context/`) uses `useReducer` with localStorage persistence and migration logic. The state shape:

```
AppState
├── settings (defaultTakeHomePay, categoryTemplates)
├── monthBudgets (per-month category allocations)
├── transactions (expense/income/transfer records)
├── recurringTransactions (bill templates)
├── accounts (checking, savings, brokerage, retirement, etc.)
└── currentMonthKey (YYYY-MM)
```

### Routing & Pages

Six main pages under `frontend/src/pages/`:
- `DashboardPage` — overview charts and stats
- `TransactionsPage` — transaction management
- `CategoriesPage` — budget category allocation
- `AccountsPage` — account management
- `FuturePage` — recurring transactions/future planning
- `SettingsPage` — app configuration

### Planned Backend

A commented-out ASP.NET Core backend exists in `docker-compose.yml`. Planned features include login/auth, Plaid integration, and an admin dashboard (see `.todo.txt`).
