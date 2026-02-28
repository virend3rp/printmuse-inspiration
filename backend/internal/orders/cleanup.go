package orders

import (
	"context"
	"database/sql"
	"log"
	"time"

	sqlcdb "github.com/virend3rp/ecommerce/backend/internal/db/sqlc"
)

func StartCleanupJob(db *sql.DB) {
	go func() {
		ticker := time.NewTicker(1 * time.Minute)
		defer ticker.Stop()

		for range ticker.C {
			runCleanup(db)
		}
	}()
}

func runCleanup(db *sql.DB) {

	ctx := context.Background()
	q := sqlcdb.New(db)

	expiredOrders, err := q.ListExpiredPendingOrders(ctx)
	if err != nil {
		log.Println("cleanup: failed to list expired orders:", err)
		return
	}

	for _, order := range expiredOrders {

		tx, err := db.BeginTx(ctx, nil)
		if err != nil {
			continue
		}

		qtx := sqlcdb.New(tx)

		items, err := qtx.ListOrderItemsByOrderID(ctx, order.ID)
		if err != nil {
			tx.Rollback()
			continue
		}

		for _, item := range items {
			_ = qtx.ReleaseVariantStock(ctx, sqlcdb.ReleaseVariantStockParams{
				ID:  item.VariantID,
				Qty: item.Qty,
			})
		}
		if _, err := qtx.UpdateOrderStatus(ctx, sqlcdb.UpdateOrderStatusParams{
			ID:     order.ID,
			Status: "expired",
		}); err != nil {
			tx.Rollback()
			continue
		}

		tx.Commit()
	}
}