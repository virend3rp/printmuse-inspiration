# ── Stage 1: build ────────────────────────────────────────────────────────────
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Cache deps before copying source
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o bin/api ./cmd/api/

# ── Stage 2: runtime ──────────────────────────────────────────────────────────
FROM scratch

COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /app/bin/api /api

EXPOSE 8080

ENTRYPOINT ["/api"]
