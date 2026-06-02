import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";

/**
 * PATCH /api/tasks/[id]
 * Updates task details. Strictly enforces user roles and assignments:
 * - ADMIN / PROJECT_MANAGER: Full access to update all fields.
 * - TEAM_MEMBER: Can ONLY update "status" field, and ONLY if the task is assigned to them.
 */
export const PATCH = withAuth(async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params;
    const body = await request.json();
    const { userId, role } = request.user;

    // Fetch existing task
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: true,
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Role-Based Authorization
    if (role === "TEAM_MEMBER") {
      // 1. Verify task is assigned to this member
      if (task.assignedToId !== userId) {
        return NextResponse.json(
          { error: "Access Denied: You can only modify tasks assigned to you" },
          { status: 403 }
        );
      }

      // 2. Verify they only update 'status'
      const modifiedFields = Object.keys(body).filter((key) => body[key] !== undefined);
      const isOnlyStatusUpdate = modifiedFields.length === 1 && modifiedFields[0] === "status";

      if (!isOnlyStatusUpdate) {
        return NextResponse.json(
          { error: "Access Denied: Team members are only permitted to update task status" },
          { status: 403 }
        );
      }

      // Execute status-only update
      const updatedTask = await prisma.task.update({
        where: { id },
        data: { status: body.status },
      });

      // Log action
      await prisma.activityLog.create({
        data: {
          userId,
          actionDescription: `Updated status of task '${task.title}' to '${body.status}'`,
        },
      });

      return NextResponse.json(updatedTask);
    }

    // ADMIN and PROJECT_MANAGER: Full Access
    // Boundary check for PM
    if (role === "PROJECT_MANAGER") {
      // Confirm PM owns the project or is member of it
      if (task.project.createdById !== userId) {
        const isMember = await prisma.project.findFirst({
          where: { id: task.projectId, members: { some: { id: userId } } },
        });
        if (!isMember) {
          return NextResponse.json(
            { error: "Access Denied: You do not own or belong to the parent project" },
            { status: 403 }
          );
        }
      }
    }

    // Conflict Validations
    if (body.title && body.title !== task.title) {
        const existingTask = await prisma.task.findFirst({
            where: { title: body.title, projectId: task.projectId },
        });
        if (existingTask) {
            return NextResponse.json(
                { error: "A task with this title already exists in the project" },
                { status: 409 }
            );
        }
    }

    if (body.dueDate) {
        const parsedDueDate = new Date(body.dueDate);
        if (parsedDueDate < new Date() && parsedDueDate.toDateString() !== task.dueDate?.toDateString()) {
            return NextResponse.json(
                { error: "Task deadline cannot be set in the past" },
                { status: 400 }
            );
        }
    }

    // No reassigning completed tasks
    if (task.status === "COMPLETED" && body.assignedToEmail !== undefined) {
        // If they are trying to change assignee
        // We'll check if it actually changes the assignee ID, but for simplicity, any assignee update attempt on COMPLETED fails.
        return NextResponse.json(
            { error: "Cannot reassign a completed task" },
            { status: 400 }
        );
    }

    // Prepare update data
    const updateData: any = {};
    if (body.title) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.dueDate !== undefined) updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    if (body.priority) updateData.priority = body.priority;
    if (body.status) updateData.status = body.status;

    if (body.assignedToEmail !== undefined) {
      if (body.assignedToEmail === null) {
        updateData.assignedToId = null;
      } else {
        const assignee = await prisma.user.findUnique({
          where: { email: body.assignedToEmail },
          select: { id: true },
        });
        if (assignee) {
          updateData.assignedToId = assignee.id;
        } else {
            return NextResponse.json({ error: "Assignee email not found" }, { status: 404 });
        }
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
    });

    // Log action
    await prisma.activityLog.create({
      data: {
        userId,
        actionDescription: `Updated details for task '${task.title}'`,
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("PATCH Task Exception:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
});
