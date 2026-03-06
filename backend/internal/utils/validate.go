package utils

import (
	"encoding/json"
	"errors"
	"net/http"
	"regexp"
	"strings"
)

var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)
var slugNonAlnum = regexp.MustCompile(`[^a-z0-9\s-]`)
var slugSpaces = regexp.MustCompile(`[\s-]+`)

func DecodeJSON(r *http.Request, dst any) error {
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(dst); err != nil {
		return errors.New("invalid request body")
	}
	return nil
}

func ValidateEmail(email string) bool {
	return emailRegex.MatchString(email)
}

func ValidatePassword(password string) bool {
	return len(password) >= 8
}

func Slugify(s string) string {
	s = strings.ToLower(s)
	s = slugNonAlnum.ReplaceAllString(s, "")
	s = slugSpaces.ReplaceAllString(s, "-")
	return strings.Trim(s, "-")
}