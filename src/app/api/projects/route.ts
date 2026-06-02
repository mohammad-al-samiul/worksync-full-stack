import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, withRole, AuthenticatedRequest } from "@/lib/middleware";

/**
 * GET /api/projects
 * Retrieves all projects.
 * - ADMIN: Returns all projects in database.
 * - PROJECT_MANAGER & TEAM_MEMBER: Returns projects they created or belong to.
 */
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const { userId, role } = request.user;

    let projects;
    if (role === "ADMIN") {
      projects = await prisma.project.findMany({
        include: {
          createdBy: { select: { id: true, name: true, email: true, role: true, avatar: true } },
          members: { select: { id: true, name: true, email: true, role: true, avatar: true } },
          tasks: true,
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      projects = await prisma.project.findMany({
        where: {
          OR: [
            { createdById: userId },
            { members: { some: { id: userId } } },
          ],
        },
        include: {
          createdBy: { select: { id: true, name: true, email: true, role: true, avatar: true } },
          members: { select: { id: true, name: true, email: true, role: true, avatar: true } },
          tasks: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json(projects);
  } catch (error) {
    console.error("GET Projects Exception:", error);
    return NextResponse.json({ error: "Failed to query projects" }, { status: 500 });
  }
});

/**
 * POST /api/projects
 * Creates a new project. Restricted to ADMIN and PROJECT_MANAGER.
 */
export const POST = withRole(
  ["ADMIN", "PROJECT_MANAGER"],
  async (request: AuthenticatedRequest) => {
    try {
      const { name, description, deadline, memberEmails } = await request.json();
      const { userId } = request.user;

      if (!name) {
        return NextResponse.json({ error: "Project name is required" }, { status: 400 });
      }

      // Convert member emails to IDs
      let connectMembers: { id: string }[] = [];
      if (memberEmails && Array.isArray(memberEmails) && memberEmails.length > 0) {
        const dbMembers = await prisma.user.findMany({
          where: { email: { in: memberEmails } },
          select: { id: true },
        });
        connectMembers = dbMembers.map((m) => ({ id: m.id }));
      }

      const project = await prisma.project.create({
        data: {
          name,
          description,
          deadline: deadline ? new Date(deadline) : null,
          createdById: userId,
          members: {
            connect: connectMembers,
          },
        },
        include: {
          members: { select: { id: true, name: true, email: true, role: true } },
        },
      });

      // Log action
      await prisma.activityLog.create({
        data: {
          userId,
          actionDescription: `Created new project pipeline: '${name}'`,
        },
      });

      return NextResponse.json(project, { status: 201 });
    } catch (error) {
      console.error("POST Projects Exception:", error);
      return NextResponse.json({ error: "Failed to write project record" }, { status: 500 });
    }
  }
);
