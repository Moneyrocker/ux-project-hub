# UX Project Hub · Public Edition

Next.js、TypeScript、Tailwind CSS 与 shadcn/ui 的多项目知识工作台。这里仅包含原创通用示例和公开技术文档链接，没有真实业务数据。

## 本地开发

Node.js 24；`npm ci` 后运行 `npm run dev`，访问 http://127.0.0.1:3000/ux-project-hub/ 。

## 发布与更新

修改 `content/projects/` Markdown 和 `data/` JSON，运行 `npm run content:check`、`npm run lint` 和 `npm run build`，审查通过后推送 main。GitHub Actions 自动构建 out 并发布至 GitHub Pages。

`next.config.ts` 配置 output: export、basePath: /ux-project-hub、trailingSlash: true 和非优化图片。路由通过 generateStaticParams 在构建时枚举，所以深层页面可直接访问和刷新。

新增项目：`npm run project:add -- my-project "项目名称"`，将生成文档的 sensitivity 明确改为 public 后运行校验。只提交已确认可公开的材料；自动扫描只作为补充检查，不能代替内容授权审查。

这是公开示例空间。不要在此仓库提交内部工作材料、私人链接、密钥、个人信息或未经授权的原件。
