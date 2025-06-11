'use client';

import { useDesignerWorkspace } from "@/hooks/use-designer-workspace";
import { wsClient } from "@/lib/websocket";
import { RotateCcw, RotateCw, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ScreensManager from "../../components/screens-manager";
import AuthDropdown from "../../components/auth-dropdown";
import ComponentsSidebar from "../../components/components-sidebar";
import DesignCanvas from "../../components/design-canvas";
import PropertiesPanel from "../../components/properties-panel";
import { useParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export default function DesignerWebsocket() {
  const params = useParams();
  const projectId = params.projectID as string;
  const { user } = useAuth();

  const {
    screens,
    currentScreenId,
    setCurrentScreenId,
    currentScreenIdRef,
    selectedElement,
    setSelectedElement,
    history,
    setHistory,
    historyIndex,
    setHistoryIndex,
    canvasDevice,
    setCanvasDevice,
    addElement,
    updateElement,
    removeElement,
    undo,
    redo,
    generateCode,
    clearCanvas,
    addScreen,
    addScreenIA,
    renameScreen,
    deleteScreen,
    navigateToScreen,
    currentScreen
  } = useDesignerWorkspace();

  // Actualizar la ref cuando cambia currentScreenId
  useEffect(() => {
    currentScreenIdRef.current = currentScreenId;
    console.log("🔄 Pantalla actual cambiada a:", currentScreenId);
  }, [currentScreenId]);

  // Reset selected element when changing screens
  useEffect(() => {
    setSelectedElement(null);
  }, [currentScreenId]);

  // Asegurar que el historial existe para la pantalla actual
  useEffect(() => {
    const screenId = currentScreenId;

    if (!history[screenId]) {
      console.log("📝 Inicializando historial para pantalla:", screenId);
      setHistory((prevHistory) => ({
        ...prevHistory,
        [screenId]: [[]],
      }));
    }

    if (historyIndex[screenId] === undefined) {
      console.log(
        "📝 Inicializando índice de historial para pantalla:",
        screenId
      );
      setHistoryIndex((prevIndices) => ({
        ...prevIndices,
        [screenId]: 0,
      }));
    }

    // Mostrar información de depuración
    const currentScreen = screens.find((s) => s.id === screenId);
    if (currentScreen) {
      console.log(
        "📊 Pantalla actual:",
        screenId,
        "Nombre:",
        currentScreen.name,
        "Elementos:",
        currentScreen.elements.length
      );
    }
  }, [currentScreenId, history, historyIndex, screens]);

  // Mostrar información de depuración cuando cambian las pantallas
  useEffect(() => {
    console.log("📊 ESTADO DE PANTALLAS:");
    screens.forEach((screen) => {
      console.log(
        `- ${screen.id} (${screen.name}): ${screen.elements.length} elementos`
      );
    });
  }, [screens]);

  useEffect(() => {
    const connectToWebSocket = async () => {
      if (projectId && user?.id && user?.name) {
        console.log("🔗 Conectando al WebSocket con proyecto:", projectId);
        try {
          await wsClient.connect(projectId, user.id, user.name);
          console.log("✅ WebSocket conectado:", wsClient.isConnected);
        } catch (error) {
          console.error("❌ Error conectando WebSocket:", error);
        }
      }
    };

    connectToWebSocket();

    return () => {
      wsClient.leaveRoom();
    };
  }, [projectId, user]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-1 flex-col overflow-hidden mt-2 bg-transparent">
        <div className="flex h-12 items-center justify-between border-b border-gray-200 px-4">
          <button
            onClick={undo}
            disabled={
              !historyIndex[currentScreenId] ||
              historyIndex[currentScreenId] === 0
            }
            className="rounded p-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            title="Undo"
          >
            <RotateCcw size={20} />
          </button>

          <button
            onClick={redo}
            disabled={
              !history[currentScreenId] ||
              !historyIndex[currentScreenId] ||
              historyIndex[currentScreenId] ===
              history[currentScreenId].length - 1
            }
            className="rounded p-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            title="Redo"
          >
            <RotateCw size={20} />
          </button>
          <button
            onClick={clearCanvas}
            className="rounded p-1 text-gray-600 hover:bg-gray-100"
            title="Clear Canvas"
          >
            <Trash2 size={20} />
          </button>

          <span className="text-sm text-gray-500">
            Elements: {currentScreen ? currentScreen.elements.length : 0}
          </span>

          <ScreensManager
            screens={screens}
            currentScreenId={currentScreenId}
            onAddScreen={addScreen}
            onRenameScreen={renameScreen}
            onDeleteScreen={deleteScreen}
            onSelectScreen={setCurrentScreenId}
          />

          <AuthDropdown flutterCode={generateCode()} addScreenIA={addScreenIA} />
        </div>
        <div className="flex flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <ComponentsSidebar onAddElement={addElement} />
          </div>
          <DesignCanvas
            elements={currentScreen ? currentScreen.elements : []}
            selectedElement={selectedElement}
            onSelectElement={setSelectedElement}
            onUpdateElement={updateElement}
            onRemoveElement={removeElement}
            isDarkMode={false}
            onAddElement={addElement}
            deviceType={canvasDevice}
            onDeviceChange={setCanvasDevice}
            currentScreen={currentScreen}
            onNavigate={navigateToScreen}
          />

          <div className="h-full overflow-y-auto">
            <PropertiesPanel
              selectedElement={selectedElement}
              onUpdateElement={updateElement}
              onRemoveElement={removeElement}
              screens={screens}
            />
          </div>
        </div>
      </div>
    </DndProvider>
  );
}