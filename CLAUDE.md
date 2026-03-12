# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Frontend (run from `frontend/`)

```bash
npm run dev       # Start dev server at http://localhost:5173
npm run build     # Type-check + production build
npm run lint      # Run ESLint
npm run preview   # Preview production build
```

### Backend (run from `backend/`)

```bash
dotnet build                          # Build entire solution
dotnet run --project Budget.Api       # Run API at http://localhost:5000
dotnet test Budget.IntegrationTests   # Run integration tests (xUnit, uses SQLite in-memory)
dotnet build Budget.Database          # Build database project (produces dacpac)
./scripts/deploy-db.sh               # Build dacpac + publish schema to SQL Server (reads appsettings.Development.json)
```

### Docker (from repo root)

```bash
docker compose up -d   # Start frontend (port 3000), backend (port 5000), and SQL Server (port 1433)
docker compose down         # Stop all services
```

## Architecture

### Frontend

**Stack:** React 19 + TypeScript + Vite + Tailwind CSS v4 + React Router v7 + Recharts

Central `AppContext` (`frontend/src/context/`) uses `useReducer` with localStorage persistence. Data source is switchable via `VITE_DATA_SOURCE=local` (default) or `VITE_DATA_SOURCE=api` using the repository layer (`frontend/src/repositories/`).

Six main pages under `frontend/src/pages/`: Dashboard, Transactions, Categories, Accounts, Future, Settings.

### Backend

**Stack:** .NET 10 + ASP.NET Core + Entity Framework Core + SQL Server + ASP.NET Identity + JWT Auth

**Solution:** `backend/Budget.sln` with three projects:

| Project | Description |
|---------|-------------|
| `Budget.Api` | ASP.NET Core Web API — controllers, services, EF Core DbContext |
| `Budget.Database` | SQL Server Database Project (sqlproj) — schema definitions, produces dacpac |
| `Budget.IntegrationTests` | xUnit integration tests using `WebApplicationFactory` + SQLite in-memory |

**Project layout:**
```
backend/Budget.Api/
├── Controllers/       # API endpoints (Auth, Accounts, Categories, Months, Recurring, Settings, Transactions)
├── Models/            # EF Core entity models
├── Services/          # Business logic (interface + implementation per domain)
├── DTOs/              # Request/response objects organized by domain
├── DataAccess/        # BudgetDbContext + entity configurations
└── Program.cs         # Service registration, auth, CORS, middleware
```

**Auth:** JWT Bearer tokens with refresh token support. Access tokens expire in 15 min, refresh tokens in 7 days.

**CORS:** Allows `http://localhost:5173` (Vite dev) and `http://localhost:3000` (Docker Nginx).

### Database

SQL Server Database Project (`backend/Budget.Database/`) using `Microsoft.Build.Sql` SDK v2.1.0. Schema is defined in `.sql` files under `Tables/` and deployed via dacpac.

All data entities include `UserId` foreign key to `AspNetUsers` for per-user data isolation.

### Integration Tests

Tests use `WebApplicationFactory<Program>` with SQLite in-memory replacing SQL Server. Auth helpers generate test JWTs and seed users.

```bash
# Run all tests
dotnet test backend/Budget.IntegrationTests

# Run a specific test class
dotnet test backend/Budget.IntegrationTests --filter "FullyQualifiedName~AccountsCrudTests"
```

Test categories: Auth (register, login, logout, refresh), Accounts, Categories, Months, Transactions, Recurring, Settings.

### OpenAPI Spec

`/api/openapi.yaml` contains the full API specification.
