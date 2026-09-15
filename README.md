# 5S Media Backend

Node.js + TypeScript + Express + Prisma (SQLite) API powering the 5S Media CMS:
admin auth (JWT), site content (bilingual EN/AR JSON), and image uploads.

## Setup

```bash
npm install
cp .env.example .env    # edit ADMIN_EMAIL / ADMIN_PASSWORD / JWT_SECRET
npm run prisma:migrate  # creates dev.db and applies schema
npm run seed             # creates the admin user + seeds default site content
npm run dev               # starts the API on http://localhost:5000
```

## API

- `POST /api/auth/login` `{ email, password }` -> `{ token, admin }`
- `GET /api/auth/me` (Bearer token) -> `{ admin }`
- `GET /api/content` -> full site content JSON (public)
- `PUT /api/content` (Bearer token) -> deep-merges the request body into stored
  content and returns the updated document. Send just the section you changed,
  e.g. `{ "hero": { "desc": { "en": "...", "ar": "..." } } }`.
- `POST /api/upload` (Bearer token, `multipart/form-data`, field `image`) ->
  `{ url }`, then reference that URL in a subsequent `PUT /api/content` call.

## Production

```bash
npm run build
npm start
```

Set `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL` (comma-separated allowed origins
for CORS) and `PUBLIC_URL` (the backend's own public base URL, used to build
absolute upload URLs) in the production `.env`. Run `npm run prisma:deploy` to
apply migrations before starting.
