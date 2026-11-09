import { notFound } from "next/navigation";
import { loadHub } from "@/lib/content";
import { Hub } from "@/components/hub";
export const dynamicParams = false;
export function generateStaticParams(){const data=loadHub();return [{path:[]},{path:['sources']},{path:['search']},...data.projects.flatMap(p=>[{path:['projects',p.id]},{path:['projects',p.id,'sources']},{path:['projects',p.id,'decisions']}]),...data.documents.map(d=>({path:['projects',d.projectId,d.id]}))];}
export default async function Page({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}) {
  const { path = [] } = await params;
  const data = loadHub();
  const valid =
    path.length === 0 ||
    (path.length === 1 && ["sources", "search"].includes(path[0])) ||
    (path[0] === "projects" &&
      path.length >= 2 &&
      path.length <= 3 &&
      data.projects.some((p) => p.id === path[1]) &&
      (!path[2] ||
        ["sources", "decisions"].includes(path[2]) ||
        data.documents.some(
          (d) => d.projectId === path[1] && d.id === path[2],
        )));
  if (!valid) notFound();
  return <Hub data={data} path={path} />;
}
