'use client';

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useDesignerWorkspace } from "@/hooks/use-designer-workspace";
import { useRealtime } from "@/hooks/use-realtime";
import { useCallback, useEffect } from "react";
import { RotateCcw, RotateCw, Trash2 } from "lucide-react";
import { DownloadZipButton } from "../../components/export-flutter";
import IaExample from "../../components/ia/ia-example";
import ScreensManager from "../../components/screens-manager";
import AuthDropdown from "../../components/auth-dropdown";
import ComponentsSidebar from "../../components/components-sidebar";
import DesignCanvas from "../../components/design-canvas";
import PropertiesPanel from "../../components/properties-panel";
import { RemoteCursor } from "@/components/remote-cursor";

export default function DesignerWebsocket({ projectId }: { projectId: string  }) {
  const {
    screens,
    currentScreenId,
    setCurrentScreenId,
    selectedElement,
    setSelectedElement,
    history,
    historyIndex,
    canvasDevice,
    setCanvasDevice,
    addElement,
    updateElement,
    removeElement,
    updateElementPosition,
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

  const {
    isConnected,
    cursors,
    connectedUsers,
    updateCursorPosition,
    sendComponentMovement,
    userColor
  } = useRealtime(projectId);

  // Handle mouse movement for cursor sharing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const bounds = document.getElementById("design-canvas")?.getBoundingClientRect();
      if (!bounds) return;

      const x = e.clientX - bounds.left;
      const y = e.clientY - bounds.top;
      updateCursorPosition(x, y);
    };

    const canvas = document.getElementById("design-canvas");
    if (canvas) {
      canvas.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      canvas?.removeEventListener("mousemove", handleMouseMove);
    };
  }, [updateCursorPosition]);

  // Handle remote component movements
  useEffect(() => {
    const handleRemoteMove = (e: CustomEvent<{
      componentId: string;
      position: { x: number; y: number };
      userId: string;
    }>) => {
      const { componentId, position } = e.detail;
      updateElementPosition(componentId, position);
    };

    window.addEventListener("remote-component-move" as any, handleRemoteMove);
    return () => {
      window.removeEventListener("remote-component-move" as any, handleRemoteMove);
    };
  }, [updateElementPosition]);

  // Handle component movement sync
  const handleComponentMove = useCallback(
    (componentId: string, position: { x: number; y: number }) => {
      updateElementPosition(componentId, position);
      sendComponentMovement(componentId, position);
    },
    [updateElementPosition, sendComponentMovement]
  );

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
            currentScreen={currentScreen || { id: currentScreenId, name: "Loading...", elements: [] }}
            onNavigate={navigateToScreen}
            onElementMove={handleComponentMove}
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

        {/* Mostrar cursores remotos */}
        <div className="fixed inset-0 pointer-events-none">
          {Array.from(cursors.values()).map((cursor) => (
            <RemoteCursor
              key={cursor.userId}
              x={cursor.x}
              y={cursor.y}
              username={cursor.username}
              color={cursor.color}
            />
          ))}
        </div>
      </div>
    </DndProvider>
  );
}
