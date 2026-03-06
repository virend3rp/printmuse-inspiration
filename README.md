# PrintMuse — Custom Merchandise E-Commerce Platform

A full-stack e-commerce platform for custom merchandise — keychains, figurines, utility items, and custom prints. Built with a Go backend and Next.js frontend.

---

## Tech Stack

**Backend**
- Go with [Chi](https://github.com/go-chi/chi) router
- PostgreSQL with [SQLC](https://sqlc.dev/) (type-safe generated queries)
- JWT authentication (access + refresh tokens)
- [Razorpay](https://razorpay.com/) payment gateway + webhook verification
- AWS S3 for image storage (presigned upload URLs)
- [Goose](https://github.com/pressly/goose) for database migrations
- Zap structured logging + rate limiting

**Frontend**
- Next.js 15 (App Router) with React 19
- TypeScript
- Tailwind CSS v4
- Axios with automatic JWT refresh on 401

---

## Features

- **Product Catalog** — browse by category (keychains, figurines, utility, custom), product detail pages with image gallery and variant selection
- **Cart** — slide-out drawer, add/remove items, synced with backend
- **Checkout** — shipping address form + Razorpay payment modal
- **Orders** — order history, order detail with live status tracker, retry pending payments
- **Auth** — register/login, JWT with silent refresh, protected routes
- **Admin Panel**
  - Create/update/deactivate products and variants
  - Upload product images directly to S3 via presigned URLs
  - Manage and update order statuses
- **Stock locking** — DB-level transaction prevents overselling
- **Order expiry** — background job cancels unpaid orders after timeout

---

## Project Structure

```
.
├── backend/
│   ├── cmd/api/main.go          # Entry point, router setup
│   ├── internal/
│   │   ├── auth/                # Register, login, token refresh
│   │   ├── catalog/             # Product listing and detail
│   │   ├── cart/                # Cart management
│   │   ├── orders/              # Order creation and retrieval
│   │   ├── payments/            # Razorpay integration + webhook
│   │   ├── admin/               # Admin product/order management
│   │   ├── middleware/          # JWT auth, role check, rate limiter, logger
│   │   ├── db/
│   │   │   ├── migrations/      # Goose SQL migrations
│   │   │   ├── queries/         # Raw SQL queries (input to SQLC)
│   │   │   └── sqlc/            # Generated type-safe DB code
│   │   ├── services/            # Upload service (S3 presigned URLs)
│   │   └── storage/             # S3 uploader
│   └── sqlc.yaml
│
└── frontend/
    └── src/
        ├── app/                 # Next.js App Router pages
        │   ├── products/        # Category + product detail pages
        │   ├── checkout/        # Checkout flow
        │   ├── orders/          # Order history + order detail
        │   ├── admin/           # Admin dashboard
        │   └── login/register/  # Auth pages
        ├── components/          # UI components (Navbar, CartDrawer, etc.)
        ├── hooks/               # useAuth, useCart, useToast
        ├── lib/                 # Axios API client with token refresh
        └── services/            # S3 upload service
```

---

## Getting Started

### Prerequisites

- Go 1.22+
- Node.js 20+
- PostgreSQL
- [Goose](https://github.com/pressly/goose) (`go install github.com/pressly/goose/v3/cmd/goose@latest`)
- [SQLC](https://sqlc.dev/) (`go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest`)
- AWS account with an S3 bucket
- Razorpay account

### Backend Setup

1. Copy and fill in environment variables:
   ```bash
   cp backend/.env.example backend/.env
   ```

   ```env
   DATABASE_URL=postgres://user:password@localhost:5432/ecommerce?sslmode=disable
   RAZORPAY_KEY_ID=
   RAZORPAY_KEY_SECRET=
   RAZORPAY_WEBHOOK_SECRET=
   S3_BUCKET=
   AWS_REGION=
   IMAGE_BASE_URL=https://<bucket>.s3.<region>.amazonaws.com
   AWS_ACCESS_KEY_ID=
   AWS_SECRET_ACCESS_KEY=
   ALLOWED_ORIGIN=http://localhost:3000
   PORT=8080
   ```

2. Run migrations:
   ```bash
   goose -dir backend/internal/db/migrations postgres "$DATABASE_URL" up
   ```

3. Start the backend:
   ```bash
   make backend
   ```

### Frontend Setup

1. Copy and fill in environment variables:
   ```bash
   cp frontend/.env.local.example frontend/.env.local
   ```

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080/api
   NEXT_PUBLIC_RAZORPAY_KEY_ID=
   NEXT_PUBLIC_S3_BASE_URL=https://<bucket>.s3.<region>.amazonaws.com
   ```

2. Install dependencies and start:
   ```bash
   cd frontend && npm install
   make frontend
   ```

The app will be available at `http://localhost:3000`.

---

## Available Commands

| Command | Description |
|---|---|
| `make backend` | Run backend dev server (port 8080) |
| `make frontend` | Run frontend dev server (port 3000) |
| `make build-backend` | Build Go binary to `backend/bin/api` |
| `make test-backend` | Run all Go tests |
| `cd backend && sqlc generate` | Regenerate type-safe DB code from SQL |

---

## API Overview

| Group | Routes | Auth |
|---|---|---|
| `/api/auth/*` | register, login, refresh | Public |
| `/api/products/*` | list, get by category/slug | Public |
| `/api/cart/*` | get, add, remove | JWT |
| `/api/orders/*` | list, create, get, pay | JWT |
| `/api/admin/*` | products, variants, orders, upload | JWT + Admin role |
| `/api/webhooks/razorpay` | payment webhook | Signature verified |

---

## Key Design Decisions

- **SQLC over ORM** — all DB queries are hand-written SQL, type-safe via code generation. No runtime reflection, no magic.
- **Presigned S3 uploads** — the backend issues a short-lived presigned URL; the browser uploads directly to S3. The backend never handles file bytes.
- **Stock locking in a transaction** — order creation locks variant rows and decrements stock atomically, preventing race conditions and overselling.
- **Amounts in rupees** — monetary values are stored as integers (₹), converted to paise only when communicating with Razorpay (`× 100`).
- **Silent JWT refresh** — the Axios client intercepts 401 responses, refreshes the access token, and retries the original request transparently.

---

## License

MIT
