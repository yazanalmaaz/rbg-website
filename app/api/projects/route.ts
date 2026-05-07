import { NextResponse } from "next/server";
import type { ProjectRecord } from "../../../lib/project-store";
import { upsertProject } from "../../../lib/project-store";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<ProjectRecord>;
    const projectId = body.projectId?.trim();
    const ownerName = body.ownerName?.trim();
    const projectName = body.projectName?.trim();
    const status = Number(body.status ?? 0);
    const photo = body.photos?.[0]?.trim();

    if (!projectId || !ownerName || !projectName || !photo) {
      return NextResponse.json(
        { error: "Project ID, Name, Project Name, and Upload Photo are required." },
        { status: 400 }
      );
    }

    const normalizedProject: ProjectRecord = {
      projectId,
      ownerName,
      projectName,
      status,
      files: body.files ?? [
        { name: `${projectName} - Structural Blueprint.pdf`, url: "#" },
        { name: `${projectName} - Mechanical Layout.pdf`, url: "#" }
      ],
      photos: [photo]
    };

    const project = await upsertProject(normalizedProject);
    return NextResponse.json({ project });
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
