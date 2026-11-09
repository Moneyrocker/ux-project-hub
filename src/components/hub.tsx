"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  FileText,
  FolderOpen,
  Layers,
  Search,
  ShieldCheck,
  LayoutGrid,
  Plus,
  Link2,
  Clock3,
  ArrowRight,
} from "lucide-react";
import {
  SidebarProvider,
  useSidebar,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { searchHub } from "@/lib/search";
import type { HubData, Project, Source, Document } from "@/lib/schema";
const labels: Record<string, string> = {
  "working-draft": "讨论中",
  "conversation-summary": "历史摘要",
  "needs-verification": "待验证",
  "verified-source": "已核验",
  "index-only": "仅索引",
  "summary-reviewed": "摘要已整理 · 原文待核验",
  "requires-local-import": "待本地导入",
  "separate-project": "历史独立项目",
};
function Status({ value }: { value: string }) {
  return (
    <Badge variant="outline" className={"status status-" + value}>
      <span className="status-dot" />
      {labels[value] || value}
    </Badge>
  );
}
function SourceCards({ sources, data }: { sources: Source[]; data: HubData }) {
  return (
    <div className="source-list">
      {sources.length === 0 && (
        <div className="blank">暂无来源。请先补充原始资料索引。</div>
      )}
      {sources.map((s) => (
        <article className="source-card" key={s.id} id={s.id}>
          <div className="source-icon">
            <FileText size={18} />
          </div>
          <div className="source-info">
            <div className="source-title">
              {s.url ? (
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.title}
                  <ArrowUpRight size={14} />
                </a>
              ) : (
                <strong>{s.title}</strong>
              )}
            </div>
            <p>{s.note || "已保留原始链接；尚未获取原文内容。"}</p>
            <div className="source-meta">
              <span>
                {s.type.toUpperCase()} · {s.source}
              </span>
              <Status value={s.status} />
            </div>
            <details>
              <summary>来源详情与关联内容</summary>
              <dl className="metadata">
                <dt>主题</dt>
                <dd>{s.topics.join("、")}</dd>
                <dt>原件更新</dt>
                <dd>{s.updatedAt || "未核验"}</dd>
                <dt>索引收录</dt>
                <dd>{s.indexedAt}</dd>
                <dt>敏感级别</dt>
                <dd>{s.sensitivity}</dd>
                <dt>访问状态</dt>
                <dd>未在本次核验；外链可能需要原平台授权</dd>
                <dt>所属项目</dt>
                <dd>
                  {s.projectIds.map((id) => (
                    <Link key={id} href={"/projects/" + id}>
                      {data.projects.find((p) => p.id === id)?.name}{" "}
                    </Link>
                  ))}
                </dd>
                <dt>关联文档</dt>
                <dd>
                  {data.documents
                    .filter((d) => d.sources.includes(s.id))
                    .map((d) => (
                      <Link
                        key={d.projectId + d.id}
                        href={`/projects/${d.projectId}/${d.id}`}
                      >
                        {d.title}；
                      </Link>
                    ))}
                </dd>
              </dl>
            </details>
            {!s.url && (
              <div className="missing">
                {s.status === "separate-project"
                  ? "属于旧项目，未获取原件。"
                  : "尚未提供可验证链接或本地文件，当前无法打开。"}
              </div>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
function Sources({ data, project }: { data: HubData; project?: Project }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const items = data.sources.filter(
    (s) =>
      (!project || s.projectIds.includes(project.id)) &&
      (status === "all" || status === s.status) &&
      [s.title, s.note].join(" ").toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <div className="eyebrow">SOURCE LIBRARY</div>
      <h1>原始资料库</h1>
      <p className="lead">保留来源与证据边界，让每一条结论都能回到原文。</p>
      <div className="notice">
        <ShieldCheck size={17} />
        <span>
          这里仅收录公开的技术文档与参考资源。
        </span>
      </div>
      <div className="filters">
        <div className="input-wrap">
          <Search size={16} />
          <input
            aria-label="筛选来源"
            placeholder="筛选资料标题、说明…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          aria-label="来源状态"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">全部状态</option>
          {[
            "summary-reviewed",
            "index-only",
            "requires-local-import",
            "separate-project",
          ].map((s) => (
            <option key={s} value={s}>
              {labels[s]}
            </option>
          ))}
        </select>
        <span className="muted">{items.length} 条资料</span>
      </div>
      <SourceCards sources={items} data={data} />
    </>
  );
}
function DocumentView({ doc, data }: { doc: Document; data: HubData }) {
  const headings = doc.body
    .split("\n")
    .filter((l) => l.startsWith("## "))
    .map((l) => l.slice(3));
  return (
    <div className="reading-layout">
      <div className="reading-main">
        <div className="eyebrow">
          {
            data.projects
              .find((p) => p.id === doc.projectId)
              ?.categories.find((c) => c.id === doc.category)?.title
          }
        </div>
        <h1>{doc.title}</h1>
        <p className="lead">{doc.summary}</p>
        <div className="document-meta">
          <Status value={doc.status} />
          <span>整理于 {doc.updatedAt}</span>
          <span>{doc.sources.length} 个来源</span>
        </div>
        <div className="notice">
          <BookOpen size={17} />
          <span>
            来源：{doc.provenance}
            。本页为公开示例与通用方法说明，不包含真实业务研究结果。
          </span>
        </div>
        <article className="prose">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h2: ({ children }) => <h2 id={String(children)}>{children}</h2>,
              a: ({ href, children }) => (
                <a href={href} target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              ),
            }}
          >
            {doc.body}
          </ReactMarkdown>
        </article>
        <section className="doc-sources">
          <div className="section-title">
            <h2>原始来源</h2>
            <span>{doc.sources.length}</span>
          </div>
          <SourceCards
            sources={data.sources.filter((s) => doc.sources.includes(s.id))}
            data={data}
          />
        </section>
      </div>
      <aside className="toc">
        <p>本页目录</p>
        {headings.map((h, i) => (
          <a key={i} href={"#" + h}>
            {h}
          </a>
        ))}
        <div className="toc-note">
          来源与结论分开保存
          <br />
          保留每个阶段的判断
        </div>
      </aside>
    </div>
  );
}
function Decisions({ data, project }: { data: HubData; project: Project }) {
  const items = data.decisions.filter((d) => d.projectId === project.id);
  return (
    <>
      <div className="eyebrow">DECISION LOG</div>
      <h1>会议纪要与决策</h1>
      <p className="lead">
        按阶段保留结论、依据与后续动作。未明确的日期与参与方留空。
      </p>
      {items.length === 0 ? (
        <div className="blank">
          <Clock3 />
          <h2>暂无正式决策记录</h2>
          <p>当前资料未提供可核验的会议纪要；请先查看待确认事项。</p>
          <Link href={`/projects/${project.id}/questions`}>
            查看待确认事项 →
          </Link>
        </div>
      ) : (
        items.map((d) => (
          <article className="decision" key={d.id}>
            <div className="document-meta">
              <Badge variant="outline">{d.status}</Badge>
              <span>
                {d.date || "原始日期待核验"} · 收录 {d.recordedAt}
              </span>
            </div>
            <h2>{d.conclusion}</h2>
            <p>{d.basis}</p>
            <p>
              <strong>后续动作：</strong>
              {d.nextAction}
            </p>
            <SourceCards
              sources={data.sources.filter((s) => d.sources.includes(s.id))}
              data={data}
            />
          </article>
        ))
      )}
    </>
  );
}
function Overview({ data, project }: { data: HubData; project: Project }) {
  const docs = data.documents.filter((d) => d.projectId === project.id);
  const sources = data.sources.filter((s) => s.projectIds.includes(project.id));
  return (
    <>
      <div className="eyebrow">PROJECT WORKSPACE</div>
      <div className="project-heading">
        <div className="project-monogram">{project.short}</div>
        <div>
          <h1>{project.name}</h1>
          <p className="muted">{project.subtitle}</p>
        </div>
        <Badge variant="outline">{project.stage}</Badge>
      </div>
      <p className="lead">{project.summary}</p>
      <div className="project-facts">
        <span>
          <BookOpen size={16} />
          {docs.length} 篇知识文档
        </span>
        <Link href={`/projects/${project.id}/sources`}>
          <Link2 size={16} />
          {sources.length} 条原始资料
        </Link>
        <span>
          <Clock3 size={16} />
          内容整理{" "}
          {docs
            .map((d) => d.updatedAt)
            .sort()
            .at(-1) || "待补资料"}
        </span>
      </div>
      <div className="notice">
        <ShieldCheck size={17} />
        <span>
          知识页保留来源与状态，讨论与待验证内容需结合原文阅读。项目阶段不代表已确认的业务最新进度。
        </span>
      </div>
      <div className="section-title">
        <h2>项目知识</h2>
        <span>{docs.length} 篇</span>
      </div>
      <div className="document-list">
        {docs.map((d) => (
          <Link
            className="document-row"
            key={d.id}
            href={`/projects/${project.id}/${d.id}`}
          >
            <FileText size={19} />
            <div>
              <strong>{d.title}</strong>
              <p>{d.summary}</p>
            </div>
            <Status value={d.status} />
            <ChevronRight size={16} />
          </Link>
        ))}
      </div>
      <div className="two-cols">
        <section>
          <div className="section-title">
            <h2>关联项目</h2>
            <span>跨项目知识</span>
          </div>
          {project.relatedProjectIds.map((id) => {
            const p = data.projects.find((p) => p.id === id)!;
            return (
              <Link className="related" key={id} href={"/projects/" + id}>
                <span className="mini-monogram">{p.short}</span>
                <div>
                  <strong>{p.name}</strong>
                  <p>{p.subtitle}</p>
                </div>
                <ArrowUpRight size={16} />
              </Link>
            );
          })}
        </section>
        <section>
          <div className="section-title">
            <h2>接下来</h2>
          </div>
          {docs.some((d) => d.id === "questions") && (
            <Link
              className="action-card"
              href={`/projects/${project.id}/questions`}
            >
              <Clock3 size={20} />
              <strong>核对工作中与待确认事项</strong>
              <ArrowRight size={17} />
            </Link>
          )}
          <Link
            className="action-card"
            href={`/projects/${project.id}/sources`}
          >
            <FolderOpen size={20} />
            <strong>回到原始资料</strong>
            <ArrowRight size={17} />
          </Link>
        </section>
      </div>
    </>
  );
}
function Home({ data, onAdd }: { data: HubData; onAdd: () => void }) {
  return (
    <>
      <div className="eyebrow">YOUR KNOWLEDGE WORKSPACE</div>
      <div className="title-row">
        <h1>所有项目</h1>
        <button className="outline-button" onClick={onAdd}>
          <Plus size={15} />
          新增项目
        </button>
      </div>
      <p className="lead">
        把研究、业务与设计连接起来。
        <br />
        每个项目都有自己的知识空间，每条结论都有来源。
      </p>
      <div className="home-summary">
        <span>
          <Layers size={16} />
          {data.projects.length} 个项目
        </span>
        <span>
          <FileText size={16} />
          {data.documents.length} 篇文档
        </span>
        <span>
          <Link2 size={16} />
          {data.sources.length} 条来源
        </span>
        <span className="local-tag">
          <span />
          公开示例空间
        </span>
      </div>
      <div className="section-title">
        <h2>项目空间</h2>
        <span>首期重点 · UX Research</span>
      </div>
      <div className="project-grid">
        {data.projects.map((p, i) => (
          <Link
            href={"/projects/" + p.id}
            className={"project-card " + (i === 0 ? "featured" : "")}
            key={p.id}
          >
            <div className="card-top">
              <div className="mini-monogram">{p.short}</div>
              <Badge variant="outline">{p.stage}</Badge>
              <ArrowUpRight size={18} />
            </div>
            <h2>{p.name}</h2>
            <p>{p.summary}</p>
            <footer>
              <span>
                {data.documents.filter((d) => d.projectId === p.id).length}{" "}
                篇文档
              </span>
              <span>
                {data.sources.filter((s) => s.projectIds.includes(p.id)).length}{" "}
                条来源
              </span>
              <ArrowRight size={16} />
            </footer>
          </Link>
        ))}
      </div>
      <div className="section-title">
        <h2>从知识开始</h2>
        <span>重点阅读</span>
      </div>
      <div className="document-list">
        {data.documents
          .filter((d) =>
            ["research-methods", "knowledge-structure", "publishing-guide"].includes(d.id),
          )
          .map((d) => (
            <Link
              className="document-row"
              key={d.id}
              href={`/projects/${d.projectId}/${d.id}`}
            >
              <FileText size={18} />
              <div>
                <strong>{d.title}</strong>
                <p>
                  {data.projects.find((p) => p.id === d.projectId)?.name} ·{" "}
                  {d.summary}
                </p>
              </div>
              <ChevronRight size={16} />
            </Link>
          ))}
      </div>
    </>
  );
}
function SidebarLink(props: React.ComponentProps<typeof Link>) {
  return <Link {...props} />;
}
function CloseSidebarOnNavigate() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  useEffect(() => {
    const timer = setTimeout(() => setOpenMobile(false), 0);
    return () => clearTimeout(timer);
  }, [pathname, setOpenMobile]);
  return null;
}
function ProjectSwitcher({
  projects,
  value,
}: {
  projects: Project[];
  value: string;
}) {
  const router = useRouter();
  return (
    <select
      id="project-switcher"
      className="project-select"
      value={value}
      onChange={(e) => {
        const href = e.target.value ? "/projects/" + e.target.value : "/";
        router.push(href);
      }}
    >
      <option value="">所有项目</option>
      {projects.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </select>
  );
}
export function Hub({ data, path }: { data: HubData; path: string[] }) {
  const project =
    path[0] === "projects"
      ? data.projects.find((p) => p.id === path[1])
      : undefined;
  const doc = data.documents.find(
    (d) => d.projectId === project?.id && d.id === path[2],
  );
  const [searchOpen, setSearchOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState("all");
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, []);
  const results = searchHub(data, query, scope === "all" ? undefined : scope);
  const active = (href: string) => "/" + path.join("/") === href;
  const nav = (href: string, title: string, Icon = FileText) => (
    <SidebarMenuItem key={href}>
      <SidebarMenuButton asChild isActive={active(href)}>
        <SidebarLink href={href}>
          <Icon />
          <span>{title}</span>
        </SidebarLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
  return (
    <SidebarProvider>
      <CloseSidebarOnNavigate />
      <Sidebar collapsible="offcanvas">
        <SidebarHeader>
          <SidebarLink href="/" className="brand">
            <div className="brand-icon">
              <Layers size={20} />
            </div>
            <span>
              UX Project Hub<small>PERSONAL WORKSPACE</small>
            </span>
          </SidebarLink>
          <label className="sr-only" htmlFor="project-switcher">
            切换项目
          </label>
          <ProjectSwitcher projects={data.projects} value={project?.id || ""} />
          <button
            className="search-trigger"
            onClick={() => setSearchOpen(true)}
          >
            <Search size={15} />
            <span>搜索知识与资料</span>
            <kbd>⌘ K</kbd>
          </button>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {nav("/", "所有项目", LayoutGrid)}
              {nav("/sources", "全部资料", FolderOpen)}
            </SidebarMenu>
          </SidebarGroup>
          {project ? (
            <>
              <SidebarGroup>
                <SidebarGroupLabel>{project.name}</SidebarGroupLabel>
                <SidebarMenu>
                  {nav("/projects/" + project.id, "项目首页", Layers)}
                </SidebarMenu>
                {project.categories.map((c) => (
                  <details className="nav-tree" key={c.id} open>
                    <summary>
                      <ChevronRight size={13} />
                      {c.title}
                      <span>
                        {
                          data.documents.filter(
                            (d) =>
                              d.projectId === project.id && d.category === c.id,
                          ).length
                        }
                      </span>
                    </summary>
                    <SidebarMenu>
                      {data.documents
                        .filter(
                          (d) =>
                            d.projectId === project.id && d.category === c.id,
                        )
                        .map((d) =>
                          nav(`/projects/${project.id}/${d.id}`, d.title),
                        )}
                    </SidebarMenu>
                  </details>
                ))}
                <SidebarMenu>
                  {nav(
                    `/projects/${project.id}/decisions`,
                    "阶段决策记录",
                    Clock3,
                  )}
                  {nav(
                    `/projects/${project.id}/sources`,
                    "原始资料库",
                    FolderOpen,
                  )}
                </SidebarMenu>
              </SidebarGroup>
            </>
          ) : (
            <SidebarGroup>
              <SidebarGroupLabel>
                项目空间 <span className="ml-auto">{data.projects.length}</span>
              </SidebarGroupLabel>
              <SidebarMenu>
                {data.projects.map((p) =>
                  nav("/projects/" + p.id, p.name, BookOpen),
                )}
              </SidebarMenu>
            </SidebarGroup>
          )}
        </SidebarContent>
        <SidebarFooter>
          <button className="footer-add" onClick={() => setAddOpen(true)}>
            <Plus size={16} />
            新增项目
          </button>
          <div className="sidebar-bottom">
            <span className="avatar">M</span>
            <div>
              我的知识工作台<small>公开版本 · v0.1</small>
            </div>
            <ShieldCheck size={16} />
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="topbar">
          <SidebarTrigger aria-label="展开或收起侧栏" />
          <span className="divider" />
          <nav aria-label="面包屑">
            <Link href="/">工作空间</Link>
            <ChevronRight size={13} />
            {project ? (
              <>
                <Link href={"/projects/" + project.id}>{project.name}</Link>
                {path[2] && (
                  <>
                    <ChevronRight size={13} />
                    <span>
                      {doc?.title ||
                        (path[2] === "sources" ? "原始资料库" : "决策记录")}
                    </span>
                  </>
                )}
              </>
            ) : (
              <span>{path[0] === "sources" ? "原始资料库" : "所有项目"}</span>
            )}
          </nav>
          <div className="topbar-right">
            <span className="local-tag">
              <span />
              公开示例
            </span>
            <button aria-label="打开搜索" onClick={() => setSearchOpen(true)}>
              <Search size={17} />
            </button>
          </div>
        </header>
        <main className={"page " + (doc ? "reading-page" : "")}>
          {path[0] === "sources" ? (
            <Sources data={data} />
          ) : project ? (
            path[2] === "sources" ? (
              <Sources key={project.id} data={data} project={project} />
            ) : path[2] === "decisions" ? (
              <Decisions data={data} project={project} />
            ) : doc ? (
              <DocumentView doc={doc} data={data} />
            ) : (
              <Overview data={data} project={project} />
            )
          ) : path[0] === "search" ? (
            <>
              <h1>搜索</h1>
              <button
                className="outline-button"
                onClick={() => setSearchOpen(true)}
              >
                打开全局搜索 ⌘ K
              </button>
            </>
          ) : (
            <Home data={data} onAdd={() => setAddOpen(true)} />
          )}
          <div className="page-footer">
            UX Project Hub <span>公开知识 · 可追溯来源 · 持续整理</span>
          </div>
        </main>
      </SidebarInset>
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="search-dialog">
          <DialogTitle>搜索知识与资料</DialogTitle>
          <DialogDescription>
            搜索标题、摘要、标签与正文；支持全局或单项目范围。
          </DialogDescription>
          <div className="filters">
            <div className="input-wrap">
              <Search size={17} />
              <input
                autoFocus
                aria-label="搜索关键词"
                placeholder="试试 Service、竞品、四类任务…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <select
              aria-label="搜索范围"
              value={scope}
              onChange={(e) => setScope(e.target.value)}
            >
              <option value="all">所有项目</option>
              {data.projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="search-results">
            {!query.trim() ? (
              <p className="blank">输入关键词开始搜索</p>
            ) : results.length === 0 ? (
              <p className="blank">未找到相关内容，试试其他关键词。</p>
            ) : (
              <>
                <p className="muted result-count">{results.length} 条结果</p>
                {results.map((i) => (
                  <Link
                    key={i.kind + i.id}
                    href={i.href}
                    onClick={() => setSearchOpen(false)}
                  >
                    <FileText size={17} />
                    <div>
                      <strong>{i.title}</strong>
                      <p>{i.summary || "原始来源索引"}</p>
                      <small>
                        {i.kind} ·{" "}
                        {data.projects.find((p) => p.id === i.projectId)
                          ?.name || "历史资料"}
                      </small>
                    </div>
                    <ChevronRight size={15} />
                  </Link>
                ))}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogTitle>新增项目</DialogTitle>
          <DialogDescription>
            在项目目录运行以下命令。创建后刷新页面，项目会自动出现在切换器中。
          </DialogDescription>
          <pre className="command">
            {'npm run project:add -- my-project \"项目名称\"'}
          </pre>
          <p className="muted">
            脚本生成独立知识目录、默认概览和项目索引。也可以直接让 Codex
            帮你创建并整理资料。
          </p>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
