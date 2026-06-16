// Client-side fetch helpers for project API routes
import type { Project, ProjectState, DocumentRef } from "./types";

const API = "/api/projects";

export async function fetchProjects(): Promise<Project[]> {
  const res = await fetch(API);
  const data = await res.json();
  return data.projects ?? [];
}

export async function fetchProject(id: string): Promise<ProjectState | null> {
  const res = await fetch(`${API}/${encodeURIComponent(id)}`);
  if (!res.ok) return null;
  return res.json();
}

export async function updateProjectState(
  id: string,
  updates: Partial<ProjectState>
): Promise<ProjectState> {
  const res = await fetch(`${API}/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  return res.json();
}

export async function createProject(data: {
  name: string;
}): Promise<ProjectState> {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function scanDocuments(
  id: string,
  workflowId?: string
): Promise<{ documents: DocumentRef[]; total: number }> {
  const url = workflowId
    ? `${API}/${encodeURIComponent(id)}/documents?workflow=${encodeURIComponent(workflowId)}`
    : `${API}/${encodeURIComponent(id)}/documents`;
  const res = await fetch(url);
  return res.json();
}

export async function uploadDocument(
  id: string,
  workflowId: string,
  file: File
): Promise<{ success: boolean; filename: string }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("workflow", workflowId);
  const res = await fetch(`${API}/${encodeURIComponent(id)}/documents`, {
    method: "POST",
    body: formData,
  });
  return res.json();
}
