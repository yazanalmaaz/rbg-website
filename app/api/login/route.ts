import { NextResponse } from "next/server";
import { getProjectById } from "../../../lib/project-store";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { projectId?: string };
    const projectId = body.projectId?.trim();

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required." }, { status: 400 });
    }

    const project = await getProjectById(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
