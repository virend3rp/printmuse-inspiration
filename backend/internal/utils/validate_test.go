package utils

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestValidateEmail(t *testing.T) {
	tests := []struct {
		email string
		valid bool
	}{
		{"user@example.com", true},
		{"user.name+tag@sub.domain.org", true},
		{"user@domain.co.in", true},
		{"", false},
		{"notanemail", false},
		{"missing@", false},
		{"@nodomain.com", false},
		{"spaces @example.com", false},
		{"user@.com", false},
	}

	for _, tt := range tests {
		t.Run(tt.email, func(t *testing.T) {
			got := ValidateEmail(tt.email)
			if got != tt.valid {
				t.Errorf("ValidateEmail(%q) = %v, want %v", tt.email, got, tt.valid)
			}
		})
	}
}

func TestValidatePassword(t *testing.T) {
	tests := []struct {
		password string
		valid    bool
	}{
		{"12345678", true},
		{"longpassword", true},
		{"exactly8", true},
		{"short", false},
		{"1234567", false},
		{"", false},
	}

	for _, tt := range tests {
		t.Run(tt.password, func(t *testing.T) {
			got := ValidatePassword(tt.password)
			if got != tt.valid {
				t.Errorf("ValidatePassword(%q) = %v, want %v", tt.password, got, tt.valid)
			}
		})
	}
}

func TestSlugify(t *testing.T) {
	tests := []struct {
		input string
		want  string
	}{
		{"Hello World", "hello-world"},
		{"  Leading and trailing  ", "leading-and-trailing"},
		{"Special @#$% Chars!", "special-chars"},
		{"Multiple   Spaces", "multiple-spaces"},
		{"already-slugified", "already-slugified"},
		{"UPPERCASE", "uppercase"},
		{"CamelCase Product Name", "camelcase-product-name"},
	}

	for _, tt := range tests {
		t.Run(tt.input, func(t *testing.T) {
			got := Slugify(tt.input)
			if got != tt.want {
				t.Errorf("Slugify(%q) = %q, want %q", tt.input, got, tt.want)
			}
		})
	}
}

func TestDecodeJSON_Valid(t *testing.T) {
	type payload struct {
		Name string `json:"name"`
	}

	body := bytes.NewBufferString(`{"name":"test"}`)
	r := httptest.NewRequest(http.MethodPost, "/", body)

	var dst payload
	if err := DecodeJSON(r, &dst); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if dst.Name != "test" {
		t.Errorf("got Name %q, want %q", dst.Name, "test")
	}
}

func TestDecodeJSON_UnknownField(t *testing.T) {
	type payload struct {
		Name string `json:"name"`
	}

	body := bytes.NewBufferString(`{"name":"test","unknown":"field"}`)
	r := httptest.NewRequest(http.MethodPost, "/", body)

	var dst payload
	if err := DecodeJSON(r, &dst); err == nil {
		t.Fatal("expected error for unknown field, got nil")
	}
}

func TestDecodeJSON_Malformed(t *testing.T) {
	body := bytes.NewBufferString(`{not valid json`)
	r := httptest.NewRequest(http.MethodPost, "/", body)

	var dst map[string]any
	if err := DecodeJSON(r, &dst); err == nil {
		t.Fatal("expected error for malformed JSON, got nil")
	}
}
