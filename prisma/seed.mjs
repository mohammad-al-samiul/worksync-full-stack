/**
 * WorkSync — full database seed
 *
 * Usage:
 *   npm run db:seed              # upsert all seed data (idempotent)
 *   npm run db:seed -- --reset   # wipe tables then seed
 *   SEED_RESET=1 npm run db:seed # same as --reset
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";
import {
  SEED_USERS,
  SEED_PROJECTS,
  SEED_TASKS,
  SEED_COMMENTS,
  SEED_ATTACHMENTS,
  SEED_ACTIVITY_LOGS,
} from "./seed/data.mjs";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is required. Copy .env.example to .env first.");
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const shouldReset =
  process.argv.includes("--reset") || process.env.SEED_RESET === "1";

function logTimestamp(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(10 + (daysAgo % 8), 15, 0, 0);
  return d;
}

async function resetDatabase() {
  console.log("Resetting database (all WorkSync tables)...");
  await prisma.activityLog.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
  console.log("Reset complete.\n");
}

async function seedUsers() {
  console.log(`Seeding ${SEED_USERS.length} users...`);
  for (const user of SEED_USERS) {
    const passwordHash = await bcrypt.hash(user.password, 10);
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        passwordHash,
        role: user.role,
        avatar: user.avatar,
      },
      create: {
        id: user.id,
        name: user.name,
        email: user.email,
        passwordHash,
        role: user.role,
        avatar: user.avatar,
      },
    });
  }
}

async function seedProjects() {
  console.log(`Seeding ${SEED_PROJECTS.length} projects...`);
  for (const project of SEED_PROJECTS) {
    await prisma.project.upsert({
      where: { id: project.id },
      update: {
        name: project.name,
        description: project.description,
        status: project.status,
        deadline: project.deadline,
        createdById: project.createdById,
        members: {
          set: project.memberIds.map((id) => ({ id })),
        },
      },
      create: {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        deadline: project.deadline,
        createdById: project.createdById,
        members: {
          connect: project.memberIds.map((id) => ({ id })),
        },
      },
    });
  }
}

async function seedTasks() {
  console.log(`Seeding ${SEED_TASKS.length} tasks...`);
  for (const task of SEED_TASKS) {
    await prisma.task.upsert({
      where: { id: task.id },
      update: {
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate,
        projectId: task.projectId,
        assignedToId: task.assignedToId,
      },
      create: {
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate,
        projectId: task.projectId,
        assignedToId: task.assignedToId,
      },
    });
  }
}

async function seedComments() {
  console.log(`Seeding ${SEED_COMMENTS.length} comments...`);
  for (const comment of SEED_COMMENTS) {
    await prisma.comment.upsert({
      where: { id: comment.id },
      update: {
        text: comment.text,
        authorId: comment.authorId,
        taskId: comment.taskId,
      },
      create: {
        id: comment.id,
        text: comment.text,
        authorId: comment.authorId,
        taskId: comment.taskId,
      },
    });
  }
}

async function seedAttachments() {
  console.log(`Seeding ${SEED_ATTACHMENTS.length} attachments...`);
  for (const file of SEED_ATTACHMENTS) {
    await prisma.attachment.upsert({
      where: { id: file.id },
      update: {
        name: file.name,
        url: file.url,
        taskId: file.taskId,
      },
      create: {
        id: file.id,
        name: file.name,
        url: file.url,
        taskId: file.taskId,
      },
    });
  }
}

async function seedActivityLogs() {
  console.log(`Seeding ${SEED_ACTIVITY_LOGS.length} activity logs...`);
  for (const log of SEED_ACTIVITY_LOGS) {
    await prisma.activityLog.upsert({
      where: { id: log.id },
      update: {
        userId: log.userId,
        actionDescription: log.actionDescription,
        timestamp: logTimestamp(log.daysAgo),
      },
      create: {
        id: log.id,
        userId: log.userId,
        actionDescription: log.actionDescription,
        timestamp: logTimestamp(log.daysAgo),
      },
    });
  }
}

function printSummary() {
  const byRole = SEED_USERS.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {});

  console.log("\n========================================");
  console.log("  WorkSync seed finished successfully");
  console.log("========================================\n");
  console.log("Counts:");
  console.log(`  Users:         ${SEED_USERS.length}  (${Object.entries(byRole).map(([r, n]) => `${r}: ${n}`).join(", ")})`);
  console.log(`  Projects:      ${SEED_PROJECTS.length}  (ACTIVE: 2, ON_HOLD: 1, COMPLETED: 1)`);
  console.log(`  Tasks:         ${SEED_TASKS.length}`);
  console.log(`  Comments:      ${SEED_COMMENTS.length}`);
  console.log(`  Attachments:   ${SEED_ATTACHMENTS.length}`);
  console.log(`  Activity logs: ${SEED_ACTIVITY_LOGS.length}\n`);

  console.log("Login credentials (all passwords shown once):\n");
  console.log("  Role              Email                    Password");
  console.log("  ----------------  -----------------------  ----------");
  for (const u of SEED_USERS) {
    const rolePad = u.role.padEnd(16);
    const emailPad = u.email.padEnd(23);
    console.log(`  ${rolePad}  ${emailPad}  ${u.password}`);
  }

  console.log("\nPrimary demo accounts:");
  console.log("  admin@worksync.io     / admin123");
  console.log("  manager@worksync.io   / manager123");
  console.log("  member@worksync.io    / member123\n");
  console.log("Re-run with wipe:  npm run db:seed -- --reset\n");
}

async function main() {
  console.log("\nWorkSync — full project seed\n");

  if (shouldReset) {
    await resetDatabase();
  }

  await seedUsers();
  await seedProjects();
  await seedTasks();
  await seedComments();
  await seedAttachments();
  await seedActivityLogs();

  printSummary();
}

main()
  .catch((e) => {
    console.error("\nSeed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
