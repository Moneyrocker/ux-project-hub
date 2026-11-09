import type { HubData } from "./schema";
export function searchHub(data: HubData, query: string, projectId?: string) {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  const docs = data.documents
    .filter((d) => !projectId || d.projectId === projectId)
    .map((d) => ({
      id: d.projectId + "/" + d.id,
      title: d.title,
      summary: d.summary,
      text: [d.title, d.summary, d.tags.join(" "), d.body].join(" "),
      projectId: d.projectId,
      href: `/projects/${d.projectId}/${d.id}`,
      kind: "文档",
    }));
  const sources = data.sources
    .filter((s) => !projectId || s.projectIds.includes(projectId))
    .map((s) => ({
      id: s.id,
      title: s.title,
      summary: s.note,
      text: [s.title, s.note, s.topics.join(" ")].join(" "),
      projectId: s.projectIds[0] || "",
      href: `/sources#${s.id}`,
      kind: "来源",
    }));
  return [...docs, ...sources]
    .filter((i) => terms.every((t) => i.text.toLocaleLowerCase().includes(t)))
    .sort(
      (a, b) =>
        Number(b.title.toLowerCase().includes(query.toLowerCase())) -
        Number(a.title.toLowerCase().includes(query.toLowerCase())),
    );
}
