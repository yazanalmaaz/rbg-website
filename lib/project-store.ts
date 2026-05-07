import { promises as fs } from "fs";
import path from "path";

export type ProjectFile = {
  name: string;
  url: string;
};

export type ProjectRecord = {
  projectId: string;
  ownerName: string;
  projectName: string;
  status: number;
  files: ProjectFile[];
  photos: string[];
};

type StoreShape = {
  projects: ProjectRecord[];
};

const storePath = path.join(process.cwd(), "data", "projects.json");

async function readStore(): Promise<StoreShape> {
  const content = await fs.readFile(storePath, "utf-8");
  return JSON.parse(content) as StoreShape;
}

async function writeStore(data: StoreShape): Promise<void> {
  await fs.writeFile(storePath, JSON.stringify(data, null, 2), "utf-8");
}

export async function getProjectById(projectId: string): Promise<ProjectRecord | null> {
  const normalizedId = projectId.trim().toUpperCase();
  const store = await readStore();
  return store.projects.find((project) => project.projectId.toUpperCase() === normalizedId) ?? null;
}

export async function upsertProject(project: ProjectRecord): Promise<ProjectRecord> {
  const store = await readStore();
  const normalized: ProjectRecord = {
    ...project,
    projectId: project.projectId.trim().toUpperCase(),
    status: Math.max(0, Math.min(100, Number(project.status) || 0)),
    files: project.files ?? [],
    photos: project.photos ?? []
  };

  const existingIndex = store.projects.findIndex(
    (item) => item.projectId.toUpperCase() === normalized.projectId.toUpperCase()
  );

  if (existingIndex >= 0) {
    store.projects[existingIndex] = normalized;
  } else {
    store.projects.unshift(normalized);
  }

  await writeStore(store);
  return normalized;
}
