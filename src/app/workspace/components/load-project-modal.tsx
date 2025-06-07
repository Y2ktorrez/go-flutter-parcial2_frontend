"use client";
import { useEffect, useState } from "react";
import { X, Loader2, FolderOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import { API_BASE_URL } from "@/lib/auth";
import { useRouter } from "next/navigation"; 

interface LoadModalProps {
  open: boolean;
  onClose: () => void;
}

interface ProjectSummary {
  ID: string;
  title: string;
  description: string;
  updated_at: string;
}

export default function LoadProjectModal({ open, onClose }: LoadModalProps) {
  const { token } = useAuth();
  const router = useRouter();

  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log(projects)

  /* -------- cargar lista cuando se abre -------- */
  useEffect(() => {
    if (!open) return;
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/projects/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(await res.text());
        setProjects(await res.json());
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [open, token]);

  /* -------- cargar proyecto individual -------- */
  const handleLoad = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();              // ← contiene title, content, etc.
      onClose();
      router.push(`/workspaces/${data.ID}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.2 }}
            className="w-full max-w-lg relative"
          >
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <Button variant="ghost" size="icon"
                  className="absolute right-2 top-2 text-gray-400 hover:text-white"
                  onClick={onClose} disabled={loading}>
                  <X className="h-4 w-4" />
                </Button>
                <CardTitle className="text-center text-white">
                  Cargar proyecto
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {loading && (
                  <div className="flex justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                )}

                {!loading && projects.length === 0 && (
                  <p className="text-center text-gray-400">
                    No tienes proyectos guardados.
                  </p>
                )}

                {!loading && projects.map((p) => (
                  <div key={p.ID}
                       className="flex items-center justify-between gap-4 rounded-lg border border-zinc-700 p-3 hover:bg-zinc-800/60">
                    <div className="flex-1">
                      <p className="text-white font-medium">{p.title}</p>
                      <p className="text-xs text-gray-400 line-clamp-2">{p.description}</p>
                      <p className="text-[10px] text-gray-500 mt-1">
                        Actualizado: {new Date(p.updated_at).toLocaleString()}
                      </p>
                    </div>
                    <Button size="icon" onClick={() => {
                      handleLoad(p.ID)
                    }}>
                      <FolderOpen className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
