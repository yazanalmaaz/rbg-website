"use client";

import { FormEvent, useEffect, useState } from "react";
import { motion } from "framer-motion";

type ProjectFile = {
  name: string;
  url: string;
};

type ProjectRecord = {
  projectId: string;
  ownerName: string;
  projectName: string;
  status: number;
  files: ProjectFile[];
  photos: string[];
};

const milestones = [
  { label: "Design", value: 20 },
  { label: "Foundation", value: 45 },
  { label: "Structure", value: 75 },
  { label: "Finishing", value: 100 }
];

const inputClass =
  "w-full border border-white/30 bg-black px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:border-white";
const buttonClass =
  "border border-white px-4 py-2 text-xs uppercase tracking-[0.2em] transition hover:bg-white hover:text-black";

function getMilestone(progress: number): string {
  return milestones.find((step) => progress <= step.value)?.label ?? "Finishing";
}

export default function HomePage() {
  const [projectIdInput, setProjectIdInput] = useState("");
  const [loggedProjectId, setLoggedProjectId] = useState("");
  const [projectData, setProjectData] = useState<ProjectRecord | null>(null);
  const [portalError, setPortalError] = useState("");
  const [adminMessage, setAdminMessage] = useState("");
  const [formState, setFormState] = useState({
    projectId: "",
    ownerName: "",
    projectName: "",
    status: 0,
    photoUrl: ""
  });

  const isProjectOwnerAuthenticated = Boolean(projectData);
  const currentProgress = projectData?.status ?? 0;
  const activeMilestone = getMilestone(currentProgress);

  async function fetchProjectById(projectId: string) {
    const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}`, {
      cache: "no-store"
    });
    const payload = (await response.json()) as { project?: ProjectRecord; error?: string };
    if (!response.ok || !payload.project) return null;
    return payload.project;
  }

  useEffect(() => {
    if (!loggedProjectId) return;
    const interval = setInterval(async () => {
      const latest = await fetchProjectById(loggedProjectId);
      if (latest) setProjectData(latest);
    }, 3000);
    return () => clearInterval(interval);
  }, [loggedProjectId]);

  async function handleProjectOwnerLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPortalError("");
    const normalized = projectIdInput.trim().toUpperCase();
    if (!normalized) {
      setPortalError("Please enter a Project ID.");
      return;
    }

    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: normalized })
    });
    const payload = (await response.json()) as { project?: ProjectRecord; error?: string };

    if (!response.ok || !payload.project) {
      setProjectData(null);
      setLoggedProjectId("");
      setPortalError(payload.error ?? "Login failed.");
      return;
    }

    setProjectData(payload.project);
    setLoggedProjectId(payload.project.projectId);
    setProjectIdInput(payload.project.projectId);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAdminMessage("");
    if (!formState.projectId || !formState.ownerName || !formState.projectName || !formState.photoUrl) {
      setAdminMessage("Complete all required fields.");
      return;
    }

    const requestBody = {
      projectId: formState.projectId.trim().toUpperCase(),
      ownerName: formState.ownerName.trim(),
      projectName: formState.projectName.trim(),
      status: Number(formState.status || 0),
      photos: [formState.photoUrl.trim()]
    };

    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });
    const payload = (await response.json()) as { project?: ProjectRecord; error?: string };

    if (!response.ok || !payload.project) {
      setAdminMessage(payload.error ?? "Unable to update project.");
      return;
    }

    if (loggedProjectId && loggedProjectId === payload.project.projectId) {
      setProjectData(payload.project);
    }
    setAdminMessage(`Project ${payload.project.projectId} saved.`);
    setFormState({ projectId: "", ownerName: "", projectName: "", status: 0, photoUrl: "" });
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="fixed left-0 top-0 z-50 w-full border-b border-white/20 bg-black/70 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 border border-white" />
            <span className="reveal-animation text-xs tracking-[0.35em] text-white">RBG</span>
          </div>
          <a
            href="#client-portal"
            className={buttonClass}
          >
            Login
          </a>
        </div>
      </header>

      <section className="relative flex min-h-screen items-center justify-center overflow-hidden border-b border-white/20 px-6 pt-16">
        <div className="absolute inset-0">
          <video
            className="h-full w-full object-cover"
            src="/videos/hero.mp4"
            autoPlay
            muted
            loop
            playsInline
          />
          <div className="absolute inset-0 bg-black/45" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 mx-auto max-w-4xl text-center"
        >
          <h1 className="font-architectural text-5xl font-black tracking-[0.25em] md:text-7xl">
            RBG ENGINEERING
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-sm uppercase tracking-[0.2em] text-white/80 md:text-base">
            Precision in Engineering, Excellence in Execution
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href="#client-portal"
              className="border border-white px-8 py-3 text-xs uppercase tracking-[0.2em] transition hover:bg-white hover:text-black"
            >
              Client Portal
            </a>
            <button className="border border-white px-8 py-3 text-xs uppercase tracking-[0.2em] transition hover:bg-white hover:text-black">
              Our Projects
            </button>
          </div>
        </motion.div>
      </section>

      <section id="client-portal" className="mx-auto max-w-7xl px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mb-10 flex items-center justify-between gap-4 border-b border-white/20 pb-6"
        >
          <div>
            <h2 className="text-xl uppercase tracking-[0.2em]">Client Portal</h2>
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white/60">Project Owners</p>
          </div>
          <span className="border border-white/50 px-3 py-1 text-[10px] uppercase tracking-[0.2em]">
            {isProjectOwnerAuthenticated ? "Protected Access: Active" : "Protected Access: Locked"}
          </span>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="border border-white/20 p-6 lg:col-span-2"
          >
            <form onSubmit={handleProjectOwnerLogin} className="mb-8 space-y-4 border border-white/20 p-4">
              <h3 className="text-xs uppercase tracking-[0.2em] text-white/80">Project Owner Login</h3>
              <input
                value={projectIdInput}
                onChange={(event) => setProjectIdInput(event.target.value)}
                placeholder="Enter Project ID (e.g. RBG-001)"
                className={inputClass}
              />
              <button
                type="submit"
                className="border border-white px-5 py-2 text-xs uppercase tracking-[0.2em] transition hover:bg-white hover:text-black"
              >
                Login with Project ID
              </button>
              {portalError && <p className="text-xs uppercase tracking-[0.16em] text-white/70">{portalError}</p>}
            </form>

            <h3 className="text-sm uppercase tracking-[0.2em] text-white/80">Project Milestones</h3>
            <div className="mt-6 h-2 w-full bg-white/20">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${currentProgress}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="h-full bg-white"
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-3 text-[10px] uppercase tracking-[0.15em] text-white/70">
              {milestones.map((item) => (
                <span key={item.label} className="border border-white/20 px-2 py-1">
                  {item.label}
                </span>
              ))}
            </div>
            <p className="mt-4 text-xs uppercase tracking-[0.2em] text-white/80">
              Current Stage: {activeMilestone} ({currentProgress}%)
            </p>

            <h3 className="mt-10 text-sm uppercase tracking-[0.2em] text-white/80">Project Files</h3>
            <ul className="mt-4 space-y-3">
              {(projectData?.files ?? []).map((file) => (
                <li key={file.name} className="flex items-center justify-between border border-white/20 px-4 py-3">
                  <span className="text-xs uppercase tracking-[0.12em] text-white/80">{file.name}</span>
                  <a
                    href={file.url}
                    className="text-[10px] uppercase tracking-[0.2em] text-white transition hover:text-white/70"
                  >
                    Download
                  </a>
                </li>
              ))}
              {!projectData && (
                <li className="border border-white/20 px-4 py-3 text-xs uppercase tracking-[0.12em] text-white/60">
                  Login to view your project files.
                </li>
              )}
            </ul>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="border border-white/20 p-6"
          >
            <h3 className="text-sm uppercase tracking-[0.2em] text-white/80">Admin Panel</h3>
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white/60">Add New Client</p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <input
                value={formState.projectId}
                onChange={(event) => setFormState((prev) => ({ ...prev, projectId: event.target.value }))}
                placeholder="Project ID"
                className={inputClass}
              />
              <input
                value={formState.ownerName}
                onChange={(event) => setFormState((prev) => ({ ...prev, ownerName: event.target.value }))}
                placeholder="Name"
                className={inputClass}
              />
              <input
                value={formState.projectName}
                onChange={(event) => setFormState((prev) => ({ ...prev, projectName: event.target.value }))}
                placeholder="Project Name"
                className={inputClass}
              />
              <input
                type="number"
                min={0}
                max={100}
                value={formState.status}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, status: Number(event.target.value || 0) }))
                }
                placeholder="Status %"
                className={inputClass}
              />
              <input
                value={formState.photoUrl}
                onChange={(event) => setFormState((prev) => ({ ...prev, photoUrl: event.target.value }))}
                placeholder="Upload Photo (URL)"
                className={inputClass}
              />
              <button type="submit" className="w-full border border-white px-4 py-2 text-xs uppercase tracking-[0.2em] transition hover:bg-white hover:text-black">
                Add New Client
              </button>
              {adminMessage && <p className="text-xs uppercase tracking-[0.16em] text-white/70">{adminMessage}</p>}
            </form>
          </motion.aside>
        </div>
      </section>

      <section className="mx-auto max-w-7xl border-t border-white/20 px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="mb-6 text-sm uppercase tracking-[0.2em] text-white/80">Site Photos</h3>
          <div className="grid gap-5 md:grid-cols-3">
            {(projectData?.photos ?? []).map((photo, index) => (
              <div key={photo} className="project-card group relative h-64 overflow-hidden border border-white/20">
                <img
                  src={photo}
                  alt={`Construction update ${index + 1}`}
                  className="monochrome-image h-full w-full object-cover"
                />
                <div className="absolute inset-0 border border-white/0 transition group-hover:border-white/40" />
              </div>
            ))}
            {!projectData && (
              <div className="col-span-full border border-white/20 px-4 py-10 text-center text-xs uppercase tracking-[0.16em] text-white/60">
                Login to view your latest construction updates.
              </div>
            )}
          </div>
        </motion.div>
      </section>
    </main>
  );
}