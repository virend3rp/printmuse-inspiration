.PHONY: backend frontend build-backend test-backend clean

# Run backend in dev mode
backend:
	cd backend && go run cmd/api/main.go

# Run frontend in dev mode
frontend:
	cd frontend && npm run dev

# Build backend binary
build-backend:
	cd backend && go build -o ./bin/api ./cmd/api

# Run backend tests
test-backend:
	cd backend && go test ./...

# Clean build artifacts
clean:
	rm -rf backend/bin