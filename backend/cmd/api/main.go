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
	"github.com/virend3rp/ecommerce/backend/internal/storage"
	"github.com/virend3rp/ecommerce/backend/internal/services"
)

func main() {

	// ------------------------------------------------
	// LOAD ENV
	// ------------------------------------------------

	_ = godotenv.Load()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// ------------------------------------------------
	// LOGGER
	// ------------------------------------------------

	logger, err := zap.NewProduction()
	if err != nil {
		log.Fatal(err)
	}
	defer logger.Sync()

	// ------------------------------------------------
	// DATABASE
	// ------------------------------------------------

	pool, err := db.Connect(os.Getenv("DATABASE_URL"))
	if err != nil {
		logger.Fatal("database connection failed", zap.Error(err))
	}
	defer pool.Close()

	// ------------------------------------------------
	// S3 STORAGE
	// ------------------------------------------------
		bucket := os.Getenv("S3_BUCKET")
		region := os.Getenv("AWS_REGION")

		s3Uploader, err := storage.NewS3Uploader(bucket, region)
		if err != nil {
			logger.Fatal("failed to initialize S3 uploader", zap.Error(err))
		}

		uploadService := services.NewUploadService(s3Uploader)

	// ------------------------------------------------
	// BACKGROUND JOBS
	// ------------------------------------------------

	orders.StartCleanupJob(pool)

	// ------------------------------------------------
	// ROUTER
	// ------------------------------------------------

	r := chi.NewRouter()

	allowedOrigin := os.Getenv("ALLOWED_ORIGIN")
	if allowedOrigin == "" {
		allowedOrigin = "http://localhost:3000"
	}
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{allowedOrigin},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Use(chimiddleware.RequestID)
	r.Use(chimiddleware.RealIP)
	r.Use(middleware.RequestLogger(logger))
	r.Use(chimiddleware.Recoverer)

	// ------------------------------------------------
	// HEALTH CHECK
	// ------------------------------------------------

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("OK"))
	})

	// ------------------------------------------------
	// API ROUTES
	// ------------------------------------------------

	r.Route("/api", func(api chi.Router) {

		// ---------------- PUBLIC ----------------

		api.Route("/auth", func(authR chi.Router) {
			authR.Use(middleware.RateLimiter(5, 2))

			authR.Post("/register", auth.Register(pool))
			authR.Post("/login", auth.Login(pool))
			authR.Post("/refresh", auth.Refresh(pool))
		})

		api.Get("/products", catalog.ListProducts(pool))
		api.Get("/products/{category}/{slug}", catalog.GetProduct(pool))

		api.Post("/webhooks/razorpay", payments.HandleWebhook(pool))

		// ---------------- PROTECTED ----------------

		api.Group(func(protected chi.Router) {

			protected.Use(middleware.Authenticate)

			protected.Post("/cart/add", cart.AddItem(pool))
			protected.Get("/cart", cart.GetCart(pool))
			protected.Delete("/cart/{itemId}", cart.RemoveItem(pool))

			protected.With(middleware.RateLimiter(5, 2)).
				Post("/orders", orders.CreateOrder(pool))

			protected.Get("/orders", orders.ListOrders(pool))
			protected.Get("/orders/{id}", orders.GetOrder(pool))
			protected.Post("/orders/{orderId}/pay", payments.CreatePayment(pool))
		})

		// ---------------- ADMIN ----------------

		api.Route("/admin", func(adminR chi.Router) {

			adminR.Use(middleware.Authenticate)
			adminR.Use(middleware.RequireRole("admin"))

			// PRODUCTS
			adminR.Post("/products", admin.CreateProduct(pool))
			adminR.Put("/products/{id}", admin.UpdateProduct(pool))
			adminR.Get("/products", admin.ListProducts(pool))
			adminR.Get("/products/{id}", admin.GetProductByID(pool))
			adminR.Delete("/products/{id}", admin.DeactivateProduct(pool))
			
			// VARIANTS
			adminR.Post("/variants", admin.CreateVariant(pool))
			adminR.Put("/variants", admin.UpdateVariant(pool))

			// ORDERS
			adminR.Get("/orders", admin.ListOrders(pool))
			adminR.Put("/orders/status", admin.UpdateOrderStatus(pool))

			// IMAGE UPLOAD
			adminR.Post("/upload-url", admin.GenerateUploadURLHandler(uploadService))
		})
	})

	// ------------------------------------------------
	// SERVER
	// ------------------------------------------------

	server := &http.Server{
		Addr:    ":" + port,
		Handler: r,
	}

	go func() {
		fmt.Printf("Server running on :%s\n", port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatal("server failed", zap.Error(err))
		}
	}()

	// ------------------------------------------------
	// GRACEFUL SHUTDOWN
	// ------------------------------------------------

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	<-quit
	fmt.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		logger.Error("server shutdown failed", zap.Error(err))
	}

	fmt.Println("Server exited properly")
}