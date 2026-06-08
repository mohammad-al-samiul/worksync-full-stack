# WorkSync

Team project & task management app built with **Next.js 16**, **PostgreSQL**, and **Prisma 7**.

| | Link |
|---|---|
| **Live App** | [https://worksync-full-stack.vercel.app](https://worksync-full-stack.vercel.app) |
| **GitHub** | [https://github.com/mohammad-al-samiul/worksync-full-stack](https://github.com/mohammad-al-samiul/worksync-full-stack) |
| **Full Guide** | [GUIDE.md](./GUIDE.md) · [GUIDE.bn.md](./GUIDE.bn.md) (Bangla) |

---

## Features Overview

### Authentication & Roles
- Email + password signup and login (JWT, 7-day session)
- Demo login buttons for Admin, Manager, and Member
- Role-based access: **Admin** (full access), **Project Manager** (create/manage projects & tasks), **Team Member** (update assigned tasks only)

### Project Management
- Create, edit, delete projects with name, description, deadline, and status (Active / Completed / On Hold)
- Add team members by email
- Search, filter by status, sort, and paginate

### Task Management
- Create, edit, delete tasks under projects
- Fields: title, description, assignee, due date, priority (High / Medium / Low), status (Todo / In Progress / Completed)
- Quick status updates from the task board
- Validation: no duplicate titles per project, no past deadlines, no reassigning completed tasks

### Team & Collaboration
- Team roster with workload counts
- Invite new users with a role
- Assign tasks to members
- Comments and file attachments on tasks

### Dashboard & Analytics
- KPI cards: total projects, tasks, completed, pending, overdue
- Charts: task status, priority breakdown, weekly trend, team workload
- Project overview cards, upcoming deadlines, high-priority tasks
- Activity log (last 8 actions on dashboard, full log on Activity page)

### Other
- Dark / light theme toggle
- Notification bell (recent activity feed)
- Responsive layout

---

## Tech Stack

| Layer | Tools |
|-------|--------|
| Frontend | React 19, TypeScript, Tailwind CSS v4, Recharts, Framer Motion |
| Backend | Next.js App Router API routes |
| Database | PostgreSQL + Prisma 7 |
| Auth | bcrypt + JWT |

---

## Project Setup (Local)

### Prerequisites
- Node.js 20+
- PostgreSQL (local, or free tier from [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app))

### 1. Clone and install

```bash
git clone https://github.com/mohammad-al-samiul/worksync-full-stack.git
cd worksync-full-stack
npm install
```

### 2. Environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Local PostgreSQL
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/worksync?schema=public"

# JWT secret (use a long random string)
JWT_SECRET="your-secret-at-least-32-characters-long"
```

**Supabase users** — use two URLs:

| Variable | Port | Purpose |
|----------|------|---------|
| `DATABASE_URL` | 6543 (pooler) | App runtime + seeding |
| `DIRECT_URL` | 5432 (direct) | Migrations & `db push` |

### 3. Database setup

```bash
npm run db:migrate    # apply migrations
npm run db:seed       # demo users, projects, tasks
```

Or in one step:

```bash
npm run db:setup
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Demo Credentials

Use the **Demo Login** buttons on `/auth`, or sign in manually:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@worksync.io` | `admin123` |
| Project Manager | `manager@worksync.io` | `manager123` |
| Team Member | `member@worksync.io` | `member123` |

Additional seeded users: `kyle@worksync.io`, `john@worksync.io`, `emma@worksync.io`, `priya@worksync.io`, `demo@worksync.io` — password is the email prefix + `123` (e.g. `kyle123`).

> Demo accounts only work after `npm run db:seed` has been run against the target database.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string for the app |
| `DIRECT_URL` | Supabase only | Direct connection for Prisma migrations (port 5432) |
| `JWT_SECRET` | Yes | Secret used to sign JWT tokens — must be unique in production |
| `NODE_ENV` | No | `development` or `production` |

---

## Deployment (Vercel + PostgreSQL)

### Step 1 — Push to GitHub

```bash
git push origin main
```

Repo: [github.com/mohammad-al-samiul/worksync-full-stack](https://github.com/mohammad-al-samiul/worksync-full-stack)

### Step 2 — Create a PostgreSQL database

Use [Supabase](https://supabase.com), [Neon](https://neon.tech), or [Railway](https://railway.app). Copy the connection string.

For Supabase, set both `DATABASE_URL` (pooler, port 6543) and `DIRECT_URL` (direct, port 5432).

### Step 3 — Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import `mohammad-al-samiul/worksync-full-stack`
3. Add environment variables:
   - `DATABASE_URL`
   - `DIRECT_URL` (if using Supabase)
   - `JWT_SECRET` (generate a random 32+ char string)
4. Click **Deploy**

The build runs `prisma generate`, `prisma migrate deploy`, and `next build` automatically.

### Step 4 — Seed production database

From your machine (one time):

```bash
DATABASE_URL="your-production-database-url" npm run db:seed
```

This creates demo users so the **Demo Login** buttons work on the live site.

### Step 5 — Verify

1. Open your Vercel URL (e.g. `https://worksync-full-stack.vercel.app`)
2. Go to `/auth`
3. Click **Admin Demo** or sign in with `admin@worksync.io` / `admin123`

### CLI deploy (alternative)

```bash
npm i -g vercel
vercel login
vercel --prod
```

Set the same environment variables when prompted or in the Vercel dashboard under **Settings → Environment Variables**.

### Troubleshooting

| Problem | Fix |
|---------|-----|
| Demo login fails | Run `db:seed` against production `DATABASE_URL` |
| Build fails on migrate | Run `npm run db:migrate:deploy` locally once, or baseline with `prisma migrate resolve` |
| Supabase `db push` hangs | Use `DIRECT_URL` on port 5432, not the pooler on 6543 |
| Attachments missing after redeploy | Vercel serverless has no persistent disk — use cloud storage for production file uploads |

---

## NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build (includes migrate deploy) |
| `npm run start` | Run production server |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Run migrations (local dev) |
| `npm run db:migrate:deploy` | Apply migrations to production |
| `npm run db:push` | Push schema without migration files |
| `npm run db:seed` | Insert demo data |
| `npm run db:setup` | `db:push` + `db:seed` |
| `npm run db:studio` | Prisma Studio GUI |

---

## Project Structure

```
src/app/          Pages and API routes
src/components/   UI components (Sidebar, Header, TaskDetailModal)
src/context/      Auth and theme providers
src/lib/          Database, auth, API helpers
prisma/           Schema, migrations, seed data
public/uploads/   Task attachments (local dev only)
```

---

## API Endpoints

All protected routes require:

```http
Authorization: Bearer <token>
```

| Endpoint | Methods |
|----------|---------|
| `/api/auth/register` | POST |
| `/api/auth/login` | POST |
| `/api/projects` | GET, POST |
| `/api/projects/[id]` | GET, PUT, DELETE |
| `/api/tasks` | GET, POST |
| `/api/tasks/[id]` | GET, PATCH, DELETE |
| `/api/tasks/[id]/comments` | GET, POST |
| `/api/tasks/[id]/attachments` | POST |
| `/api/activity` | GET |
| `/api/notifications` | GET |
| `/api/users` | GET |

Full reference: [GUIDE.md §10](./GUIDE.md#10-api-reference)

---

## License

MIT © 2026 Mohammad Al Samiul
