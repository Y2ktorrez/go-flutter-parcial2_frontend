"use client";

import { useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ComponentsSidebar from "./components-sidebar";
import DesignCanvas from "./design-canvas";
import PropertiesPanel from "./properties-panel";
import ScreensManager from "./screens-manager";
import { RotateCcw, RotateCw, Trash2 } from "lucide-react";
import { DownloadZipButton } from "./export-flutter";
import IaExample from "./ia/ia-example";
import { useDesignerWorkspace } from "@/hooks/use-designer-workspace";
import AuthDropdown from "./auth-dropdown";

export default function DesignerWorkspace() {
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
    currentScreen,
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

          <DownloadZipButton flutterCode={generateCode()} />
          <IaExample addScreenIA={addScreenIA} />

          <ScreensManager
            screens={screens}
            currentScreenId={currentScreenId}
            onAddScreen={addScreen}
            onRenameScreen={renameScreen}
            onDeleteScreen={deleteScreen}
            onSelectScreen={setCurrentScreenId}
          />

          <AuthDropdown />
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
