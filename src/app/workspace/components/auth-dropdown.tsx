"use client";
import { useRef, useState, useEffect } from "react";
import {
  ChevronDown,
  LogIn,
  UserPlus,
  LogOut,
  Save,
  FolderOpen,
  Users,
  User as UserIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AuthModal from "@/components/auth-modal";
import { useAuth } from "@/hooks/use-auth";

/* ---------- helpers de estilo ---------- */
const menuItem =
  "flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-zinc-800/60 transition-colors";

/* ---------- componente ---------- */
export default function AuthDropdown() {
  const {user, token, logout} = useAuth();
  const isLoggedIn = !!token;

  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [modalMode, setModalMode] = useState<"login" | "signup">("login");
  const [roomCode, setRoomCode] = useState("");

  /* Cerrar con click-fuera o Escape */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) =>
      e.key === "Escape" && setIsOpen(false);
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      )
        setIsOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClick);
    };
  }, []);

  /* placeholder callbacks */
  const onSave = () => console.log("TODO: save current project");
  const onLoad = () => console.log("TODO: load project");
  const onJoinCollab = () => console.log("TODO: join room", roomCode);

  return (
    <>
      {/* ---------- Botón principal ---------- */}
      <div className="relative" ref={containerRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border backdrop-blur-sm transition
            ${
              isLoggedIn
                ? "bg-gradient-to-r from-indigo-500 to-fuchsia-600 text-white border-transparent hover:brightness-110"
                : "bg-zinc-900/60 border-zinc-700 text-zinc-200 hover:bg-zinc-800/60"
            }`}
        >
          {isLoggedIn ? (
            <>
              <span className="grid place-items-center w-6 h-6 rounded-full bg-white/20 text-xs font-semibold uppercase">
                {user?.name.charAt(0)}
              </span>
              <span className="hidden sm:inline">
                {user?.name.split(" ")[0]}
              </span>
            </>
          ) : (
            <>
              <UserIcon size={18} />{" "}
              <span className="hidden sm:inline">Cuenta</span>
            </>
          )}
          <ChevronDown
            size={14}
            className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {/* ---------- Dropdown ---------- */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16 }}
              role="menu"
              className="absolute right-0 mt-2 w-64 rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-md shadow-2xl overflow-hidden z-50"
            >
              {!isLoggedIn ? (
                <>
                  <button
                    onClick={() => {
                      setModalMode("login");
                      setShowAuthModal(true);
                      setIsOpen(false);
                    }}
                    className={menuItem}
                  >
                    <LogIn size={16} /> Iniciar sesión
                  </button>
                  <button
                    onClick={() => {
                      setModalMode("signup");
                      setShowAuthModal(true);
                      setIsOpen(false);
                    }}
                    className={menuItem}
                  >
                    <UserPlus size={16} /> Registrarse
                  </button>
                </>
              ) : (
                <>
                  <div className="px-4 py-3 border-b border-zinc-800/60">
                    <p className="text-sm text-zinc-200">
                      Sesión iniciada como&nbsp;
                      <span className="font-medium text-white">
                        {user?.email}
                      </span>
                    </p>
                  </div>

                  {/* --- Acciones de proyecto --- */}
                  <button onClick={onSave} className={menuItem}>
                    <Save size={16} /> Guardar proyecto
                  </button>
                  <button onClick={onLoad} className={menuItem}>
                    <FolderOpen size={16} /> Cargar proyecto
                  </button>

                  {/* --- Colaboración --- */}
                  <div className="px-4 py-3 space-y-2 border-y border-zinc-800/60">
                    <label className="block text-xs font-medium text-zinc-400">
                      Código sala colaborativa
                    </label>
                    <input
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value)}
                      placeholder="p. ej. 4F6A2B"
                      className="w-full rounded-md bg-zinc-800/60 border border-zinc-700 text-sm text-white px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      onClick={onJoinCollab}
                      className="flex items-center gap-2 w-full justify-center rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-sm py-1.5 transition"
                    >
                      <Users size={16} /> Unirse / Crear sala
                    </button>
                  </div>

                  {/* --- Logout --- */}
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut size={16} /> Cerrar sesión
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ---------- Modal Auth ---------- */}
      <AuthModal
        isOpen={showAuthModal}
        initialMode={modalMode}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}
