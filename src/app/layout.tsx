import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "UX Project Hub",
  description: "UX 项目知识工作台 · 公开安全示例",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
