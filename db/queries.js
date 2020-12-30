export const addNewUser = `INSERT INTO users("id", "firstname", "lastname", "dob", "salt", "email", "password") 
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;`

export const getUser = `SELECT * FROM users where "email" = $1;`