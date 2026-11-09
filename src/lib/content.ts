import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import {
  projectSchema,
  sourceSchema,
  documentSchema,
  decisionSchema,
  type HubData,
} from "./schema";
export function loadHub(): HubData {
  const root = process.cwd();
  const read = (file: string) =>
    JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
  const projects = z.array(projectSchema).parse(read("data/projects.json"));
  const sources = z.array(sourceSchema).parse(read("data/sources.json"));
  const decisions = z.array(decisionSchema).parse(read("data/decisions.json"));
  const documents = projects.flatMap((p) => {
    const dir = path.join(root, "content/projects", p.id);
    if (!fs.existsSync(dir)) return [];
    return fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".md"))
      .sort()
      .map((f) => {
        const { data, content } = matter(
          fs.readFileSync(path.join(dir, f), "utf8"),
        );
        const meta = documentSchema.parse(data);
        if (
          meta.projectId !== p.id ||
          !p.categories.some((c) => c.id === meta.category)
        )
          throw new Error(`Invalid project/category: ${f}`);
        return { ...meta, body: content };
      });
  });
  const ids = new Set(sources.map((s) => s.id));
  const projectIds = new Set(projects.map((p) => p.id));
  for (const list of [projects, sources, decisions])
    if (new Set(list.map((x) => x.id)).size !== list.length)
      throw new Error("Duplicate ID");
  if (
    new Set(documents.map((d) => d.projectId + "/" + d.id)).size !==
    documents.length
  )
    throw new Error("Duplicate document");
  for (const item of [...documents, ...decisions])
    for (const id of item.sources)
      if (!ids.has(id)) throw new Error(`Unknown source ${id}`);
  for (const source of sources)
    for (const p of source.projectIds)
      if (!projectIds.has(p)) throw new Error(`Unknown project ${p}`);
  for (const p of projects)
    for (const id of p.relatedProjectIds)
      if (!projectIds.has(id)) throw new Error(`Unknown related project ${id}`);
  return { projects, sources, documents, decisions };
}
