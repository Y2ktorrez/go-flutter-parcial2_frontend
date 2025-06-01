"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ComponentsSidebar from "./components-sidebar";
import DesignCanvas from "./design-canvas";
import PropertiesPanel from "./properties-panel";
import ScreensManager from "./screens-manager";
import type {
  ComponentType,
  DesignElement,
  DeviceType,
  Screen,
} from "@/lib/types";
import { generateFlutterCode } from "@/lib/code-generator";
import {
  getDefaultHeight,
  getDefaultProperties,
  getDefaultWidth,
} from "@/lib/properties";
import { RotateCcw, RotateCw, Trash2 } from "lucide-react";
import { DownloadZipButton } from "./export-flutter";
import IaExample from "./ia/ia-example";

export default function DesignerWorkspace() {
  // Screens state
  const [screens, setScreens] = useState<Screen[]>([
    { id: "screen-1", name: "Home", elements: [] },
  ]);
  const [currentScreenId, setCurrentScreenId] = useState("screen-1");

  // Ref para rastrear el ID de pantalla actual
  const currentScreenIdRef = useRef(currentScreenId);

  // Elements state
  const [selectedElement, setSelectedElement] = useState<DesignElement | null>(
    null
  );
  const [history, setHistory] = useState<Record<string, DesignElement[][]>>({
    "screen-1": [[]],
  });
  const [historyIndex, setHistoryIndex] = useState<Record<string, number>>({
    "screen-1": 0,
  });

  // Device and mode state
  const [canvasDevice, setCanvasDevice] = useState<DeviceType>("iphone13");

  // Actualizar la ref cuando cambia currentScreenId
  useEffect(() => {
    currentScreenIdRef.current = currentScreenId;
    console.log("🔄 Pantalla actual cambiada a:", currentScreenId);
  }, [currentScreenId]);

  // Get current screen elements
  const getCurrentScreenElements = useCallback(() => {
    const screenId = currentScreenIdRef.current;
    const currentScreen = screens.find((s) => s.id === screenId);
    if (!currentScreen) {
      console.error("❌ No se encontró la pantalla actual:", screenId);
      return [];
    }
    return currentScreen.elements;
  }, [screens]);

  // Update current screen elements
  const updateCurrentScreenElements = useCallback(
    (elements: DesignElement[]) => {
      const screenId = currentScreenIdRef.current;
      console.log(
        "📝 Actualizando elementos para pantalla:",
        screenId,
        "Elementos:",
        elements.length
      );

      setScreens((prevScreens) => {
        const updatedScreens = prevScreens.map((screen) => {
          if (screen.id === screenId) {
            return { ...screen, elements };
          }
          return screen;
        });
        return updatedScreens;
      });
    },
    []
  );

  // Add current state to history
  const addToHistory = useCallback(
    (newElements: DesignElement[]) => {
      const screenId = currentScreenIdRef.current;
      console.log(
        "📚 Agregando al historial para pantalla:",
        screenId,
        "Elementos:",
        newElements.length
      );

      setHistory((prevHistory) => {
        const currentHistory = prevHistory[screenId] || [[]];
        const currentIndex = historyIndex[screenId] || 0;

        // Remove any future history if we're not at the end
        const newHistory = currentHistory.slice(0, currentIndex + 1);

        // Add the new state
        newHistory.push([...newElements]);

        // Limit history to prevent memory issues (keep last 50 states)
        if (newHistory.length > 50) {
          newHistory.shift();
          return {
            ...prevHistory,
            [screenId]: newHistory,
          };
        }

        return {
          ...prevHistory,
          [screenId]: newHistory,
        };
      });

      setHistoryIndex((prevIndices) => {
        const currentIndex = prevIndices[screenId] || 0;
        const newIndex = Math.min(49, currentIndex + 1);

        return {
          ...prevIndices,
          [screenId]: newIndex,
        };
      });
    },
    [historyIndex]
  );

  // Add element to the canvas
  const addElement = useCallback(
    (type: ComponentType, x: number, y: number) => {
      const screenId = currentScreenIdRef.current;
      console.log("➕ AGREGANDO ELEMENTO");
      console.log("Tipo:", type, "Posición:", x, y);
      console.log("Pantalla actual:", screenId);

      // Crear el nuevo elemento
      const newElement: DesignElement = {
        id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        x,
        y,
        width: getDefaultWidth(type),
        height: getDefaultHeight(type),
        properties: getDefaultProperties(type),
        children: [],
      };

      console.log("Nuevo elemento creado:", newElement.id);

      // Actualizar el estado de las pantallas
      setScreens((prevScreens) => {
        // Encontrar la pantalla actual
        const currentScreenIndex = prevScreens.findIndex(
          (s) => s.id === screenId
        );

        if (currentScreenIndex === -1) {
          console.error("❌ No se encontró la pantalla:", screenId);
          return prevScreens;
        }

        // Crear una copia profunda de las pantallas
        const updatedScreens = [...prevScreens];

        // Obtener la pantalla actual
        const currentScreen = { ...updatedScreens[currentScreenIndex] };

        // Agregar el nuevo elemento a la pantalla actual
        const updatedElements = [...currentScreen.elements, newElement];
        currentScreen.elements = updatedElements;

        // Actualizar la pantalla en el array
        updatedScreens[currentScreenIndex] = currentScreen;

        console.log(
          "✅ Pantalla actualizada:",
          currentScreen.id,
          "Elementos:",
          updatedElements.length
        );

        // Agregar al historial
        setTimeout(() => {
          addToHistory(updatedElements);
        }, 0);

        return updatedScreens;
      });

      // Seleccionar el nuevo elemento
      setSelectedElement(newElement);

      console.log("➕ FIN AGREGAR ELEMENTO");
    },
    [addToHistory]
  );

  // Update element properties
  const updateElement = useCallback(
    (id: string, updates: Partial<DesignElement>) => {
      const screenId = currentScreenIdRef.current;

      setScreens((prevScreens) => {
        // Encontrar la pantalla actual
        const currentScreenIndex = prevScreens.findIndex(
          (s) => s.id === screenId
        );

        if (currentScreenIndex === -1) {
          console.error("❌ No se encontró la pantalla:", screenId);
          return prevScreens;
        }

        // Crear una copia profunda de las pantallas
        const updatedScreens = [...prevScreens];

        // Obtener la pantalla actual
        const currentScreen = { ...updatedScreens[currentScreenIndex] };

        // Actualizar el elemento en la pantalla actual
        const updatedElements = currentScreen.elements.map((el) =>
          el.id === id ? { ...el, ...updates } : el
        );

        currentScreen.elements = updatedElements;

        // Actualizar la pantalla en el array
        updatedScreens[currentScreenIndex] = currentScreen;

        // Agregar al historial
        setTimeout(() => {
          addToHistory(updatedElements);
        }, 0);

        return updatedScreens;
      });

      // Update selected element if it's the one being updated
      setSelectedElement((prevSelected) => {
        if (prevSelected && prevSelected.id === id) {
          return { ...prevSelected, ...updates };
        }
        return prevSelected;
      });
    },
    [addToHistory]
  );

  // Remove element from canvas
  const removeElement = useCallback(
    (id: string) => {
      const screenId = currentScreenIdRef.current;

      setScreens((prevScreens) => {
        // Encontrar la pantalla actual
        const currentScreenIndex = prevScreens.findIndex(
          (s) => s.id === screenId
        );

        if (currentScreenIndex === -1) {
          console.error("❌ No se encontró la pantalla:", screenId);
          return prevScreens;
        }

        // Crear una copia profunda de las pantallas
        const updatedScreens = [...prevScreens];

        // Obtener la pantalla actual
        const currentScreen = { ...updatedScreens[currentScreenIndex] };

        // Eliminar el elemento de la pantalla actual
        const updatedElements = currentScreen.elements.filter(
          (el) => el.id !== id
        );

        currentScreen.elements = updatedElements;

        // Actualizar la pantalla en el array
        updatedScreens[currentScreenIndex] = currentScreen;

        // Agregar al historial
        setTimeout(() => {
          addToHistory(updatedElements);
        }, 0);

        return updatedScreens;
      });

      // Clear selection if the removed element was selected
      setSelectedElement((prevSelected) => {
        if (prevSelected && prevSelected.id === id) {
          return null;
        }
        return prevSelected;
      });
    },
    [addToHistory]
  );

  // Undo action
  const undo = useCallback(() => {
    const screenId = currentScreenIdRef.current;
    const screenHistoryIndex = historyIndex[screenId] || 0;
    const screenHistory = history[screenId] || [[]];

    if (screenHistoryIndex > 0) {
      const newIndex = screenHistoryIndex - 1;
      const elementsToRestore = screenHistory[newIndex];

      setHistoryIndex((prevIndices) => ({
        ...prevIndices,
        [screenId]: newIndex,
      }));

      setScreens((prevScreens) => {
        // Encontrar la pantalla actual
        const currentScreenIndex = prevScreens.findIndex(
          (s) => s.id === screenId
        );

        if (currentScreenIndex === -1) {
          console.error("❌ No se encontró la pantalla:", screenId);
          return prevScreens;
        }

        // Crear una copia profunda de las pantallas
        const updatedScreens = [...prevScreens];

        // Obtener la pantalla actual
        const currentScreen = { ...updatedScreens[currentScreenIndex] };

        // Restaurar los elementos
        currentScreen.elements = [...elementsToRestore];

        // Actualizar la pantalla en el array
        updatedScreens[currentScreenIndex] = currentScreen;

        return updatedScreens;
      });

      setSelectedElement(null);
    }
  }, [history, historyIndex]);

  // Redo action
  const redo = useCallback(() => {
    const screenId = currentScreenIdRef.current;
    const screenHistoryIndex = historyIndex[screenId] || 0;
    const screenHistory = history[screenId] || [[]];

    if (screenHistoryIndex < screenHistory.length - 1) {
      const newIndex = screenHistoryIndex + 1;
      const elementsToRestore = screenHistory[newIndex];

      setHistoryIndex((prevIndices) => ({
        ...prevIndices,
        [screenId]: newIndex,
      }));

      setScreens((prevScreens) => {
        // Encontrar la pantalla actual
        const currentScreenIndex = prevScreens.findIndex(
          (s) => s.id === screenId
        );

        if (currentScreenIndex === -1) {
          console.error("❌ No se encontró la pantalla:", screenId);
          return prevScreens;
        }

        // Crear una copia profunda de las pantallas
        const updatedScreens = [...prevScreens];

        // Obtener la pantalla actual
        const currentScreen = { ...updatedScreens[currentScreenIndex] };

        // Restaurar los elementos
        currentScreen.elements = [...elementsToRestore];

        // Actualizar la pantalla en el array
        updatedScreens[currentScreenIndex] = currentScreen;

        return updatedScreens;
      });

      setSelectedElement(null);
    }
  }, [history, historyIndex]);

  // Generate Flutter code
  const generateCode = useCallback(() => {
    return generateFlutterCode(screens);
  }, [getCurrentScreenElements]);

  // Clear all elements
  const clearCanvas = useCallback(() => {
    const screenId = currentScreenIdRef.current;

    setScreens((prevScreens) => {
      // Encontrar la pantalla actual
      const currentScreenIndex = prevScreens.findIndex(
        (s) => s.id === screenId
      );

      if (currentScreenIndex === -1) {
        console.error("❌ No se encontró la pantalla:", screenId);
        return prevScreens;
      }

      // Crear una copia profunda de las pantallas
      const updatedScreens = [...prevScreens];

      // Obtener la pantalla actual
      const currentScreen = { ...updatedScreens[currentScreenIndex] };

      // Limpiar los elementos
      currentScreen.elements = [];

      // Actualizar la pantalla en el array
      updatedScreens[currentScreenIndex] = currentScreen;

      return updatedScreens;
    });

    setSelectedElement(null);
    addToHistory([]);
  }, [addToHistory]);

  // Screen management functions
  const addScreen = useCallback((name: string) => {
    const newScreenId = `screen-${Date.now()}`;
    console.log("🆕 Creando nueva pantalla:", newScreenId, "Nombre:", name);

    // Primero agregar la nueva pantalla
    setScreens((prevScreens) => [
      ...prevScreens,
      { id: newScreenId, name, elements: [] },
    ]);

    // Inicializar el historial para la nueva pantalla
    setHistory((prevHistory) => ({
      ...prevHistory,
      [newScreenId]: [[]],
    }));

    // Inicializar el índice del historial para la nueva pantalla
    setHistoryIndex((prevIndices) => ({
      ...prevIndices,
      [newScreenId]: 0,
    }));

    // Cambiar a la nueva pantalla (esto actualizará currentScreenIdRef en el useEffect)
    setCurrentScreenId(newScreenId);

    // Limpiar la selección
    setSelectedElement(null);
  }, []);

  // Screen management functions
  const addScreenIA = useCallback(
    (name: string, elements: Omit<DesignElement, "id">[] = []) => {
      const newScreenId = `screen-${Date.now()}`;
      console.log(
        "🆕 Creando nueva pantalla IA:",
        newScreenId,
        "Nombre:",
        name,
        "Elementos:",
        elements.length
      );

      // Crear la nueva pantalla con los elementos
      const newScreen: Screen = {
        id: newScreenId,
        name,
        elements: elements.map((element) => ({
          ...element,
          // Asegurar que los IDs sean únicos usando el screenId
          id: `element-${newScreenId}-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 4)}`,
          // Procesar elementos hijos recursivamente
          children:
            element.children?.map((child) => ({
              ...child,
              id: `child-${newScreenId}-${
                child.id || Date.now()
              }-${Math.random().toString(36).substr(2, 4)}`,
            })) || [],
        })),
      };

      // Agregar la nueva pantalla
      setScreens((prevScreens) => [...prevScreens, newScreen]);

      // Inicializar el historial para la nueva pantalla
      setHistory((prevHistory) => ({
        ...prevHistory,
        [newScreenId]: [newScreen.elements],
      }));

      // Inicializar el índice del historial
      setHistoryIndex((prevIndices) => ({
        ...prevIndices,
        [newScreenId]: 0,
      }));

      // Cambiar a la nueva pantalla
      setCurrentScreenId(newScreenId);
      setSelectedElement(null);

      return newScreenId;
    },
    []
  );

  const renameScreen = useCallback((id: string, name: string) => {
    setScreens((prevScreens) =>
      prevScreens.map((screen) =>
        screen.id === id ? { ...screen, name } : screen
      )
    );
  }, []);

  const deleteScreen = useCallback(
    (id: string) => {
      if (screens.length <= 1) return; // Don't delete the last screen

      const newScreens = screens.filter((screen) => screen.id !== id);
      setScreens(newScreens);

      // Update current screen if the deleted one was selected
      if (id === currentScreenId) {
        setCurrentScreenId(newScreens[0].id);
      }

      // Clean up history
      setHistory((prevHistory) => {
        const newHistory = { ...prevHistory };
        delete newHistory[id];
        return newHistory;
      });

      setHistoryIndex((prevIndices) => {
        const newIndices = { ...prevIndices };
        delete newIndices[id];
        return newIndices;
      });
    },
    [screens, currentScreenId]
  );

  // Handle navigation between screens
  const navigateToScreen = useCallback(
    (screenId: string) => {
      if (screens.some((screen) => screen.id === screenId)) {
        console.log("🧭 Navegando a pantalla:", screenId);
        setCurrentScreenId(screenId);
      }
    },
    [screens]
  );

  // Get current screen
  const currentScreen =
    screens.find((s) => s.id === currentScreenId) || screens[0];

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
        </div>

        {/* <IaImage /> */}

        <div className="flex flex-1 overflow-hidden">
          <ComponentsSidebar onAddElement={addElement} />
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

          <PropertiesPanel
            selectedElement={selectedElement}
            onUpdateElement={updateElement}
            onRemoveElement={removeElement}
            screens={screens}
          />
        </div>
      </div>
    </DndProvider>
  );
}
