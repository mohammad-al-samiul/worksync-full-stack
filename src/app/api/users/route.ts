import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";

/**
 * GET /api/users
 * Team roster with task counts (for Team page).
 */
export const GET = withAuth(async () => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        assignedTasks: { select: { status: true } },
      },
      orderBy: { name: "asc" },
    });

    const roster = users.map((u) => {
      const activeTasks = u.assignedTasks.filter((t) => t.status !== "COMPLETED").length;
      const completedTasks = u.assignedTasks.filter((t) => t.status === "COMPLETED").length;
      const total = u.assignedTasks.length;
      const efficiency =
        total > 0 ? `${Math.round((completedTasks / total) * 100)}%` : "—";

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        avatar: u.avatar,
        activeTasks,
        completedTasks,
        efficiency,
      };
    });

    return NextResponse.json(roster);
  } catch (error) {
    console.error("GET Users Exception:", error);
    return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 });
  }
});
