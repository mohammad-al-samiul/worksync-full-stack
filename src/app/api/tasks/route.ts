import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, withRole, AuthenticatedRequest } from "@/lib/middleware";

/**
 * GET /api/tasks
 * Returns tasks relative to user's access:
 * - ADMIN: All tasks.
 * - PROJECT_MANAGER & TEAM_MEMBER: Tasks where they are the assignee, or belong to their projects.
 */
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const { userId, role } = request.user;

    let tasks;
    if (role === "ADMIN") {
      tasks = await prisma.task.findMany({
        include: {
          project: { select: { id: true, name: true } },
          assignedTo: { select: { id: true, name: true, email: true, role: true, avatar: true } },
          comments: { include: { author: { select: { name: true } } } },
          attachments: true,
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      tasks = await prisma.task.findMany({
        where: {
          OR: [
            { assignedToId: userId },
            {
              project: {
                OR: [
                  { createdById: userId },
                  { members: { some: { id: userId } } },
                ],
              },
            },
          ],
        },
        include: {
          project: { select: { id: true, name: true } },
          assignedTo: { select: { id: true, name: true, email: true, role: true, avatar: true } },
          comments: { include: { author: { select: { name: true } } } },
          attachments: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("GET Tasks Exception:", error);
    return NextResponse.json({ error: "Failed to query tasks" }, { status: 500 });
  }
});

/**
 * POST /api/tasks
 * Creates a new task and assigns it. Restricted to ADMIN and PROJECT_MANAGER.
 */
export const POST = withRole(
  ["ADMIN", "PROJECT_MANAGER"],
  async (request: AuthenticatedRequest) => {
    try {
      const { title, description, dueDate, priority, projectId, assignedToEmail } = await request.json();
      const { userId, role } = request.user;

      if (!title || !projectId) {
        return NextResponse.json({ error: "Title and Project ID are required" }, { status: 400 });
      }

      // Check project existence and access
      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }

      // Boundary: PMs can only add tasks to projects they created or belong to
      if (role !== "ADMIN" && project.createdById !== userId) {
        const isMember = await prisma.project.findFirst({
          where: { id: projectId, members: { some: { id: userId } } },
        });
        if (!isMember) {
          return NextResponse.json(
            { error: "Access Denied: You do not own or belong to this parent project" },
            { status: 403 }
          );
        }
      }

      // Conflict validation: No duplicate task titles in the same project
      const existingTask = await prisma.task.findFirst({
        where: { title, projectId },
      });
      if (existingTask) {
        return NextResponse.json(
          { error: "A task with this title already exists in the project" },
          { status: 409 }
        );
      }

      // Conflict validation: No past deadlines
      if (dueDate) {
        const parsedDueDate = new Date(dueDate);
        if (parsedDueDate < new Date()) {
          return NextResponse.json(
            { error: "Task deadline cannot be set in the past" },
            { status: 400 }
          );
        }
      }

      // Find assignee ID from email
      let assignedToId: string | null = null;
      let assignedName = "Unassigned";
      if (assignedToEmail) {
        const assignee = await prisma.user.findUnique({
          where: { email: assignedToEmail },
          select: { id: true, name: true },
        });
        if (assignee) {
          assignedToId = assignee.id;
          assignedName = assignee.name;
        } else {
            return NextResponse.json({ error: "Assignee email not found" }, { status: 404 });
        }
      }

      const task = await prisma.task.create({
        data: {
          title,
          description,
          dueDate: dueDate ? new Date(dueDate) : null,
          priority: priority || "MEDIUM",
          projectId,
          assignedToId,
        },
        include: {
          project: { select: { name: true } },
          assignedTo: { select: { name: true, email: true } },
        },
      });

      // Log action
      await prisma.activityLog.create({
        data: {
          userId,
          actionDescription: `Assigned task '${title}' to '${assignedName}' on project '${task.project.name}'`,
        },
      });

      return NextResponse.json(task, { status: 201 });
    } catch (error) {
      console.error("POST Tasks Exception:", error);
      return NextResponse.json({ error: "Failed to write task record" }, { status: 500 });
    }
  }
);
