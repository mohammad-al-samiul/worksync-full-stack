import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/middleware';
import type { AuthenticatedRequest } from '@/lib/middleware';

export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const { userId } = request.user;
    const url = new URL(request.url);
    const taskId = url.searchParams.get('taskId');
    if (!taskId) return NextResponse.json({ error: 'Missing taskId' }, { status: 400 });

    // Parse multipart/form-data (simplified mock)
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

    // Mock URL generation (in a real app you would upload to S3/Cloudinary)
    const mockUrl = `/mock-uploads/${encodeURIComponent(file.name)}`;

    const attachment = await prisma.attachment.create({
      data: {
        name: file.name,
        url: mockUrl,
        task: { connect: { id: taskId } },
      },
    });

    return NextResponse.json(attachment, { status: 201 });
  } catch (error) {
    console.error('POST Attachment Error:', error);
    return NextResponse.json({ error: 'Failed to upload attachment' }, { status: 500 });
  }
});
