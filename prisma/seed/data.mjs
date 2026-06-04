/**
 * WorkSync — canonical seed data (fixed UUIDs for idempotent re-runs).
 * IDs: users 001–008, projects 011–014, tasks 101–120, comments 201–215, attachments 301–308, logs 401–420
 */

const day = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(17, 0, 0, 0);
  return d;
};

export const SEED_USERS = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    name: "Alex Rivers",
    email: "admin@worksync.io",
    password: "admin123",
    role: "ADMIN",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    name: "Sarah Connor",
    email: "manager@worksync.io",
    password: "manager123",
    role: "PROJECT_MANAGER",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    name: "Marcus Wright",
    email: "member@worksync.io",
    password: "member123",
    role: "TEAM_MEMBER",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
  },
  {
    id: "00000000-0000-4000-8000-000000000004",
    name: "Kyle Brooks",
    email: "kyle@worksync.io",
    password: "kyle123",
    role: "TEAM_MEMBER",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
  },
  {
    id: "00000000-0000-4000-8000-000000000005",
    name: "John Carter",
    email: "john@worksync.io",
    password: "john123",
    role: "TEAM_MEMBER",
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
  },
  {
    id: "00000000-0000-4000-8000-000000000006",
    name: "Emma Wilson",
    email: "emma@worksync.io",
    password: "emma123",
    role: "PROJECT_MANAGER",
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
  },
  {
    id: "00000000-0000-4000-8000-000000000007",
    name: "Priya Shah",
    email: "priya@worksync.io",
    password: "priya123",
    role: "TEAM_MEMBER",
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
  },
  {
    id: "00000000-0000-4000-8000-000000000008",
    name: "Demo Viewer",
    email: "demo@worksync.io",
    password: "demo123",
    role: "TEAM_MEMBER",
    avatar:
      "https://api.dicebear.com/7.x/bottts/svg?seed=Demo",
  },
];

/** @type {Array<{ id: string; name: string; description: string; status: string; deadline: Date | null; createdById: string; memberIds: string[] }>} */
export const SEED_PROJECTS = [
  {
    id: "00000000-0000-4000-8000-000000000011",
    name: "WorkSync Platform",
    description: "Core product delivery pipeline — dashboard, tasks API, and Prisma integration.",
    status: "ACTIVE",
    deadline: day(45),
    createdById: "00000000-0000-4000-8000-000000000002",
    memberIds: [
      "00000000-0000-4000-8000-000000000001",
      "00000000-0000-4000-8000-000000000002",
      "00000000-0000-4000-8000-000000000003",
      "00000000-0000-4000-8000-000000000004",
      "00000000-0000-4000-8000-000000000005",
    ],
  },
  {
    id: "00000000-0000-4000-8000-000000000012",
    name: "Cyber UI Redesign",
    description: "Neon-dark glassmorphic design system and component library refresh.",
    status: "ACTIVE",
    deadline: day(21),
    createdById: "00000000-0000-4000-8000-000000000006",
    memberIds: [
      "00000000-0000-4000-8000-000000000001",
      "00000000-0000-4000-8000-000000000006",
      "00000000-0000-4000-8000-000000000003",
      "00000000-0000-4000-8000-000000000007",
    ],
  },
  {
    id: "00000000-0000-4000-8000-000000000013",
    name: "Mobile App v2",
    description: "React Native companion app — paused pending API stabilization.",
    status: "ON_HOLD",
    deadline: day(90),
    createdById: "00000000-0000-4000-8000-000000000002",
    memberIds: [
      "00000000-0000-4000-8000-000000000002",
      "00000000-0000-4000-8000-000000000004",
      "00000000-0000-4000-8000-000000000008",
    ],
  },
  {
    id: "00000000-0000-4000-8000-000000000014",
    name: "Q1 Infrastructure",
    description: "PostgreSQL migrations, CI/CD, and staging environment hardening.",
    status: "COMPLETED",
    deadline: day(-14),
    createdById: "00000000-0000-4000-8000-000000000001",
    memberIds: [
      "00000000-0000-4000-8000-000000000001",
      "00000000-0000-4000-8000-000000000002",
      "00000000-0000-4000-8000-000000000005",
    ],
  },
];

/**
 * projectId, assignedToId reference seed IDs above.
 */
export const SEED_TASKS = [
  // WorkSync Platform
  {
    id: "00000000-0000-4000-8000-000000000101",
    title: "Implement glassmorphic Sidebar",
    description: "Build collapsible navigation with Framer Motion and active route indicators.",
    priority: "HIGH",
    status: "IN_PROGRESS",
    dueDate: day(3),
    projectId: "00000000-0000-4000-8000-000000000011",
    assignedToId: "00000000-0000-4000-8000-000000000003",
  },
  {
    id: "00000000-0000-4000-8000-000000000102",
    title: "Wire Prisma + PostgreSQL",
    description: "Connect API routes to persistent storage with driver adapter and migrations.",
    priority: "HIGH",
    status: "IN_PROGRESS",
    dueDate: day(5),
    projectId: "00000000-0000-4000-8000-000000000011",
    assignedToId: "00000000-0000-4000-8000-000000000002",
  },
  {
    id: "00000000-0000-4000-8000-000000000103",
    title: "Setup API",
    description: "REST handlers for projects, tasks, auth, and activity with JWT middleware.",
    priority: "MEDIUM",
    status: "COMPLETED",
    dueDate: day(-7),
    projectId: "00000000-0000-4000-8000-000000000011",
    assignedToId: "00000000-0000-4000-8000-000000000005",
  },
  {
    id: "00000000-0000-4000-8000-000000000104",
    title: "Auth Middleware",
    description: "withAuth / withRole guards and RBAC on PATCH task routes.",
    priority: "HIGH",
    status: "TODO",
    dueDate: day(-2),
    projectId: "00000000-0000-4000-8000-000000000011",
    assignedToId: "00000000-0000-4000-8000-000000000004",
  },
  {
    id: "00000000-0000-4000-8000-000000000105",
    title: "Database Schema",
    description: "Prisma models for User, Project, Task, Comment, Attachment, ActivityLog.",
    priority: "MEDIUM",
    status: "COMPLETED",
    dueDate: day(-10),
    projectId: "00000000-0000-4000-8000-000000000011",
    assignedToId: "00000000-0000-4000-8000-000000000002",
  },
  {
    id: "00000000-0000-4000-8000-000000000106",
    title: "Finalize GraphQL Types",
    description: "Optional future API layer — document types for federation.",
    priority: "HIGH",
    status: "TODO",
    dueDate: day(0),
    projectId: "00000000-0000-4000-8000-000000000011",
    assignedToId: "00000000-0000-4000-8000-000000000003",
  },
  {
    id: "00000000-0000-4000-8000-000000000107",
    title: "Review Pull Request #42",
    description: "Code review for task modal and infinite scroll pagination.",
    priority: "MEDIUM",
    status: "IN_PROGRESS",
    dueDate: day(1),
    projectId: "00000000-0000-4000-8000-000000000011",
    assignedToId: "00000000-0000-4000-8000-000000000001",
  },
  {
    id: "00000000-0000-4000-8000-000000000108",
    title: "Deploy Staging Environment",
    description: "Vercel preview + managed Postgres instance for QA.",
    priority: "HIGH",
    status: "TODO",
    dueDate: day(4),
    projectId: "00000000-0000-4000-8000-000000000011",
    assignedToId: "00000000-0000-4000-8000-000000000002",
  },
  // Cyber UI
  {
    id: "00000000-0000-4000-8000-000000000109",
    title: "Design token audit",
    description: "Align CSS variables with dark/light theme contexts.",
    priority: "MEDIUM",
    status: "IN_PROGRESS",
    dueDate: day(7),
    projectId: "00000000-0000-4000-8000-000000000012",
    assignedToId: "00000000-0000-4000-8000-000000000007",
  },
  {
    id: "00000000-0000-4000-8000-000000000110",
    title: "KPI card variants",
    description: "Reusable stat cards with gradient borders for dashboard.",
    priority: "LOW",
    status: "TODO",
    dueDate: day(14),
    projectId: "00000000-0000-4000-8000-000000000012",
    assignedToId: "00000000-0000-4000-8000-000000000003",
  },
  {
    id: "00000000-0000-4000-8000-000000000111",
    title: "Redis Cache layer",
    description: "Cache hot project/task list queries — spike investigation.",
    priority: "MEDIUM",
    status: "IN_PROGRESS",
    dueDate: day(10),
    projectId: "00000000-0000-4000-8000-000000000012",
    assignedToId: "00000000-0000-4000-8000-000000000001",
  },
  {
    id: "00000000-0000-4000-8000-000000000112",
    title: "Notification center polish",
    description: "Wire bell dropdown to /api/notifications activity feed.",
    priority: "LOW",
    status: "TODO",
    dueDate: day(12),
    projectId: "00000000-0000-4000-8000-000000000012",
    assignedToId: "00000000-0000-4000-8000-000000000006",
  },
  // Mobile (on hold)
  {
    id: "00000000-0000-4000-8000-000000000113",
    title: "Offline task sync",
    description: "Local queue for status updates when network unavailable.",
    priority: "MEDIUM",
    status: "TODO",
    dueDate: day(60),
    projectId: "00000000-0000-4000-8000-000000000013",
    assignedToId: "00000000-0000-4000-8000-000000000004",
  },
  {
    id: "00000000-0000-4000-8000-000000000114",
    title: "Push notification POC",
    description: "FCM integration for task assignments.",
    priority: "LOW",
    status: "TODO",
    dueDate: day(75),
    projectId: "00000000-0000-4000-8000-000000000013",
    assignedToId: null,
  },
  // Q1 Infra (completed project)
  {
    id: "00000000-0000-4000-8000-000000000115",
    title: "Provision PostgreSQL",
    description: "Managed instance + connection pooling for Prisma adapter.",
    priority: "HIGH",
    status: "COMPLETED",
    dueDate: day(-30),
    projectId: "00000000-0000-4000-8000-000000000014",
    assignedToId: "00000000-0000-4000-8000-000000000005",
  },
  {
    id: "00000000-0000-4000-8000-000000000116",
    title: "GitHub Actions CI",
    description: "Lint, prisma generate, and next build on pull requests.",
    priority: "MEDIUM",
    status: "COMPLETED",
    dueDate: day(-25),
    projectId: "00000000-0000-4000-8000-000000000014",
    assignedToId: "00000000-0000-4000-8000-000000000002",
  },
  {
    id: "00000000-0000-4000-8000-000000000117",
    title: "Secrets rotation runbook",
    description: "Document JWT_SECRET and DATABASE_URL rotation steps.",
    priority: "LOW",
    status: "COMPLETED",
    dueDate: day(-20),
    projectId: "00000000-0000-4000-8000-000000000014",
    assignedToId: "00000000-0000-4000-8000-000000000001",
  },
];

export const SEED_COMMENTS = [
  {
    id: "00000000-0000-4000-8000-000000000201",
    text: "Sidebar collapse animation looks smooth — ready for QA.",
    authorId: "00000000-0000-4000-8000-000000000002",
    taskId: "00000000-0000-4000-8000-000000000101",
  },
  {
    id: "00000000-0000-4000-8000-000000000202",
    text: "Can we add keyboard shortcut for collapse?",
    authorId: "00000000-0000-4000-8000-000000000003",
    taskId: "00000000-0000-4000-8000-000000000101",
  },
  {
    id: "00000000-0000-4000-8000-000000000203",
    text: "Adapter-pg pool size default is fine for dev.",
    authorId: "00000000-0000-4000-8000-000000000001",
    taskId: "00000000-0000-4000-8000-000000000102",
  },
  {
    id: "00000000-0000-4000-8000-000000000204",
    text: "API routes merged — nice work John.",
    authorId: "00000000-0000-4000-8000-000000000002",
    taskId: "00000000-0000-4000-8000-000000000103",
  },
  {
    id: "00000000-0000-4000-8000-000000000205",
    text: "This is blocking staging — need ETA.",
    authorId: "00000000-0000-4000-8000-000000000001",
    taskId: "00000000-0000-4000-8000-000000000104",
  },
  {
    id: "00000000-0000-4000-8000-000000000206",
    text: "Sarah Connor commented on Auth Flow Refactor — patterns look good.",
    authorId: "00000000-0000-4000-8000-000000000006",
    taskId: "00000000-0000-4000-8000-000000000104",
  },
  {
    id: "00000000-0000-4000-8000-000000000207",
    text: "Schema review approved. Enums match API validation.",
    authorId: "00000000-0000-4000-8000-000000000001",
    taskId: "00000000-0000-4000-8000-000000000105",
  },
  {
    id: "00000000-0000-4000-8000-000000000208",
    text: "Alex commented on Redis Cache — start with 5min TTL on project list.",
    authorId: "00000000-0000-4000-8000-000000000001",
    taskId: "00000000-0000-4000-8000-000000000111",
  },
  {
    id: "00000000-0000-4000-8000-000000000209",
    text: "Figma tokens exported to globals.css.",
    authorId: "00000000-0000-4000-8000-000000000007",
    taskId: "00000000-0000-4000-8000-000000000109",
  },
  {
    id: "00000000-0000-4000-8000-000000000210",
    text: "PR #42: left one nit on z-index in modal overlay.",
    authorId: "00000000-0000-4000-8000-000000000003",
    taskId: "00000000-0000-4000-8000-000000000107",
  },
];

export const SEED_ATTACHMENTS = [
  {
    id: "00000000-0000-4000-8000-000000000301",
    name: "sidebar-wireframe.png",
    url: "https://placehold.co/800x600/0a0a0a/00f2fe?text=Sidebar+Wireframe",
    taskId: "00000000-0000-4000-8000-000000000101",
  },
  {
    id: "00000000-0000-4000-8000-000000000302",
    name: "prisma-schema.pdf",
    url: "https://placehold.co/800x600/1a1a2e/9d4edd?text=Prisma+Schema",
    taskId: "00000000-0000-4000-8000-000000000102",
  },
  {
    id: "00000000-0000-4000-8000-000000000303",
    name: "api-openapi.yaml",
    url: "https://placehold.co/800x600/0f172a/10b981?text=OpenAPI+Spec",
    taskId: "00000000-0000-4000-8000-000000000103",
  },
  {
    id: "00000000-0000-4000-8000-000000000304",
    name: "rbac-matrix.xlsx",
    url: "https://placehold.co/800x600/0a0a0a/f43f5e?text=RBAC+Matrix",
    taskId: "00000000-0000-4000-8000-000000000104",
  },
  {
    id: "00000000-0000-4000-8000-000000000305",
    name: "design-tokens.json",
    url: "https://placehold.co/800x600/18181b/00f2fe?text=Design+Tokens",
    taskId: "00000000-0000-4000-8000-000000000109",
  },
  {
    id: "00000000-0000-4000-8000-000000000306",
    name: "dashboard-mockup.fig",
    url: "https://placehold.co/800x600/0a0a0a/9d4edd?text=Dashboard+Mockup",
    taskId: "00000000-0000-4000-8000-000000000110",
  },
  {
    id: "00000000-0000-4000-8000-000000000307",
    name: "ci-pipeline.yml",
    url: "https://placehold.co/800x600/0f172a/10b981?text=CI+Pipeline",
    taskId: "00000000-0000-4000-8000-000000000116",
  },
  {
    id: "00000000-0000-4000-8000-000000000308",
    name: "staging-checklist.md",
    url: "https://placehold.co/800x600/1e293b/38bdf8?text=Staging+Checklist",
    taskId: "00000000-0000-4000-8000-000000000108",
  },
];

/** userId, actionDescription, timestamp offset in days */
export const SEED_ACTIVITY_LOGS = [
  {
    id: "00000000-0000-4000-8000-000000000401",
    userId: "00000000-0000-4000-8000-000000000002",
    actionDescription: "Task 'Setup API' assigned to John",
    daysAgo: 0,
  },
  {
    id: "00000000-0000-4000-8000-000000000402",
    userId: "00000000-0000-4000-8000-000000000006",
    actionDescription: "Project 'Cyber UI Redesign' marked as ACTIVE",
    daysAgo: 0,
  },
  {
    id: "00000000-0000-4000-8000-000000000403",
    userId: "00000000-0000-4000-8000-000000000002",
    actionDescription: "Sarah completed 'Database Schema'",
    daysAgo: 1,
  },
  {
    id: "00000000-0000-4000-8000-000000000404",
    userId: "00000000-0000-4000-8000-000000000001",
    actionDescription: "Overdue alert: 'Auth Middleware'",
    daysAgo: 1,
  },
  {
    id: "00000000-0000-4000-8000-000000000405",
    userId: "00000000-0000-4000-8000-000000000001",
    actionDescription: "Alex commented on 'Redis Cache'",
    daysAgo: 2,
  },
  {
    id: "00000000-0000-4000-8000-000000000406",
    userId: "00000000-0000-4000-8000-000000000002",
    actionDescription: "Created new project pipeline: 'WorkSync Platform'",
    daysAgo: 14,
  },
  {
    id: "00000000-0000-4000-8000-000000000407",
    userId: "00000000-0000-4000-8000-000000000002",
    actionDescription: "Assigned task 'Implement glassmorphic Sidebar' to 'Marcus Wright'",
    daysAgo: 5,
  },
  {
    id: "00000000-0000-4000-8000-000000000408",
    userId: "00000000-0000-4000-8000-000000000003",
    actionDescription: "Updated status of task 'Implement glassmorphic Sidebar' to 'IN_PROGRESS'",
    daysAgo: 4,
  },
  {
    id: "00000000-0000-4000-8000-000000000409",
    userId: "00000000-0000-4000-8000-000000000001",
    actionDescription: "Logged in to WorkSync console.",
    daysAgo: 0,
  },
  {
    id: "00000000-0000-4000-8000-000000000410",
    userId: "00000000-0000-4000-8000-000000000005",
    actionDescription: "Updated status of task 'Setup API' to 'COMPLETED'",
    daysAgo: 7,
  },
  {
    id: "00000000-0000-4000-8000-000000000411",
    userId: "00000000-0000-4000-8000-000000000006",
    actionDescription: "Created new project pipeline: 'Cyber UI Redesign'",
    daysAgo: 10,
  },
  {
    id: "00000000-0000-4000-8000-000000000412",
    userId: "00000000-0000-4000-8000-000000000001",
    actionDescription: "Updated project configs: 'Q1 Infrastructure'",
    daysAgo: 15,
  },
  {
    id: "00000000-0000-4000-8000-000000000413",
    userId: "00000000-0000-4000-8000-000000000002",
    actionDescription: "Assigned task 'Wire Prisma + PostgreSQL' to 'Sarah Connor'",
    daysAgo: 3,
  },
  {
    id: "00000000-0000-4000-8000-000000000414",
    userId: "00000000-0000-4000-8000-000000000004",
    actionDescription: "Updated details for task 'Auth Middleware'",
    daysAgo: 2,
  },
  {
    id: "00000000-0000-4000-8000-000000000415",
    userId: "00000000-0000-4000-8000-000000000007",
    actionDescription: "Updated status of task 'Design token audit' to 'IN_PROGRESS'",
    daysAgo: 1,
  },
  {
    id: "00000000-0000-4000-8000-000000000416",
    userId: "00000000-0000-4000-8000-000000000001",
    actionDescription: "Registered new user account: 'Demo Viewer' with role 'TEAM_MEMBER'",
    daysAgo: 20,
  },
  {
    id: "00000000-0000-4000-8000-000000000417",
    userId: "00000000-0000-4000-8000-000000000002",
    actionDescription: "Updated details for task 'Deploy Staging Environment'",
    daysAgo: 1,
  },
  {
    id: "00000000-0000-4000-8000-000000000418",
    userId: "00000000-0000-4000-8000-000000000003",
    actionDescription: "Updated status of task 'Review Pull Request #42' to 'IN_PROGRESS'",
    daysAgo: 0,
  },
  {
    id: "00000000-0000-4000-8000-000000000419",
    userId: "00000000-0000-4000-8000-000000000001",
    actionDescription: "Deleted project: 'Legacy Prototype'",
    daysAgo: 30,
  },
  {
    id: "00000000-0000-4000-8000-000000000420",
    userId: "00000000-0000-4000-8000-000000000005",
    actionDescription: "Updated status of task 'Provision PostgreSQL' to 'COMPLETED'",
    daysAgo: 28,
  },
];
