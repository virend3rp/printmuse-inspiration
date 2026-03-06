# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Backend (Go)
```bash
make backend              # Run backend dev server (port 8080)
make build-backend        # Build binary to backend/bin/api
make test-backend         # Run all Go tests (go test ./...)
cd backend && go test ./internal/auth/...  # Run tests in a single package
```

### Frontend (Next.js)
```bash
make frontend             # Run frontend dev server (port 3000)
cd frontend && npm run build   # Production build
cd frontend && npm run lint    # ESLint check
```

### Database Migrations (Goose)
```bash
goose -dir backend/internal/db/migrations postgres "$DATABASE_URL" up    # Apply migrations
goose -dir backend/internal/db/migrations postgres "$DATABASE_URL" down  # Rollback last
```

### SQLC Code Generation
```bash
cd backend && sqlc generate   # Regenerate type-safe DB code from SQL queries
```

## Architecture Overview

This is a full-stack e-commerce monorepo (custom merchandise: keychains, figurines, utility, custom items).

### Backend (`/backend`)

**Chi router** with middleware chain: structured logging (Zap) → rate limiting → CORS → JWT auth → role check.

Route groups in `cmd/api/main.go`:
- `/api/auth/*` — public (register, login, refresh token)
- `/api/products/*` — public catalog
- `/api/cart/*`, `/api/orders/*`, `/api/payments/*` — requires JWT (`AuthMiddleware`)
- `/api/admin/*` — requires JWT + admin role (`RequireAdmin`)
- `/api/webhooks/razorpay` — Razorpay signature-verified webhook

**Database layer** uses SQLC (type-safe generated code). Never hand-write DB queries — add SQL to `internal/db/queries/*.sql` and run `sqlc generate`. The generated types live in `internal/db/sqlc/`.

**Amounts are stored in paise** (integer), not rupees, to avoid float precision issues.

**Order flow**: Cart → Create Order (locks stock via DB transaction) → Create Razorpay payment → Webhook confirms payment → Order status updates.

**S3 integration**: Admin requests a presigned upload URL (`POST /api/admin/upload-url`), frontend uploads directly to S3, then saves the resulting URL to the product. Images served from `IMAGE_BASE_URL`.

**JWT**: Access tokens expire in 15 minutes; refresh tokens expire in 7 days. Token refresh is handled automatically in the frontend API client.

### Frontend (`/frontend`)

Next.js App Router with React 19, TypeScript, Tailwind CSS v4.

**API client** (`src/lib/api.ts`): Axios instance that auto-refreshes JWT access tokens on 401. All authenticated requests go through this client.

**Admin API** (`src/lib/admin.ts`): Separate utilities for admin-only API calls.

**Auth and Cart** are React contexts provided globally in the root layout (`app/layout.tsx`) via `Providers.tsx`.

Key data flow:
- `useAuth` hook manages JWT tokens stored in cookies via `js-cookie`
- `useCart` hook manages cart state synced with the backend
- Product images upload via `uploadService.ts` using presigned S3 URLs

**Product categories** are constrained to: `keychains`, `figurines`, `utility`, `custom`.

### Environment Variables

**Backend** (`backend/.env`):
```
DATABASE_URL=postgres://...
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
S3_BUCKET=
AWS_REGION=
IMAGE_BASE_URL=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
PORT=8080
```

**Frontend** (`frontend/.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_RAZORPAY_KEY_ID=
NEXT_PUBLIC_S3_BASE_URL=
```

### Key Design Decisions

- **SQLC over ORM**: All DB access is type-safe generated code. Add queries in `internal/db/queries/`, run `sqlc generate`.
- **Presigned S3 URLs**: Images are uploaded client-side directly to S3; the backend never proxies file data.
- **Paise for money**: All monetary values in the DB and API are integers in paise (1 INR = 100 paise).
- **Stock locking**: Order creation uses a DB transaction to lock and decrement stock, preventing overselling.
