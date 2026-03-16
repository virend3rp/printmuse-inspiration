package utils

import "testing"

func TestHashPassword_ProducesNonEmptyHash(t *testing.T) {
	hash, err := HashPassword("securepassword")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if hash == "" {
		t.Fatal("expected non-empty hash")
	}
}

func TestCheckPassword_CorrectPassword(t *testing.T) {
	password := "correcthorsebatterystaple"
	hash, _ := HashPassword(password)

	if !CheckPassword(password, hash) {
		t.Error("expected CheckPassword to return true for correct password")
	}
}

func TestCheckPassword_WrongPassword(t *testing.T) {
	hash, _ := HashPassword("realpassword")

	if CheckPassword("wrongpassword", hash) {
		t.Error("expected CheckPassword to return false for wrong password")
	}
}

func TestHashPassword_UniqueHashes(t *testing.T) {
	password := "samepassword"
	hash1, _ := HashPassword(password)
	hash2, _ := HashPassword(password)

	// bcrypt includes a random salt so identical passwords produce different hashes
	if hash1 == hash2 {
		t.Error("expected different hashes for the same password due to random salt")
	}
	// Both hashes should still validate correctly
	if !CheckPassword(password, hash1) || !CheckPassword(password, hash2) {
		t.Error("both hashes should validate the original password")
	}
}

func TestCheckPassword_EmptyPassword(t *testing.T) {
	hash, _ := HashPassword("somepassword")
	if CheckPassword("", hash) {
		t.Error("expected false for empty password against non-empty hash")
	}
}
