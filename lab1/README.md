# lab1: Minimal CRUD API with JWT Auth

Quick start:

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm start
```

API endpoints:

- POST /auth/register { username, password }
- POST /auth/login { username, password } => { token }
- GET /items
- GET /items/:id
- POST /items (Authorization: Bearer <token>) { name, description }
- PUT /items/:id (Authorization: Bearer <token>) { name?, description? }
- DELETE /items/:id (Authorization: Bearer <token>)

Example:

```bash
# register
curl -X POST http://localhost:3000/auth/register -H "Content-Type: application/json" -d '{"username":"alice","password":"secret"}'

# login
curl -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d '{"username":"alice","password":"secret"}'

# use token to create an item
curl -X POST http://localhost:3000/items -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{"name":"First","description":"My item"}'
```

Notes:
- This is an in-memory demo. For persistence, replace the in-memory arrays with a database (sqlite/postgres).
- Set `JWT_SECRET` env var in production.
