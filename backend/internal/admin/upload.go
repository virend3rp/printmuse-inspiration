package admin

import (
	"io"
	"net/http"
	"os"

	"github.com/virend3rp/ecommerce/backend/internal/services"
	"github.com/virend3rp/ecommerce/backend/internal/utils"
)

func UploadImageHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		file, header, err := r.FormFile("image")
		if err != nil {
			utils.BadRequest(w, "invalid file")
			return
		}
		defer file.Close()

		// Save temporarily
		tmpFile, err := os.CreateTemp("", header.Filename)
		if err != nil {
			utils.InternalError(w)
			return
		}
		defer os.Remove(tmpFile.Name())

		io.Copy(tmpFile, file)

		url, err := services.UploadImage(tmpFile.Name())
		if err != nil {
			utils.InternalError(w)
			return
		}

		utils.OK(w, map[string]string{
			"url": url,
		})
	}
}