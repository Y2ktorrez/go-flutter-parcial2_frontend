"use client";

import { generateFlutterCode } from "@/lib/code-generator";
import {
  getDefaultHeight,
  getDefaultProperties,
  getDefaultWidth,
} from "@/lib/properties";
import { ComponentType, DesignElement, DeviceType, Screen } from "@/lib/types";
import { useCallback, useRef, useState } from "react";

export function useDesignerWorkspace() {
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
  const [canvasDevice, setCanvasDevice] = useState<DeviceType>("samsungA10");

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

  const exportProject = () => ({
    name: currentScreen.name, 
    screens,
    deviceDefault: canvasDevice,
  });

  const importProject = (project: {
    screens: Screen[];
    deviceDefault?: DeviceType;
  }) => {
    setScreens(project.screens);
    setCanvasDevice(project.deviceDefault ?? "samsungA10");

    /* reconstruir historial e índices */
    const newHistory: Record<string, DesignElement[][]> = {};
    const newIndex: Record<string, number> = {};
    project.screens.forEach((s) => {
      newHistory[s.id] = [s.elements];
      newIndex[s.id] = 0;
    });
    setHistory(newHistory);
    setHistoryIndex(newIndex);

    setCurrentScreenId(project.screens[0]?.id ?? "screen-1");
    setSelectedElement(null);
  };

  // Función para actualizar la posición de un elemento
  const updateElementPosition = useCallback(
    (elementId: string, position: { x: number; y: number }) => {
      setScreens((prevScreens) => {
        return prevScreens.map((screen) => {
          if (screen.id === currentScreenId) {
            return {
              ...screen,
              elements: screen.elements.map((element) => {
                if (element.id === elementId) {
                  return {
                    ...element,
                    position,
                  };
                }
                return element;
              }),
            };
          }
          return screen;
        });
      });
    },
    [currentScreenId]
  );

  return {
    screens,
    setScreens,
    currentScreenId,
    setCurrentScreenId,
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
    currentScreen: screens.find((s) => s.id === currentScreenId),
    updateElementPosition,
    exportProject,
    importProject,
  };
}
