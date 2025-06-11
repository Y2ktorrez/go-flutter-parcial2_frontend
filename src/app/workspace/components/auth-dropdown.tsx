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
  Check,
  Plus,
  Copy,
  Sparkles,
  Download,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AuthModal from "@/components/auth-modal";
import { useAuth } from "@/hooks/use-auth";
import SaveProjectModal from "./save-project-modal";
import LoadProjectModal from "./load-project-modal";
import { wsClient } from "@/lib/websocket";
import { useRouter } from "next/navigation";
import { generateAndDownloadZip } from "@/lib/export-flutter";
import IaDesignModal from "./ia/ia-example";

/* ---------- helpers de estilo ---------- */
const menuItem =
  "flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-zinc-800/60 transition-colors";

interface AuthDropdownProps {
  // Props necesarias para los nuevos componentes
  addScreenIA?: (name: string, elements?: any[]) => string;
  flutterCode?: string;
}

/* ---------- componente ---------- */
export default function AuthDropdown({ addScreenIA, flutterCode }: AuthDropdownProps) {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const isLoggedIn = !!token;

  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [modalMode, setModalMode] = useState<"login" | "signup">("login");
  const [roomCode, setRoomCode] = useState("");
  const [showSave, setShowSave] = useState(false);
  const [showLoad, setShowLoad] = useState(false);
  const [showIAModal, setShowIAModal] = useState(false);

  // Estados para funcionalidad colaborativa
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [createdRoomCode, setCreatedRoomCode] = useState(localStorage.getItem('roomCode') || "");
  const [copySuccess, setCopySuccess] = useState(false);
  const [joinError, setJoinError] = useState("");

  console.log(createdRoomCode)

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

  useEffect(() => {
    // Recuperar código de sala creada del localStorage
    const savedRoomCode = localStorage.getItem('createdRoomCode');
    if (savedRoomCode) {
      setCreatedRoomCode(savedRoomCode);

      // Limpiar después de 30 segundos para no mostrar códigos viejos
      setTimeout(() => {
        localStorage.removeItem('createdRoomCode');
        setCreatedRoomCode('');
      }, 30000);
    }
  }, []);

  const onCreateRoom = async () => {
    if (!user?.id || !user?.name) return;

    setIsCreatingRoom(true);
    setJoinError("");

    try {
      const inviteCode = await wsClient.createRoom(user.id, user.name);
      localStorage.setItem('roomCode', inviteCode);
      localStorage.setItem('roomAt', Date.now().toString());
      setCreatedRoomCode(inviteCode);

      // MODIFICACIÓN: Usar el inviteCode directamente como projectId
      console.log('🔄 Redirigiendo a workspace:', inviteCode);
      router.push(`/workspace/${inviteCode.trim()}`);

      setIsOpen(false);
    } catch (error) {
      console.error("Error creando sala:", error);
      setJoinError("Error al crear la sala. Inténtalo de nuevo.");
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const onJoinRoom = async () => {
    if (!user?.id || !user?.name || !roomCode.trim()) {
      setJoinError("Por favor ingresa un código de sala válido");
      return;
    }

    setIsJoiningRoom(true);
    setJoinError("");

    try {
      const success = await wsClient.joinRoom(roomCode.trim(), user.id, user.name);

      if (success) {
        // MODIFICACIÓN: Usar el roomCode directamente como projectId
        console.log('🔄 Redirigiendo a workspace:', roomCode.trim());
        localStorage.setItem('roomCode', roomCode);
        localStorage.setItem('roomAt', Date.now().toString());
        router.push(`/workspace/${roomCode.trim()}`);
        setIsOpen(false);
        setRoomCode("");
      }
    } catch (error: any) {
      console.error("Error uniéndose a sala:", error);
      setJoinError(error.message || "Error al unirse a la sala. Verifica el código.");
    } finally {
      setIsJoiningRoom(false);
    }
  };

  const copyInviteCode = async () => {
    try {
      await navigator.clipboard.writeText(createdRoomCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error("Error copiando código:", error);
      // Fallback para navegadores que no soporten clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = createdRoomCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleLogout = () => {
    // Limpiar datos de colaboración
    localStorage.removeItem('roomCode');
    localStorage.removeItem('roomAt');

    logout();
    setIsOpen(false);
  };

  const handleExportProject = () => {
    if (!flutterCode || flutterCode.trim() === '') {
      alert('Por favor, escribe código Flutter válido antes de exportar.');
      return;
    }

    try {
      // Aquí llamarías a la función de exportación
      generateAndDownloadZip(flutterCode);
      alert('✅ Descarga iniciada! Encuentra el ZIP en tu carpeta de descargas');
      setIsOpen(false);
    } catch (error: any) {
      alert('❌ Error al generar el proyecto: ' + error.message);
    }
  };

  const handleOpenIAModal = () => {
    setShowIAModal(true);
    setIsOpen(false); // Cerrar dropdown
  };

  useEffect(() => {
    if (!isOpen) {
      setJoinError("");
    }
  }, [isOpen]);

  return (
    <>
      {/* ---------- Botón principal ---------- */}
      <div className="relative" ref={containerRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border backdrop-blur-sm transition
            ${isLoggedIn
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
              className="absolute right-0 mt-2 w-80 rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-md shadow-2xl overflow-hidden z-50"
            >
              <div className="px-4 py-3 space-y-3 border-b border-zinc-800/60">
                <h3 className="text-sm font-medium text-zinc-300">
                  🛠️ Herramientas de diseño
                </h3>

                {/* Botón IA Design - Estilo integrado */}
                <div className="w-full">
                  <button
                    onClick={handleOpenIAModal}
                    disabled={!addScreenIA}
                    className="flex w-full items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                    title="Generar diseño con Inteligencia Artificial"
                  >
                    <Sparkles size={16} />
                    <span>Diseñar con IA</span>
                    <div className="ml-auto">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                  </button>
                </div>

                {/* Botón Export - Nuevo diseño */}
                <button
                  onClick={handleExportProject}
                  className="flex w-full items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-medium transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                  title="Exportar proyecto Flutter completo"
                >
                  <Download size={16} />
                  <span>Exportar proyecto</span>
                  <div className="ml-auto">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </button>
              </div>
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
                  {/* --- Acciones de proyecto --- */}
                  {/* <button onClick={() => setShowSave(true)}>
                    <Save size={16} /> Guardar proyecto
                  </button>
                  <Button onClick={() => setShowLoad(true)}>
                    <FolderOpen size={16} /> Cargar proyecto
                  </Button> */}

                  {/* --- Colaboración --- */}
                  <div className="px-4 py-3 space-y-4 border-y border-zinc-800/60">
                    <h3 className="text-sm font-medium text-zinc-300">
                      Colaboración en tiempo real
                    </h3>

                    {/* Crear nueva sala */}
                    <button
                      onClick={onCreateRoom}
                      disabled={isCreatingRoom}
                      className="flex items-center gap-2 w-full justify-center rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white text-sm py-2 transition"
                    >
                      <Plus size={16} />
                      {isCreatingRoom ? "Creando..." : "Crear nueva sala"}
                    </button>

                    {/* Mostrar código de sala creada */}
                    {createdRoomCode && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="p-3 bg-emerald-900/30 border border-emerald-700/50 rounded-md space-y-2"
                      >
                        <p className="text-xs text-emerald-300">
                          ✅ Sala creada exitosamente:
                        </p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 bg-zinc-800 px-3 py-2 rounded text-white font-mono text-xs break-all min-w-0">
                            {createdRoomCode}
                          </code>
                          <button
                            onClick={copyInviteCode}
                            className="flex-shrink-0 p-2 hover:bg-zinc-700 rounded transition"
                            title="Copiar código"
                          >
                            {copySuccess ? (
                              <Check size={14} className="text-emerald-400" />
                            ) : (
                              <Copy size={14} className="text-zinc-400" />
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-emerald-400">
                          Comparte este código para que otros se unan
                        </p>
                      </motion.div>
                    )}

                    {/* Separador */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-px bg-zinc-700"></div>
                      <span className="text-xs text-zinc-500">o</span>
                      <div className="flex-1 h-px bg-zinc-700"></div>
                    </div>

                    {/* Unirse a sala existente */}
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-zinc-400">
                        Código de sala existente
                      </label>
                      <input
                        value={roomCode}
                        onChange={(e) => {
                          setRoomCode(e.target.value);
                          setJoinError("");
                        }}
                        placeholder="Ej: project_1749587645537_c22v54"
                        className="w-full rounded-md bg-zinc-800/60 border border-zinc-700 text-sm text-white px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono tracking-wider"
                      />
                      {joinError && (
                        <p className="text-xs text-red-400">{joinError}</p>
                      )}
                      <button
                        onClick={onJoinRoom}
                        disabled={isJoiningRoom || !roomCode.trim()}
                        className="flex items-center gap-2 w-full justify-center rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white text-sm py-2 transition"
                      >
                        <Users size={16} />
                        {isJoiningRoom ? "Uniéndose..." : "Unirse a sala"}
                      </button>
                    </div>
                  </div>

                  {/* --- Estado de conexión --- */}
                  {wsClient.isConnected && (
                    <div className="px-4 py-2 text-xs text-emerald-400 border-b border-zinc-800/60">
                      🟢 Conectado a sala colaborativa
                    </div>
                  )}

                  {/* --- Logout --- */}
                  <button
                    onClick={handleLogout}
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

      {/* ---------- Modal ---------- */}
      <AuthModal
        isOpen={showAuthModal}
        initialMode={modalMode}
        onClose={() => setShowAuthModal(false)}
      />
      <SaveProjectModal open={showSave} onClose={() => setShowSave(false)} />
      <LoadProjectModal open={showLoad} onClose={() => setShowLoad(false)} />

      {addScreenIA && (
        <IaDesignModal
          isOpen={showIAModal}
          onClose={() => setShowIAModal(false)}
          addScreenIA={addScreenIA}
        />
      )}
    </>
  );
}
