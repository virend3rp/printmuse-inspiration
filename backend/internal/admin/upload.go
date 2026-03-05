package admin

import (
	"net/http"

	"github.com/virend3rp/ecommerce/backend/internal/services"
	"github.com/virend3rp/ecommerce/backend/internal/utils"
)

type uploadRequest struct {
	Filename    string `json:"filename"`
	ProductSlug string `json:"product_slug"`
}

type uploadResponse struct {
	UploadURL string `json:"upload_url"`
	FileURL   string `json:"file_url"`
}

func GenerateUploadURLHandler(uploadService *services.UploadService) http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {

		var req uploadRequest

		if err := utils.DecodeJSON(r, &req); err != nil {
			utils.BadRequest(w, "invalid request body")
			return
		}

		if req.Filename == "" {
			utils.BadRequest(w, "filename is required")
			return
		}

		if req.ProductSlug == "" {
			utils.BadRequest(w, "product_slug is required")
			return
		}

		uploadURL, fileURL, err := uploadService.GenerateUploadURL(
			r.Context(),
			req.ProductSlug,
			req.Filename,
		)

		if err != nil {
			utils.InternalError(w)
			return
		}

		resp := uploadResponse{
			UploadURL: uploadURL,
			FileURL:   fileURL,
		}

		utils.OK(w, resp)
	}
}