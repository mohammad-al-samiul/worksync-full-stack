# WorkSync

**A simple team app for projects and tasks** — dashboard UI, secure APIs, and PostgreSQL database (Prisma 7).

---

## Documentation (pick your language)

| Language | File | Who is it for? |
|----------|------|----------------|
| **English** | **[GUIDE.md](./GUIDE.md)** | Full technical guide — setup, features, database, API, diagrams |
| **বাংলা (Bangla)** | **[GUIDE.bn.md](./GUIDE.bn.md)** | Same guide in Bangla — read this if English is hard for you |

> **Tip:** Start with this README for a quick setup. Open **GUIDE.md** or **GUIDE.bn.md** when you need details.

**English guide — quick links:**

- [Product overview](./GUIDE.md#1-product-overview)
- [What the app must do (requirements)](./GUIDE.md#2-functional-requirements)
- [Features list](./GUIDE.md#4-features-implemented)
- [System design](./GUIDE.md#5-system-design)
- [Database & ER diagram](./GUIDE.md#8-entity-relationship-diagram)
- [API reference](./GUIDE.md#10-api-reference)
- [Database setup (Prisma)](./GUIDE.md#13-prisma--postgresql-setup)

**বাংলা গাইড:**

- **[GUIDE.bn.md — সম্পূর্ণ বাংলা গাইড](./GUIDE.bn.md)** (উপরের সূচিপত্র থেকে সেকশন বেছে নিন)

---

## What is WorkSync?

WorkSync helps a team work on **projects**, **tasks**, **comments**, and **activity logs** in one web app:

- Dashboard with charts and KPI cards
- Task list with search, filters, and “load more”
- Task detail window (comments, file attachments, status)
- Login with JWT and three roles: **Admin**, **Project Manager**, **Team Member**
- Dark and light theme

---

## Tech stack

| Part | Tools |
|------|--------|
| App | Next.js 16 (App Router) |
| UI | React 19, TypeScript, Tailwind CSS v4 |
| Charts / motion | Recharts, Framer Motion |
| Forms | React Hook Form, Zod |
| API | Next.js route handlers (`src/app/api/`) |
| Database | PostgreSQL + Prisma 7 |
| Login | bcrypt + JSON Web Tokens (JWT) |

---

## Quick start

### 1. Get the code and install packages

```bash
git clone <your-repo-url>
cd worksync-full-stack
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/worksync?schema=public"
JWT_SECRET="your-long-random-secret"
```

### 3. Prepare the database

Make sure PostgreSQL is running, then:

```bash
npm run db:migrate   # apply migrations
npm run db:seed      # add demo users, projects, tasks
# npm run db:seed:reset   # delete all data, then seed again
```

Or without migration files:

```bash
npm run db:push
npm run db:seed
```

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo accounts (after `db:seed`)

| Email | Password |
|-------|----------|
| `admin@worksync.io` | `admin123` |
| `manager@worksync.io` | `manager123` |
| `member@worksync.io` | `member123` |

Use these on the login page or with `POST /api/auth/login`.

---

## Production deployment (fix “Demo login failed”)

That message means **login API failed** — usually the **production database has no users** and was never migrated or seeded.

### Step 1 — Environment variables on your host (Vercel, Railway, etc.)

| Variable | Required |
|----------|----------|
| `DATABASE_URL` | Yes — PostgreSQL URL (Neon, Supabase, Railway, etc.). Often needs `?sslmode=require` at the end. |
| `JWT_SECRET` | Yes — long random string (not the example from `.env.example`) |

### Step 2 — Apply database schema on deploy

The `build` script runs `prisma migrate deploy` so tables are created when you deploy.

If deploy fails on migrate, run once from your machine:

```bash
DATABASE_URL="your-production-url" npm run db:migrate:deploy
```

### Supabase: `db push` stuck on port 6543?

Prisma **cannot** run `db push` on Supabase **transaction pooler** (`:6543`). It will hang forever.

Use **two URLs** in `.env` (see [.env.example](.env.example)):

| Variable | Port | Used for |
|----------|------|----------|
| `DATABASE_URL` | **6543** (pooler) | App + `db:seed` |
| `DIRECT_URL` | **5432** (direct) | `db:push`, `db:migrate`, Prisma Studio |

Then run:

```bash
npm run db:push    # uses DIRECT_URL automatically
npm run db:seed
# or one command:
npm run db:setup
```

### Step 3 — Add demo users (pick one)

**Option A — Seed demo data (recommended for demos)**

From your computer, point at the **production** database:

```bash
DATABASE_URL="your-production-postgresql-url" npm run db:seed
```

Then demo buttons work: `admin@worksync.io` / `admin123`, etc.

**Option B — No seed**

On the live site, open **Create Account**, register a real user, then sign in. Demo buttons will not work until you seed.

### Step 4 — Redeploy and test

Open `/auth`, use **Create Account** or demo login after seed.

**Bangla guide:** [GUIDE.bn.md §13](./GUIDE.bn.md#13-প্রিজমা-ও-পোস্টগ্রেসকিউএল-সেটআপ)

---

## NPM scripts

| Script | What it does |
|--------|----------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Run production server |
| `npm run lint` | Check code style |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run database migrations (local dev) |
| `npm run db:migrate:deploy` | Apply migrations to production DB |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Add demo data |
| `npm run db:seed:reset` | Clear tables, then seed |
| `npm run db:studio` | Open Prisma Studio (DB GUI) |

---

## Project folders (short)

```
src/app/          → pages and API routes
src/components/   → Sidebar, Header, TaskDetailModal, AppLayout
src/context/      → Auth and theme
src/lib/          → database, auth, API helpers
prisma/           → schema, migrations, seed data
public/uploads/   → task attachment files (local storage)
```

Full tree: [GUIDE.md §14](./GUIDE.md#14-project-structure) · [GUIDE.bn.md](./GUIDE.bn.md) (section 14)

---

## API (short list)

Protected routes need this header:

```http
Authorization: Bearer <token from login>
```

| Endpoint | Methods |
|----------|---------|
| `/api/auth/register` | POST |
| `/api/auth/login` | POST |
| `/api/projects` | GET, POST |
| `/api/projects/[id]` | GET, PUT, DELETE |
| `/api/tasks` | GET, POST |
| `/api/tasks/[id]` | GET, PATCH |
| `/api/tasks/[id]/comments` | GET, POST |
| `/api/tasks/[id]/attachments` | POST |
| `/api/activity` | GET |
| `/api/notifications` | GET |

More detail: [GUIDE.md §10](./GUIDE.md#10-api-reference) · [GUIDE.bn.md](./GUIDE.bn.md) (section 10)

---

## Contributing

1. Fork the repo  
2. Create a branch for your change  
3. Run `npm run lint`  
4. Open a pull request  

Read the full guide: **[GUIDE.md](./GUIDE.md)** (English) or **[GUIDE.bn.md](./GUIDE.bn.md)** (Bangla).

---

## License

MIT © 2026 Mohammad Al Samiul
