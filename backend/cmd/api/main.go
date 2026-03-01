package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/joho/godotenv"
	"go.uber.org/zap"

	"github.com/virend3rp/ecommerce/backend/internal/admin"
	"github.com/virend3rp/ecommerce/backend/internal/auth"
	"github.com/virend3rp/ecommerce/backend/internal/cart"
	"github.com/virend3rp/ecommerce/backend/internal/catalog"
	"github.com/virend3rp/ecommerce/backend/internal/db"
	"github.com/virend3rp/ecommerce/backend/internal/middleware"
	"github.com/virend3rp/ecommerce/backend/internal/orders"
	"github.com/virend3rp/ecommerce/backend/internal/payments"
)

func main() {
	_ = godotenv.Load()

	logger, _ := zap.NewProduction()
	defer logger.Sync()

	pool, err := db.Connect(os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	defer pool.Close()

	orders.StartCleanupJob(pool)

	r := chi.NewRouter()

	// Global middleware
	r.Use(chimiddleware.RequestID)
	r.Use(chimiddleware.RealIP)
	r.Use(middleware.RequestLogger(logger))
	r.Use(chimiddleware.Recoverer)

	// Health
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("OK"))
	})

	// -----------------------------
	// API Routes
	// -----------------------------
	r.Route("/api", func(api chi.Router) {

		// ---------- Public ----------
		api.Route("/auth", func(authR chi.Router) {
			authR.Use(middleware.RateLimiter(5, 2))
			authR.Post("/register", auth.Register(pool))
			authR.Post("/login", auth.Login(pool))
			authR.Post("/refresh", auth.Refresh(pool))
		})

		api.Get("/products", catalog.ListProducts(pool))
		api.Get("/products/{slug}", catalog.GetProduct(pool))

		api.Post("/webhooks/razorpay", payments.HandleWebhook(pool))

		// ---------- Protected ----------
		api.Group(func(protected chi.Router) {
			protected.Use(middleware.Authenticate)

			// Cart
			protected.Post("/cart/add", cart.AddItem(pool))
			protected.Get("/cart", cart.GetCart(pool))
			protected.Delete("/cart/{itemId}", cart.RemoveItem(pool))

			// Orders
			protected.With(middleware.RateLimiter(5, 2)).
				Post("/orders", orders.CreateOrder(pool))

			protected.Get("/orders/{id}", orders.GetOrder(pool))
			protected.Post("/orders/{orderId}/pay", payments.CreatePayment(pool))
		})

		// ---------- Admin ----------
		api.Route("/admin", func(adminR chi.Router) {
			adminR.Use(middleware.Authenticate)
			adminR.Use(middleware.RequireRole("admin"))

			// Products
			adminR.Post("/products", admin.CreateProduct(pool))
			adminR.Put("/products", admin.UpdateProduct(pool))
			adminR.Get("/products", admin.ListProducts(pool))
			adminR.Put("/products/{id}/deactivate", admin.DeactivateProduct(pool))

			// Variants
			adminR.Post("/variants", admin.CreateVariant(pool))
			adminR.Put("/variants", admin.UpdateVariant(pool))

			// Orders
			adminR.Get("/orders", admin.ListOrders(pool))
			adminR.Put("/orders/status", admin.UpdateOrderStatus(pool))
		})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Server running on :%s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}