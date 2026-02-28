-- name: CreateUser :one
INSERT INTO users (email, password_hash, role)
VALUES (@email, @password_hash, @role)
RETURNING *;

-- name: GetUserByEmail :one
SELECT * FROM users
WHERE email = @email
LIMIT 1;

-- name: GetUserByID :one
SELECT * FROM users
WHERE id = @id
LIMIT 1;