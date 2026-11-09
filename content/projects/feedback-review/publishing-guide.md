---
{
  "id": "publishing-guide",
  "title": "公开版本发布指南",
  "projectId": "feedback-review",
  "category": "design",
  "summary": "原创通用知识示例；不代表真实项目成果。",
  "status": "working-draft",
  "updatedAt": "2026-11-09",
  "sources": [
    "shadcn-sidebar",
    "next-docs",
    "pages-docs"
  ],
  "tags": [
    "公开示例",
    "UX",
    "Service"
  ],
  "provenance": "原创通用示例 · 2026-11-09",
  "sensitivity": "public"
}
---

## 静态站点

页面在构建时生成，通过 GitHub Pages 提供访问，不需要数据库。

## 更新流程

编辑公开 Markdown 或 JSON，推送 main，GitHub Actions 会校验、构建并发布。

## 发布前检查

只提交明确允许公开的内容。账号密钥、个人信息及未经授权的工作资料不能进入仓库或构建产物。
