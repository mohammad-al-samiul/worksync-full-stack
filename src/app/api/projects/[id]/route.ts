import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, withRole, AuthenticatedRequest } from "@/lib/middleware";

/**
 * GET /api/projects/[id]
 * Fetches a singular project details. Checks accessibility.
 */
export const GET = withAuth(async (request: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const { userId, role } = request.user;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true, role: true, avatar: true } },
        members: { select: { id: true, name: true, email: true, role: true, avatar: true } },
        tasks: {
          include: {
            assignedTo: { select: { id: true, name: true, email: true, avatar: true } },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Role accessibility bounds
    const isMember = project.members.some((m) => m.id === userId);
    const isCreator = project.createdById === userId;

    if (role !== "ADMIN" && !isMember && !isCreator) {
      return NextResponse.json(
        { error: "Access Denied: You do not belong to this project" },
        { status: 403 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("GET Project Detail Exception:", error);
    return NextResponse.json({ error: "Failed to query project details" }, { status: 500 });
  }
});

/**
 * PUT /api/projects/[id]
 * Updates project details. Restricted to ADMIN and PROJECT_MANAGER.
 */
export const PUT = withRole(
  ["ADMIN", "PROJECT_MANAGER"],
  async (request: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;
      const { name, description, deadline, status, memberEmails } = await request.json();
      const { userId, role } = request.user;

      const project = await prisma.project.findUnique({
        where: { id },
      });

      if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }

      // Check boundary: PMs can only edit projects they created
      if (role !== "ADMIN" && project.createdById !== userId) {
        return NextResponse.json(
          { error: "Access Denied: You can only edit projects you created" },
          { status: 403 }
        );
      }

      if (deadline) {
        const parsed = new Date(deadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        parsed.setHours(0, 0, 0, 0);
        const existingDay = project.deadline
          ? new Date(project.deadline).toDateString()
          : null;
        if (parsed < today && parsed.toDateString() !== existingDay) {
          return NextResponse.json(
            { error: "Please select a valid deadline." },
            { status: 400 }
          );
        }
      }

      const updateData: Record<string, unknown> = {};
      if (name) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (deadline !== undefined) updateData.deadline = deadline ? new Date(deadline) : null;
      if (status) updateData.status = status;

      if (memberEmails && Array.isArray(memberEmails)) {
        const dbMembers = await prisma.user.findMany({
          where: { email: { in: memberEmails } },
          select: { id: true, name: true },
        });
        updateData.members = {
          set: dbMembers.map((m) => ({ id: m.id })),
        };

        const addedNames = dbMembers.map((m) => m.name).join(", ");
        if (addedNames) {
          await prisma.activityLog.create({
            data: {
              userId,
              actionDescription: `Member added to "${project.name}" (${addedNames})`,
            },
          });
        }
      }

      const updatedProject = await prisma.project.update({
        where: { id },
        data: updateData,
        include: {
          members: { select: { id: true, name: true, email: true, role: true } },
        },
      });

      await prisma.activityLog.create({
        data: {
          userId,
          actionDescription: `Project "${project.name}" updated`,
        },
      });

      return NextResponse.json(updatedProject);
    } catch (error) {
      console.error("PUT Project Exception:", error);
      return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
    }
  }
);

/**
 * DELETE /api/projects/[id]
 * Deletes a project. Restricted to ADMIN and PROJECT_MANAGER.
 */
export const DELETE = withRole(
  ["ADMIN", "PROJECT_MANAGER"],
  async (request: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;
      const { userId, role } = request.user;

      const project = await prisma.project.findUnique({
        where: { id },
      });

      if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }

      // Check boundary: PMs can only delete projects they created
      if (role !== "ADMIN" && project.createdById !== userId) {
        return NextResponse.json(
          { error: "Access Denied: You can only delete projects you created" },
          { status: 403 }
        );
      }

      await prisma.project.delete({
        where: { id },
      });

      await prisma.activityLog.create({
        data: {
          userId,
          actionDescription: `Project "${project.name}" deleted`,
        },
      });

      return NextResponse.json({ message: "Project deleted successfully" });
    } catch (error) {
      console.error("DELETE Project Exception:", error);
      return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
    }
  }
);
