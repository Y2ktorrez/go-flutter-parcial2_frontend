"use client";
import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDesignerWorkspace } from "@/hooks/use-designer-workspace";
import { useAuth } from "@/hooks/use-auth";
import { API_BASE_URL } from "@/lib/auth";

interface SaveProjectModalProps {
  open: boolean;
  onClose: () => void;
  /*  Si vas a permitir editar un proyecto existente,
      pasa { id, title, description } como prop y ajusta el método
      POST ► PUT según corresponda. */
}

export default function SaveProjectModal({ open, onClose }: SaveProjectModalProps) {
  const { exportProject } = useDesignerWorkspace();
  const { token } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* -------- validaciones muy simples -------- */
  const validate = () => {
    if (!title.trim()) return "El título es obligatorio.";
    if (title.trim().length < 3) return "El título debe tener al menos 3 caracteres.";
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) return setError(err);

    setError(null);
    setLoading(true);
    try {
      const body = {
        title: title.trim(),
        description: description.trim(),
        content: exportProject(), 
      };

      const res = await fetch(`${API_BASE_URL}/projects/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Error al guardar el proyecto.");
      }

      /* éxito => podrías mostrar un toast */
      onClose();
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md relative"
          >
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 text-gray-400 hover:text-white"
                  onClick={onClose}
                  disabled={loading}
                >
                  <X className="h-4 w-4" />
                </Button>
                <CardTitle className="text-center text-white">
                  Guardar proyecto
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div>
                  <label className="block mb-1 text-sm text-gray-300">
                    Título
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={loading}
                    placeholder="Nombre del proyecto"
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm text-gray-300">
                    Descripción (opcional)
                  </label>
                  <Textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={loading}
                    placeholder="Breve descripción"
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-400"
                  />
                </div>

                <Button
                  onClick={handleSave}
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando…
                    </>
                  ) : (
                    "Guardar"
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
