import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/middleware";
import type { AuthenticatedRequest } from "@/lib/middleware";
import { saveTaskAttachment } from "@/lib/attachments";

export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const url = new URL(request.url);
    const taskId = url.searchParams.get("taskId");
    if (!taskId) {
      return NextResponse.json({ error: "Missing taskId" }, { status: 400 });
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true, projectId: true, assignedToId: true, title: true },
    });
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const publicUrl = await saveTaskAttachment(taskId, file);

    const attachment = await prisma.attachment.create({
      data: {
        name: file.name,
        url: publicUrl,
        task: { connect: { id: taskId } },
      },
    });

    const { userId } = request.user;
    await prisma.activityLog.create({
      data: {
        userId,
        actionDescription: `File "${file.name}" uploaded to task "${task.title}"`,
      },
    });

    return NextResponse.json(attachment, { status: 201 });
  } catch (error) {
    console.error("POST Attachment Error:", error);
    return NextResponse.json(
      { error: "Failed to upload attachment" },
      { status: 500 }
    );
  }
});
