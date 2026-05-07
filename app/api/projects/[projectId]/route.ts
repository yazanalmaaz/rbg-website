import { NextResponse } from "next/server";
import { getProjectById } from "../../../../lib/project-store";

type RouteContext = {
  params: {
    projectId: string;
  };
};

export async function GET(_: Request, context: RouteContext) {
  const projectId = context.params.projectId;
  const project = await getProjectById(projectId);

  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  return NextResponse.json({ project });
}
