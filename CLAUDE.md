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

### Repository Pattern (Local vs API)

`frontend/src/repositories/` abstracts data access behind interfaces (`ITransactionRepository`, `IRecurringRepository`, etc.). Controlled by `VITE_DATA_SOURCE`:

- **`local`** (default): Repositories dispatch actions to `appReducer`, which creates/updates data in-memory and persists to localStorage. The reducer contains the full business logic (ID generation, pending transaction creation, etc.).
- **`api`**: Repositories make REST calls to the backend, then dispatch actions to cache the server response in state. The backend owns the business logic; the reducer just stores what the API returns.

When adding features, both paths must be updated: the reducer logic (for local mode) and the backend service (for API mode).

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

**Schema is deployed via dacpac, NOT EF Core migrations.** There are no migration files. To change the schema: edit the `.sql` files in `Tables/`, then run `./scripts/deploy-db.sh` to build and publish. The dacpac tool diffs against the live database and applies only the changes.

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

## Key Domain Concepts

### Transaction Types

Transactions have a `type` field: `expense`, `income`, or `transfer`.

- **expense/income**: Optional `accountId` links to an account. Optional `categoryId` links to a budget category.
- **transfer**: Requires both `accountId` (source) and `toAccountId` (destination). The backend validates this. Optional `categoryId` — transfers can count toward a budget category's spend limit (e.g., a checking-to-savings transfer counting against a "Savings" budget item).

Account balances are calculated from `initialBalance` + confirmed transaction effects (income adds, expense subtracts, transfer subtracts from source / adds to destination).

### Category Templates vs Month Categories

These are two separate entities with **different ID spaces**:

- **CategoryTemplates** (`settings.categoryTemplates`): User-defined templates in Settings. Recurring transactions store a template ID as their `categoryId`.
- **Categories** (`monthBudget.categories`): Per-month instances created when a month is initialized from templates. Each category has a `templateId` field linking it back to the template it was created from.

When generating pending transactions from recurring, the template ID must be **resolved** to the actual month category ID. The `resolveCategory` helper in `appReducer.ts` handles this: tries `templateId` match first, falls back to name matching for months created before `templateId` existed.

### Recurring Transactions and Pending Workflow

1. User creates a recurring transaction in Settings (stores template ID for category, supports expense/income/transfer types)
2. When a new month is initialized (`INIT_MONTH` / `MonthService.InitAsync`), pending transactions are generated from all active recurring transactions
3. When a recurring is created mid-month (`ADD_RECURRING` / `RecurringTransactionService.CreateAsync`), a pending transaction is also created for the current month
4. Pending transactions appear in the `PendingRecurring` banner on the Transactions page
5. User confirms (changes status to `confirmed`) or dismisses (deletes) each pending transaction

Category ID resolution (template ID → actual month category ID) happens at step 2 and 3, not at confirm time.

## Gotchas

- **TypeScript `erasableSyntaxOnly`** is enabled — you cannot use class constructor parameter properties (`constructor(private x: number)`) or other non-erasable syntax.
- **Port 5000 on macOS** conflicts with AirPlay Receiver (ControlCenter). Use port 5001 or disable AirPlay if the port is taken.
- **SQL Server Docker image** is AMD64-only. On Apple Silicon it runs under Rosetta (may show a platform warning).
- **Pre-existing lint warnings** — do not attempt to fix these, they are known and accepted:
  - `react-hooks/set-state-in-effect` in CategoryModal, TransactionModal, Sidebar
  - `@typescript-eslint/no-unused-expressions` in AlertsBanner
  - `@typescript-eslint/no-explicit-any` in AppContext
  - `react-refresh/only-export-components` in AppContext
