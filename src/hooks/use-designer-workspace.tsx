"use client";

import { generateFlutterCode } from "@/lib/code-generator";
import {
  getDefaultHeight,
  getDefaultProperties,
  getDefaultWidth,
} from "@/lib/properties";
import { ComponentType, DesignElement, DeviceType, Screen } from "@/lib/types";
import { wsClient } from "@/lib/websocket";
import { useCallback, useRef, useState } from "react";
import { useSocket } from "./use-socket";

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
      console.log("Conectado :", wsClient.isConnected);
      if (wsClient.isConnected)
        wsClient.emit("ELEMENT_ADD", { screenId, element: newElement });

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

      if (wsClient.isConnected)
        wsClient.emit("ELEMENT_UPDATE", { screenId, id, updates });
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

      if (wsClient.isConnected)
        wsClient.emit("ELEMENT_REMOVE", { screenId, id });
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
      if (wsClient.isConnected)
        wsClient.emit("SCREEN_UNDO", {
          screenId: currentScreenIdRef.current,
          elements: elementsToRestore
        });
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
      if (wsClient.isConnected)
        wsClient.emit("SCREEN_REDO", {
          screenId: currentScreenIdRef.current,
          elements: elementsToRestore
        });
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

    if (wsClient.isConnected)
      wsClient.emit("SCREEN_CLEAR", { screenId: currentScreenIdRef.current });
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

    if (wsClient.isConnected)
      wsClient.emit("SCREEN_ADD", {
        screen: { id: newScreenId, name, elements: [] }
      });
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
              id: `child-${newScreenId}-${child.id || Date.now()
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

    if (wsClient.isConnected)
      wsClient.emit("SCREEN_RENAME", { id, name });
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

      if (wsClient.isConnected)
        wsClient.emit("SCREEN_DELETE", { id });
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

  /* -------------------- inbound WS events -------------------- */
  useSocket(
    "ELEMENT_ADD",
    ({ screenId, element }: { screenId: string; element: DesignElement }) => {
      console.log("🆕 ELEMENTO AÑADIDO:", screenId, element.id);
      if (screenId !== currentScreenIdRef.current) return;
      addElementLocal(element);
    }
  );

  /* helper: actual mutator, NO broadcast ------------------------ */
  const addElementLocal = useCallback(
    (element: DesignElement) => {
      const screenId = currentScreenIdRef.current;

      setScreens((prev) => {
        const i = prev.findIndex((s) => s.id === screenId);
        if (i === -1) return prev;

        /* evita duplicar si llega dos veces */
        if (prev[i].elements.some((el) => el.id === element.id)) return prev;

        const next = [...prev];
        next[i] = { ...next[i], elements: [...next[i].elements, element] };
        return next;
      });

      setSelectedElement(element);
      addToHistory([...getCurrentScreenElements(), element]);
    },
    [addToHistory, getCurrentScreenElements]
  );

  useSocket(
    "ELEMENT_UPDATE",
    ({
      screenId,
      id,
      updates,
    }: {
      screenId: string;
      id: string;
      updates: Partial<DesignElement>;
    }) => {
      if (screenId !== currentScreenIdRef.current) return;
      console.log("🛠️ ELEMENTO ACTUALIZADO:", screenId, id, updates)
      updateElementLocal(id, updates);
    }
  );

  const updateElementLocal = useCallback(
    (id: string, updates: Partial<DesignElement>) => {
      const screenId = currentScreenIdRef.current;

      setScreens((prev) => {
        const i = prev.findIndex((s) => s.id === screenId);
        if (i === -1) return prev;

        const next = [...prev];
        const updatedElements = next[i].elements.map((el) =>
          el.id === id ? { ...el, ...updates } : el
        );

        next[i] = { ...next[i], elements: updatedElements };

        // Agregar al historial
        setTimeout(() => {
          addToHistory(updatedElements);
        }, 0);

        return next;
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

  useSocket(
    "ELEMENT_REMOVE",
    ({ screenId, id }: { screenId: string; id: string }) => {
      if (screenId !== currentScreenIdRef.current) return;
      console.log("🗑️ ELEMENTO ELIMINADO WS:", screenId, id);
      removeElementLocal(id);
    }
  );

  const removeElementLocal = useCallback(
    (id: string) => {
      const screenId = currentScreenIdRef.current;

      setScreens((prev) => {
        const i = prev.findIndex((s) => s.id === screenId);
        if (i === -1) return prev;

        const next = [...prev];
        const updatedElements = next[i].elements.filter((el) => el.id !== id);

        next[i] = { ...next[i], elements: updatedElements };

        // Agregar al historial
        setTimeout(() => {
          addToHistory(updatedElements);
        }, 0);

        return next;
      });

      // Clear selection if the removed element was selected
      setSelectedElement((prev) => (prev && prev.id === id ? null : prev));
    },
    [addToHistory]
  );

  useSocket(
    "SCREEN_UNDO",
    ({ screenId, elements }: { screenId: string; elements: DesignElement[] }) => {
      console.log("↩️ UNDO WS:", screenId);
      undoLocal(screenId, elements);
    }
  );

  const undoLocal = useCallback((screenId: string, elements: DesignElement[]) => {
    setScreens((prevScreens) => {
      const currentScreenIndex = prevScreens.findIndex((s) => s.id === screenId);
      if (currentScreenIndex === -1) return prevScreens;

      const updatedScreens = [...prevScreens];
      const currentScreen = { ...updatedScreens[currentScreenIndex] };
      currentScreen.elements = [...elements];
      updatedScreens[currentScreenIndex] = currentScreen;

      return updatedScreens;
    });

    setSelectedElement(null);
  }, []);

  useSocket(
    "SCREEN_REDO",
    ({ screenId, elements }: { screenId: string; elements: DesignElement[] }) => {
      console.log("↪️ REDO WS:", screenId);
      redoLocal(screenId, elements);
    }
  );

  const redoLocal = useCallback((screenId: string, elements: DesignElement[]) => {
    setScreens((prevScreens) => {
      const currentScreenIndex = prevScreens.findIndex((s) => s.id === screenId);
      if (currentScreenIndex === -1) return prevScreens;

      const updatedScreens = [...prevScreens];
      const currentScreen = { ...updatedScreens[currentScreenIndex] };
      currentScreen.elements = [...elements];
      updatedScreens[currentScreenIndex] = currentScreen;

      return updatedScreens;
    });

    setSelectedElement(null);
  }, []);

  useSocket(
    "SCREEN_CLEAR",
    ({ screenId }: { screenId: string }) => {
      console.log("🧹 CLEAR CANVAS WS:", screenId);
      clearCanvasLocal(screenId);
    }
  );

  const clearCanvasLocal = useCallback((screenId: string) => {
    setScreens((prevScreens) => {
      const currentScreenIndex = prevScreens.findIndex((s) => s.id === screenId);
      if (currentScreenIndex === -1) return prevScreens;

      const updatedScreens = [...prevScreens];
      const currentScreen = { ...updatedScreens[currentScreenIndex] };
      currentScreen.elements = [];
      updatedScreens[currentScreenIndex] = currentScreen;

      return updatedScreens;
    });

    setSelectedElement(null);
  }, []);

  useSocket(
    "SCREEN_ADD",
    ({ screen }: { screen: Screen }) => {
      console.log("🆕 SCREEN ADD WS:", screen.id, screen.name);
      addScreenLocal(screen);
    }
  );

  const addScreenLocal = useCallback((screen: Screen) => {
    // Evitar duplicados
    setScreens((prevScreens) => {
      if (prevScreens.some(s => s.id === screen.id)) return prevScreens;
      return [...prevScreens, screen];
    });

    // Inicializar historial solo si no existe
    setHistory((prevHistory) => {
      if (prevHistory[screen.id]) return prevHistory;
      return {
        ...prevHistory,
        [screen.id]: [screen.elements],
      };
    });

    setHistoryIndex((prevIndices) => {
      if (prevIndices[screen.id] !== undefined) return prevIndices;
      return {
        ...prevIndices,
        [screen.id]: 0,
      };
    });
  }, []);

  useSocket(
    "SCREEN_RENAME",
    ({ id, name }: { id: string; name: string }) => {
      console.log("✏️ SCREEN RENAME WS:", id, name);
      renameScreenLocal(id, name);
    }
  );

  const renameScreenLocal = useCallback((id: string, name: string) => {
    setScreens((prevScreens) =>
      prevScreens.map((screen) =>
        screen.id === id ? { ...screen, name } : screen
      )
    );
  }, []);

  useSocket(
    "SCREEN_DELETE",
    ({ id }: { id: string }) => {
      console.log("🗑️ SCREEN DELETE WS:", id);
      deleteScreenLocal(id);
    }
  );

  const deleteScreenLocal = useCallback((id: string) => {
    setScreens((prevScreens) => {
      const filtered = prevScreens.filter((screen) => screen.id !== id);
      return filtered.length > 0 ? filtered : prevScreens; // No eliminar si es la última
    });

    // Limpiar historial
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
  }, []);


  return {
    screens,
    setScreens,
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
    exportProject,
    importProject,
  };
}
