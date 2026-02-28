package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"go.uber.org/zap"
	"github.com/joho/godotenv"
	"github.com/virend3rp/ecommerce/backend/internal/auth"
	"github.com/virend3rp/ecommerce/backend/internal/db"
	"github.com/virend3rp/ecommerce/backend/internal/middleware"
	"github.com/virend3rp/ecommerce/backend/internal/catalog"
	"github.com/virend3rp/ecommerce/backend/internal/cart"
	"github.com/virend3rp/ecommerce/backend/internal/orders"
	"github.com/virend3rp/ecommerce/backend/internal/payments"
)

func main() {
	_ = godotenv.Load()

	fmt.Println("DATABASE_URL =", os.Getenv("DATABASE_URL"))
	logger, _ := zap.NewProduction()
	defer logger.Sync()
	pool, err := db.Connect(os.Getenv("DATABASE_URL"))
	if err != nil {

		log.Fatalf("failed to connect to database: %v", err)
	}
	defer pool.Close()
	orders.StartCleanupJob(pool)
	r := chi.NewRouter()

	// global middleware
	r.Use(chimiddleware.RequestID)
	r.Use(chimiddleware.RealIP)
	r.Use(middleware.RequestLogger(logger))
	r.Use(chimiddleware.Recoverer)

	// health
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("OK"))
	})

	// api routes
	r.Route("/api", func(r chi.Router) {

		r.Route("/auth", func(r chi.Router) {

			// rate limit auth endpoints
			r.Use(middleware.RateLimiter(5, 2))

			r.Post("/register", auth.Register(pool))
			r.Post("/login", auth.Login(pool))
			r.Post("/refresh", auth.Refresh(pool))
		})
	})
	r.Get("/products", catalog.ListProducts(pool))
	r.Get("/products/{slug}", catalog.GetProduct(pool))
	r.Group(func(r chi.Router) {
	r.Use(middleware.Authenticate)

	r.Post("/cart/add", cart.AddItem(pool))
	r.Get("/cart", cart.GetCart(pool))
	r.Delete("/cart/{itemId}", cart.RemoveItem(pool))
})
r.With(middleware.RateLimiter(5, 2)).
	Post("/orders", orders.CreateOrder(pool))

r.Get("/orders/{id}", orders.GetOrder(pool))
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	r.Post("/orders/{orderId}/pay", payments.CreatePayment(pool))
	r.Post("/webhooks/razorpay", payments.HandleWebhook(pool))

	fmt.Printf("Server running on :%s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}