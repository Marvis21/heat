# Heat — Cattle Management Backend

Production-ready REST API backend for the **Heat** cattle management frontend (herd tracking, oestrus
checker, symptom checker, and farm records: milk, breeding, health, feed, financial).

Built with **Node.js + Express**, **PostgreSQL + Prisma**, **JWT auth**, **Redis** (optional cache),
and **Docker**.

---

## 1. Frontend → Backend Feature Mapping

| Frontend feature | Backend implementation |
|---|---|
| Dashboard stats, milk trend chart, revenue/expense cards, alerts | `GET /dashboard/summary` — single aggregated endpoint |
| My Herd list + animal profile modal | `GET /animals`, `GET /animals/:id` (includes recent milk/breeding/health/oestrus history) |
| Add Animal form | `POST /animals` |
| Oestrus Checker (sign checklist → recommendation → log) | `POST /records/oestrus` — server computes the same ≥4/≥1/0 sign threshold the frontend used client-side, so the rule lives in one place |
| Symptom Checker (symptom checklist → disease match %) | `GET /diseases/symptoms` (checklist data), `GET /diseases/match?symptoms=a,b,c` (ranked disease matches — same confidence-% algorithm the frontend had inline, now server-side and editable without a redeploy) |
| Farm Records → Milk tab | `GET/POST /records/milk`, `DELETE /records/milk/:id` |
| Farm Records → Breeding tab | `GET/POST /records/breeding`, `DELETE /records/breeding/:id` |
| Farm Records → Health tab | `GET/POST /records/health`, `DELETE /records/health/:id` |
| Farm Records → Feed tab | `GET/POST /records/feed`, `DELETE /records/feed/:id` |
| Farm Records → Financial tab (+ income/expense/profit summary) | `GET/POST /records/financial`, `DELETE /records/financial/:id` — list response includes a `summary` block |
| Farm Records → Inventory tab | Derived from `GET /animals` (no separate table needed) |
| "Shamba Summary" CSV export button | `GET /export/csv` — server-generated CSV, same structure as the original client-side export |
| Animal profile photo (shown in the profile modal) | `POST /animals/:id/photo` (multipart upload, added since the modal displays a header image the original static markup hardcoded) |

**No frontend changes are required** for the API to function — every data-producing/consuming
interaction above maps to an endpoint with the same shape of data the frontend already builds
client-side. The one addition is **authentication**: the original frontend had no login screen, so a
minimal login/register flow needs to be added to the UI (or the app can be run behind a single shared
demo account — see the seed data) before it starts calling these endpoints instead of its in-memory
arrays.

---

## 2. Project Structure

```
backend/
├── src/
│   ├── controllers/      # Request handlers (thin — delegate to services)
│   ├── services/         # Business logic, Prisma queries
│   ├── routes/           # Express routers + Swagger/OpenAPI JSDoc
│   ├── middleware/        # auth, validation, error handling, rate limiting, uploads
│   ├── validators/       # Zod schemas per resource
│   ├── utils/             # logger, JWT, password hashing, ApiError, catchAsync
│   ├── config/             # env, prisma client, redis client, swagger config
│   ├── app.js              # Express app assembly
│   └── server.js         # HTTP server bootstrap + graceful shutdown
├── prisma/
│   ├── schema.prisma     # Full data model
│   └── seed.js            # Reference data (diseases/symptoms) + demo farmer account
├── tests/
│   ├── unit/               # Pure logic tests (no DB required)
│   └── integration/        # Supertest API tests (auth flow needs a live test DB)
├── package.json
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md (this file)
```

---

## 3. Data Model

- **User** — farmer account (email, password hash, name, farm name, role, email verification, reset tokens)
- **RefreshToken** — rotated, revocable refresh tokens (one row per issued token)
- **Animal** — belongs to a User; tag number is unique per user
- **MilkRecord**, **BreedingRecord**, **OestrusCheck**, **HealthRecord** — all belong to an Animal (and transitively to its owning User)
- **FeedRecord**, **FinancialRecord** — belong directly to a User (farm-wide, not animal-specific)
- **Symptom**, **Disease**, **DiseaseSymptom** — global reference data powering the symptom checker (seeded, editable via direct DB access or a future admin endpoint)

All animal-scoped queries verify `animal.userId === req.user.id` before reading/writing, so one
farmer can never see or modify another farmer's data.

---

## 4. Authentication

- **Register / Login** issue an **access token** (short-lived JWT, 15 min default, returned in the
  response body — the frontend keeps it in memory) and a **refresh token** (7 days default, set as an
  `httpOnly`, `Secure` (in production), `SameSite=strict` cookie scoped to `/api/v1/auth`).
- **Refresh tokens are rotated**: each `/auth/refresh` call revokes the old token and issues a new one,
  and revoked/expired tokens are rejected — limits the damage from a leaked refresh token.
- **Password reset** issues a random token stored on the user row with a 1-hour expiry (email sending
  is stubbed — wire up `nodemailer` with real SMTP credentials in `.env` to send it for real).
- **Email verification** works the same way (stubbed send, token-based confirm endpoint).
- Protected routes use the `authenticate` middleware; role-based routes can add `authorize('ADMIN')`.

---

## 5. API Reference

Full interactive docs (Swagger UI) are served at **`/api-docs`** once the server is running.
Below is the endpoint summary — all under the `/api/v1` prefix.

### Auth (`/auth`)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | – | Create account, returns access token + sets refresh cookie |
| POST | `/auth/login` | – | Log in |
| POST | `/auth/refresh` | – (refresh cookie) | Rotate tokens |
| POST | `/auth/logout` | – | Revoke refresh token |
| GET | `/auth/me` | Bearer | Current user |
| POST | `/auth/forgot-password` | – | Request reset token |
| POST | `/auth/reset-password` | – | Reset password with token |
| POST | `/auth/verify-email` | – | Confirm email with token |

### Animals (`/animals`) — all require Bearer auth
| Method | Path | Description |
|---|---|---|
| GET | `/animals?page=&limit=&search=&type=&purpose=&sortBy=&sortOrder=` | Paginated, filterable, searchable list |
| POST | `/animals` | Create |
| GET | `/animals/:id` | Profile + recent record history |
| PATCH | `/animals/:id` | Update |
| DELETE | `/animals/:id` | Delete |
| POST | `/animals/:id/photo` | Upload profile photo (multipart, field name `photo`) |

### Records (`/records`) — all require Bearer auth
| Method | Path |
|---|---|
| GET/POST | `/records/milk` (+ `DELETE /records/milk/:id`) |
| GET/POST | `/records/breeding` (+ `DELETE .../:id`) |
| GET/POST | `/records/oestrus` |
| GET/POST | `/records/health` (+ `DELETE .../:id`) |
| GET/POST | `/records/feed` (+ `DELETE .../:id`) |
| GET/POST | `/records/financial` (+ `DELETE .../:id`) |

All list endpoints support `page` / `limit` pagination; date-bearing ones support `from` / `to`
filtering and `animalId` filtering where relevant.

### Dashboard (`/dashboard`)
| Method | Path | Description |
|---|---|---|
| GET | `/dashboard/summary` | Herd totals, milk trend (last 7 entries), revenue/expense/profit, active alerts |

### Symptom Checker (`/diseases`)
| Method | Path | Description |
|---|---|---|
| GET | `/diseases/symptoms` | List of known symptoms (checklist data) |
| GET | `/diseases/match?symptoms=High Fever,Coughing` | Ranked disease matches with confidence % |

### Export (`/export`)
| Method | Path | Description |
|---|---|---|
| GET | `/export/csv` | Full farm data as a downloadable CSV |

### Response shape
Every endpoint returns:
```json
{ "success": true, "data": ..., "meta": { "page": 1, "limit": 20, "total": 42, "totalPages": 3 } }
```
Errors:
```json
{ "success": false, "error": { "message": "...", "details": [...] } }
```

---

## 6. Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ (or use Docker Compose, see below)
- (Optional) Redis, if you want caching enabled

### Steps
```bash
cd backend
cp .env.example .env          # then edit DATABASE_URL, JWT secrets, etc.
npm install

npx prisma migrate dev --name init   # creates tables from schema.prisma
npm run seed                          # loads disease/symptom reference data + demo user

npm run dev                            # starts on http://localhost:4000
```

Demo login (created by the seed script): `demo@heatapp.com` / `Password123!`

Visit `http://localhost:4000/api-docs` for interactive Swagger docs.

---

## 7. Docker

```bash
cd backend
cp .env.example .env
docker compose up --build
```

This starts three containers: `api` (port 4000), `postgres` (port 5432), `redis` (port 6379). The API
container automatically runs `prisma migrate deploy` and the seed script on startup.

To run in detached mode: `docker compose up -d --build`.
To view logs: `docker compose logs -f api`.
To tear down (including volumes): `docker compose down -v`.

---

## 8. Testing

```bash
npm test
```

- **Unit tests** (`tests/unit/`) cover pure logic — password hashing, JWT signing/verification,
  the `ApiError` helper, and the oestrus-sign scoring rule — and need no database.
- **Integration tests** (`tests/integration/`):
  - `health-and-validation.test.js` exercises the health check, 404 handling, and request validation
    (rejecting bad input before it ever reaches the database) — no DB required.
  - `auth.test.js` exercises the full register → login → me → refresh flow against a **real** database.
    Point `DATABASE_URL` at a disposable test database and run migrations first; the suite
    auto-skips this file if no database is reachable, so `npm test` is always safe to run.

---

## 9. Security Measures Implemented

- `helmet` for standard security headers
- CORS restricted to configured origins, with credentials support for the refresh cookie
- `express-rate-limit`: general API limiter + a stricter limiter on auth endpoints (brute-force protection)
- `hpp` (HTTP parameter pollution protection) and `xss-clean` (input sanitization)
- All request bodies/queries/params validated with Zod before reaching business logic
- Passwords hashed with bcrypt (12 salt rounds)
- JWT access tokens are short-lived; refresh tokens are rotated and revocable, stored server-side so
  they can be invalidated (e.g. on password reset, all of a user's refresh tokens are revoked)
- Refresh token delivered as an `httpOnly` cookie (not accessible to frontend JS), scoped to the auth
  path only
- Prisma's parameterized queries prevent SQL injection by construction
- Per-user data isolation enforced in every service function, not just at the route layer
- File uploads restricted to image MIME types and a configurable max size

---

## 10. Deployment Notes

- Set `NODE_ENV=production` — this enables `Secure` cookies and suppresses stack traces in error responses.
- Generate strong, unique values for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` (e.g. `openssl rand -hex 64`).
- Run `npx prisma migrate deploy` (not `migrate dev`) in production/CI pipelines.
- The Dockerfile uses a multi-stage build and runs as a non-root user; a `HEALTHCHECK` hits
  `GET /api/v1/health`.
- For real uploaded-file persistence at scale, swap the local disk storage in
  `src/middleware/upload.js` for an S3-compatible client — the interface (single `photo` field,
  returns a URL) stays the same.
- Wire up real SMTP credentials in `.env` and call the mailer inside `authService.register` /
  `forgotPassword` to actually deliver verification/reset emails (currently stubbed so the tokens are
  generated but not sent).

---

## 11. What Was NOT Changed in the Frontend

Per the brief, the existing frontend HTML/JS was left untouched. To actually wire it up to this
backend, the minimal changes needed later would be:

1. Add a login/register screen (currently the app loads straight into the dashboard).
2. Replace the in-memory `herd`, `milkRecords`, `breedingRecords`, `healthRecords`, `feedRecords`,
   `financialRecords` arrays with `fetch()` calls to the endpoints above, storing the access token in
   memory and letting the browser handle the refresh cookie automatically.
3. Replace the client-side `analyzeSymptoms()` matching logic with a call to
   `GET /diseases/match?symptoms=...` (optional — the client-side version still works standalone; the
   server version exists so the disease/symptom rule set can be updated without shipping new frontend
   code).

These are frontend-side follow-ups, not backend work, and are called out here rather than made
unilaterally, per "don't modify the frontend unless necessary."
