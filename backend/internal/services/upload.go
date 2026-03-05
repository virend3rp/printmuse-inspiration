package services

import (
	"context"
	"fmt"
	"os"
	"path/filepath"

	"github.com/google/uuid"
	"github.com/virend3rp/ecommerce/backend/internal/storage"
)

type UploadService struct {
	storage *storage.S3Uploader
}

func NewUploadService(s *storage.S3Uploader) *UploadService {
	return &UploadService{
		storage: s,
	}
}

func (s *UploadService) GenerateUploadURL(
	ctx context.Context,
	productSlug string,
	filename string,
) (string, string, error) {

	baseURL := os.Getenv("IMAGE_BASE_URL")
	if baseURL == "" {
		return "", "", fmt.Errorf("IMAGE_BASE_URL not configured")
	}

	ext := filepath.Ext(filename)
	if ext == "" {
		return "", "", fmt.Errorf("invalid filename")
	}

	fileID := uuid.New().String()

	key := fmt.Sprintf(
		"products/%s/%s%s",
		productSlug,
		fileID,
		ext,
	)

	uploadURL, err := s.storage.GeneratePresignedUploadURL(ctx, key)
	if err != nil {
		return "", "", err
	}

	fileURL := fmt.Sprintf("%s/%s", baseURL, key)

	return uploadURL, fileURL, nil
}