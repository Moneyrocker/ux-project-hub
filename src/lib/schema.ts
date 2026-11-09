import { z } from "zod";
export const categorySchema = z.object({ id: z.string(), title: z.string() });
export const projectSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string(),
  short: z.string(),
  subtitle: z.string(),
  summary: z.string(),
  stage: z.string(),
  categories: z.array(categorySchema),
  relatedProjectIds: z.array(z.string()),
});
export const sourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  projectIds: z.array(z.string()),
  type: z.string(),
  url: z
    .url()
    .refine(
      (value) => /^https?:\/\//.test(value),
      "Only HTTP(S) source URLs are allowed",
    )
    .nullable(),
  source: z.string(),
  status: z.enum([
    "index-only",
    "summary-reviewed",
    "requires-local-import",
    "separate-project",
    "verified-source",
  ]),
  note: z.string(),
  updatedAt: z.string().nullable(),
  indexedAt: z.string(),
  sensitivity: z.string(),
  topics: z.array(z.string()),
  localPath: z.string().nullable(),
  relatedDocuments: z.array(z.string()),
  accessStatus: z.string(),
});
export const documentSchema = z.object({
  id: z.string(),
  title: z.string(),
  projectId: z.string(),
  category: z.string(),
  summary: z.string(),
  status: z.enum([
    "verified-source",
    "working-draft",
    "conversation-summary",
    "index-only",
    "needs-verification",
  ]),
  updatedAt: z.string(),
  sources: z.array(z.string()),
  tags: z.array(z.string()),
  provenance: z.string(),
  sensitivity: z.string(),
});
export const decisionSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  date: z.string().nullable(),
  recordedAt: z.string(),
  conclusion: z.string(),
  basis: z.string(),
  participants: z.array(z.string()),
  status: z.enum(["讨论中", "暂定", "已确认", "已废止"]),
  sources: z.array(z.string()),
  nextAction: z.string(),
  supersedes: z.string().nullable(),
});
export type Project = z.infer<typeof projectSchema>;
export type Source = z.infer<typeof sourceSchema>;
export type Document = z.infer<typeof documentSchema> & { body: string };
export type Decision = z.infer<typeof decisionSchema>;
export type HubData = {
  projects: Project[];
  sources: Source[];
  documents: Document[];
  decisions: Decision[];
};
