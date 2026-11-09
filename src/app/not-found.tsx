import Link from "next/link";
export default function NotFound() {
  return (
    <main className="empty">
      <h1>没有找到这篇内容</h1>
      <p>项目或文档可能已移动。</p>
      <Link href="/">返回所有项目</Link>
    </main>
  );
}
