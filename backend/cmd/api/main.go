package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
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

	// -----------------------------
	// Global Middleware (Order Matters)
	// -----------------------------

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

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

		// Public
		api.Route("/auth", func(authR chi.Router) {
			authR.Use(middleware.RateLimiter(5, 2))
			authR.Post("/register", auth.Register(pool))
			authR.Post("/login", auth.Login(pool))
			authR.Post("/refresh", auth.Refresh(pool))
		})

		api.Get("/products", catalog.ListProducts(pool))
		api.Get("/products/{slug}", catalog.GetProduct(pool))
		api.Post("/webhooks/razorpay", payments.HandleWebhook(pool))

		// Protected
		api.Group(func(protected chi.Router) {
			protected.Use(middleware.Authenticate)

			protected.Post("/cart/add", cart.AddItem(pool))
			protected.Get("/cart", cart.GetCart(pool))
			protected.Delete("/cart/{itemId}", cart.RemoveItem(pool))

			protected.With(middleware.RateLimiter(5, 2)).
				Post("/orders", orders.CreateOrder(pool))

			protected.Get("/orders/{id}", orders.GetOrder(pool))
			protected.Post("/orders/{orderId}/pay", payments.CreatePayment(pool))
		})

		// Admin
		api.Route("/admin", func(adminR chi.Router) {
			adminR.Use(middleware.Authenticate)
			adminR.Use(middleware.RequireRole("admin"))

			adminR.Post("/products", admin.CreateProduct(pool))
			adminR.Put("/products", admin.UpdateProduct(pool))
			adminR.Get("/products", admin.ListProducts(pool))
			adminR.Put("/products/{id}/deactivate", admin.DeactivateProduct(pool))

			adminR.Post("/variants", admin.CreateVariant(pool))
			adminR.Put("/variants", admin.UpdateVariant(pool))

			adminR.Get("/orders", admin.ListOrders(pool))
			adminR.Put("/orders/status", admin.UpdateOrderStatus(pool))
		})
	})

	// -----------------------------
	// Graceful Shutdown
	// -----------------------------

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	server := &http.Server{
		Addr:    ":" + port,
		Handler: r,
	}

	go func() {
		fmt.Printf("Server running on :%s\n", port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	fmt.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Printf("server shutdown failed: %v\n", err)
	}

	fmt.Println("Server exited properly")
}