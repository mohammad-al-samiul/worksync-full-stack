# WorkSync – Project & Task Management Dashboard

## Overview
WorkSync is a **premium, data‑dense yet ultra‑clean** full‑stack application built with **Next.js (custom version)**, **React**, **TypeScript**, **Tailwind‑style vanilla CSS**, **Framer Motion** and **Recharts**. It provides a modern dashboard for managing projects and tasks with:

- KPI cards, analytical charts (doughnut, area, bar) in a neon‑dark / clean‑light aesthetic.
- Advanced filtering, sorting, pagination (infinite scroll) for large data sets.
- A glass‑morphic **Task Detail Modal** with comments, file attachment preview, and quick status updates.
- In‑app **notification center** (bell icon) for task assignments and completions.
- Strict backend validation (duplicate titles, reassignment rules) with clear error messages.

The UI follows a curated color palette, subtle gradients, glass‑morphism, and micro‑animations to provide a premium feel.

## Tech Stack
- **Framework**: Next.js (custom version – see `node_modules/next/dist/docs/` for API differences)
- **Language**: TypeScript, React
- **Styling**: Vanilla CSS with design tokens in `src/app/layout.tsx`
- **Animations**: Framer Motion
- **Charts**: Recharts
- **State Management**: React Hook Form + local component state
- **Backend**: API routes under `src/app/api/` using Next.js Edge runtime
- **Database**: (placeholder – mock in‑memory for this assignment)

## Getting Started
1. **Install dependencies**
   ```bash
   cd c:/Users/alsam/Documents/web-dev/elite-pool-assignment/WorkSync
   npm install
   ```
2. **Run the development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.
3. **Build for production** (optional)
   ```bash
   npm run build && npm start
   ```

## Project Structure (key parts)
```
src/
├─ app/
│  ├─ api/            # Backend endpoints (tasks, projects, notifications)
│  ├─ tasks/
│  │   └─ page.tsx   # Main Tasks dashboard – pagination, filters, modal
│  └─ layout.tsx      # Global layout with dark‑light theme and navbar
├─ components/
│  ├─ TaskDetailModal.tsx   # Glassmorphic drawer/modal for task details
│  ├─ KPIcard.tsx           # Reusable KPI card component
│  └─ NotificationCenter.tsx# Bell icon + dropdown list
└─ lib/
   └─ utils.ts               # Helper functions (classNames, date utils)
```

## Features Implemented
- **Task Grid** with infinite scroll (`Load More` button) and advanced filters.
- **Task Detail Modal** showing description, assignee, deadline, comments, and drag‑and‑drop file preview.
- **Pagination** via `GET /api/tasks?page=&limit=`.
- **Inline status dropdown** for quick updates.
- **Responsive design** with glassmorphism and neon accents.
- **ESLint/TS lint fixes** and type‑safe code.

## Design System
- **Palette**: Dark background `#0a0a0a`, accent cyan `#00f2fe`, rose for overdue, emerald for completed.
- **Typography**: Google Font **Inter** imported in `layout.tsx`.
- **Glassmorphism**: `bg-card/45 glassmorphism` utility class adds backdrop blur and subtle transparency.
- **Micro‑animations**: Framer Motion fades and scales elements on mount/unmount.

## Extending the App
- Add server‑side storage (e.g., Prisma + PostgreSQL).
- Implement real‑time notifications with WebSockets or Supabase.
- Replace placeholder image upload with S3/Cloudinary integration.
- Expand charts on the Dashboard (`src/app/dashboard/page.tsx`).

## Contributing
1. Fork the repository.
2. Create a feature branch.
3. Ensure lint passes: `npm run lint`.
4. Submit a pull request.

## License
MIT © 2026 Mohammad Al Samiul
