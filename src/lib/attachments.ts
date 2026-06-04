import { mkdir, writeFile } from "fs/promises";
import path from "path";

export function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function saveTaskAttachment(
  taskId: string,
  file: File
): Promise<string> {
  const uploadsDir = path.join(
    process.cwd(),
    "public",
    "uploads",
    "tasks",
    taskId
  );
  await mkdir(uploadsDir, { recursive: true });

  const safeName = `${Date.now()}-${sanitizeFileName(file.name)}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadsDir, safeName), buffer);

  return `/uploads/tasks/${taskId}/${safeName}`;
}
