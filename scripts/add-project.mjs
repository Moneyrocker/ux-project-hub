import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [id, name] = process.argv.slice(2);
if (!id || !name || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
  console.error('Usage: npm run project:add -- my-project "项目名称"');
  process.exit(1);
}
const file = path.join(root, "data/projects.json");
const projects = JSON.parse(fs.readFileSync(file, "utf8"));
const dir = path.join(root, "content/projects", id);
if (projects.some((p) => p.id === id) || fs.existsSync(dir)) {
  console.error("项目已存在；未修改任何文件");
  process.exit(1);
}
const date = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Shanghai",
}).format(new Date());
const project = {
  id,
  name,
  short: id.slice(0, 2).toUpperCase(),
  subtitle: "新项目",
  summary: "待补资料。",
  stage: "待补资料",
  categories: projects[0].categories,
  relatedProjectIds: [],
};
const meta = {
  id: "overview",
  title: name + " · 项目概览",
  projectId: id,
  category: "overview",
  summary: "待补资料。",
  status: "needs-verification",
  updatedAt: date,
  sources: [],
  tags: [],
  provenance: "本地新增项目模板",
  sensitivity: "internal",
};
fs.mkdirSync(dir, { recursive: true });
try {
  fs.writeFileSync(
    path.join(dir, "overview.md"),
    "---\n" +
      JSON.stringify(meta, null, 2) +
      "\n---\n\n## 待补资料\n\n请补充业务背景、原始来源和已确认的结论。\n",
    { flag: "wx" },
  );
  fs.writeFileSync(
    file + ".tmp",
    JSON.stringify([...projects, project], null, 2) + "\n",
  );
  fs.renameSync(file + ".tmp", file);
  console.log("已创建 " + id + "；刷新页面即可在项目切换器中看到。");
} catch (error) {
  fs.rmSync(dir, { recursive: true, force: true });
  throw error;
}
