# WorkSync

**Smart Project & Task Collaboration System** — premium dashboard UI, role-based APIs, and PostgreSQL persistence via Prisma 7.

---

## Documentation

| Document | Description |
|----------|-------------|
| **[GUIDE.md](./GUIDE.md)** | **Full technical documentation** — system design, functional & non-functional requirements, ER diagram, database design, HLD/LLD (with Mermaid diagrams), features, API reference, Prisma setup |

> GitHub/GitLab এ `GUIDE.md` লিংকে ক্লিক করলে টেবিল অফ কনটেন্টসহ সব সেকশন দেখতে পারবেন।

**Guide sections (direct links):**

- [Product Overview](./GUIDE.md#1-product-overview)
- [Functional Requirements](./GUIDE.md#2-functional-requirements)
- [Non-Functional Requirements](./GUIDE.md#3-non-functional-requirements)
- [Features](./GUIDE.md#4-features-implemented)
- [System Design](./GUIDE.md#5-system-design)
- [High-Level Design (HLD)](./GUIDE.md#6-high-level-design-hld)
- [Low-Level Design (LLD)](./GUIDE.md#7-low-level-design-lld)
- [Entity Relationship Diagram](./GUIDE.md#8-entity-relationship-diagram)
- [Database Design](./GUIDE.md#9-database-design)
- [API Reference](./GUIDE.md#10-api-reference)
- [Prisma & PostgreSQL Setup](./GUIDE.md#13-prisma--postgresql-setup)

---

## Overview

WorkSync helps teams manage **projects**, **tasks**, **comments**, and **activity logs** through a glassmorphic Next.js console with:

- KPI cards and Recharts analytics (dashboard & analytics pages)
- Task grid with filters, sorting, pagination / load-more
- Task detail modal (comments, attachments, status updates)
- JWT-secured REST API with **Admin / Project Manager / Team Member** RBAC
- Dark & light themes with Framer Motion micro-interactions

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, TypeScript, Tailwind CSS v4 |
| Animation / Charts | Framer Motion, Recharts |
| Forms | React Hook Form, Zod |
| API | Next.js Route Handlers (`src/app/api/`) |
| Database | PostgreSQL + **Prisma 7** (`@prisma/adapter-pg`, `pg`) |
| Auth | bcryptjs + JSON Web Tokens |

---

## Quick Start

### 1. Clone and install

```bash
git clone <your-repo-url>
cd worksync-full-stack
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/worksync?schema=public"
JWT_SECRET="your-long-random-secret"
```

### 3. Database setup

Ensure PostgreSQL is running, then:

```bash
npm run db:migrate   # apply migrations
npm run db:seed      # full demo dataset (users, projects, tasks, comments, logs)
# npm run db:seed:reset   # wipe DB then seed
```

Alternative without migration history:

```bash
npm run db:push
npm run db:seed
```

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo logins (after `db:seed`)

| Email | Password |
|-------|----------|
| `admin@worksync.io` | `admin123` |
| `manager@worksync.io` | `manager123` |
| `member@worksync.io` | `member123` |

Use these with `POST /api/auth/login` or wire the auth UI (see [Guide — Roadmap](./GUIDE.md#15-roadmap--gaps)).

---

## NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Development server |
| `npm run build` | `prisma generate` + production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:migrate` | Run migrations (dev) |
| `npm run db:push` | Push schema to DB |
| `npm run db:seed` | Seed full demo dataset |
| `npm run db:seed:reset` | Clear tables + seed |
| `npm run db:studio` | Prisma Studio GUI |

---

## Project Structure (summary)

```
src/app/          → pages + API routes
src/components/   → Sidebar, Header, TaskDetailModal, AppLayout
src/context/      → Auth, Theme
src/lib/          → prisma, auth, middleware
prisma/           → schema, migrations, seed
```

Full tree: [GUIDE.md §14](./GUIDE.md#14-project-structure)

---

## API (summary)

Protected routes require:

```http
Authorization: Bearer <jwt_from_login>
```

| Endpoint | Methods |
|----------|---------|
| `/api/auth/register` | POST |
| `/api/auth/login` | POST |
| `/api/projects` | GET, POST |
| `/api/projects/[id]` | GET, PUT, DELETE |
| `/api/tasks` | GET, POST |
| `/api/tasks/[id]` | PATCH |
| `/api/tasks/[id]/comments` | GET, POST |
| `/api/tasks/[id]/attachments` | POST |
| `/api/activity` | GET |
| `/api/notifications` | GET |

Details: [GUIDE.md §10](./GUIDE.md#10-api-reference)

---

## Contributing

1. Fork the repository  
2. Create a feature branch  
3. Run `npm run lint`  
4. Open a pull request  

Architecture and requirements: **[GUIDE.md](./GUIDE.md)**

---

## License

MIT © 2026 Mohammad Al Samiul
