import { useAuth } from "@/hooks/use-auth";
import DesignerWebsocket from "./components/designer-websocket";
import { redirect } from "next/navigation";
import { API_BASE_URL } from "@/lib/auth";

export default async function page({ params }: { params: { projectId: string } }) {
  const { isAuthenticated, token } = useAuth()
  if (!isAuthenticated()) redirect("/login");

  const res = await fetch(
    `${API_BASE_URL}/projects/${params.projectId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }
  );

  let project: any = null;
  if (res.ok) {
    project = await res.json();
  } else if (res.status !== 404) {
    throw new Error(`Error ${res.status} cargando el proyecto`);
  }

  return <DesignerWebsocket projectId={params.projectId} />
}