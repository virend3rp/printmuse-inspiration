package storage

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type S3Uploader struct {
	client *s3.Client
	bucket string
	region string
}

func NewS3Uploader(bucket string, region string) (*S3Uploader, error) {

	log.Println("Initializing S3 uploader")
	log.Println("Bucket:", bucket)
	log.Println("Region:", region)

	cfg, err := config.LoadDefaultConfig(
		context.TODO(),
		config.WithRegion(region),
	)

	if err != nil {
		return nil, err
	}

	client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.UsePathStyle = false
	})

	log.Println("S3 client created successfully")

	return &S3Uploader{
		client: client,
		bucket: bucket,
		region: region,
	}, nil
}

func (u *S3Uploader) GeneratePresignedUploadURL(
	ctx context.Context,
	key string,
) (string, error) {

	log.Println("Generating presigned upload URL")
	log.Println("Bucket:", u.bucket)
	log.Println("Key:", key)

	presignClient := s3.NewPresignClient(u.client)

	req, err := presignClient.PresignPutObject(
		ctx,
		&s3.PutObjectInput{
			Bucket:      aws.String(u.bucket),
			Key:         aws.String(key),
			ContentType: aws.String("image/png"),
		},
		s3.WithPresignExpires(5*time.Minute),
	)

	if err != nil {
		log.Println("Error generating presigned URL:", err)
		return "", err
	}

	log.Println("Generated Upload URL:", req.URL)

	return req.URL, nil
}

func (u *S3Uploader) PublicURL(key string) string {

	url := fmt.Sprintf(
		"https://%s.s3.%s.amazonaws.com/%s",
		u.bucket,
		u.region,
		key,
	)

	log.Println("Generated public file URL:", url)

	return url
}

func (u *S3Uploader) Bucket() string {
	return u.bucket
}

func (u *S3Uploader) Region() string {
	return u.region
}