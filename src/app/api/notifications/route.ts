import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/middleware";

/**
 * GET /api/notifications
 * Recent activity logs as notification feed.
 */
export const GET = withAuth(async () => {
  try {
    const logs = await prisma.activityLog.findMany({
      orderBy: { timestamp: "desc" },
      take: 25,
      include: {
        user: { select: { name: true, avatar: true } },
      },
    });
    return NextResponse.json(logs);
  } catch (error) {
    console.error("GET Notifications Error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
});
