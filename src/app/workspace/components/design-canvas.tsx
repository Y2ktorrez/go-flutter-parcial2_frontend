"use client";

import type React from "react";
import { useDrop } from "react-dnd";
import type {
  ComponentType,
  DesignElement,
  DeviceType,
  Screen,
} from "@/lib/types";
import CanvasElement from "./canvas-element";
import { useCallback, useState } from "react";
import { devices } from "@/lib/properties";

interface DesignCanvasProps {
  elements: DesignElement[];
  selectedElement: DesignElement | null;
  onSelectElement: (element: DesignElement | null) => void;
  onUpdateElement: (id: string, updates: Partial<DesignElement>) => void;
  onRemoveElement: (id: string) => void;
  isDarkMode: boolean;
  onAddElement: (type: ComponentType, x: number, y: number) => void;
  deviceType: DeviceType;
  onDeviceChange: (device: DeviceType) => void;
  currentScreen: Screen;
  onNavigate?: (screenId: string) => void;
}

export default function DesignCanvas(props: DesignCanvasProps) {
  const { deviceType, onDeviceChange, currentScreen, onNavigate } = props;
  const {
    elements,
    selectedElement,
    onSelectElement,
    onUpdateElement,
    onRemoveElement,
    isDarkMode,
    onAddElement,
  } = props;

  // Estado para zoom independiente por dispositivo
  const [deviceZooms, setDeviceZooms] = useState<Record<string, number>>({
    samsungA10: 1,
    realme8_5g: 1,
    samsungS22Ultra: 1,
  });

  const currentDevice = devices.find((d) => d.id === deviceType) || devices[0];
  const currentZoom = deviceZooms[deviceType] || 1;

  // Funciones para controlar el zoom
  const handleZoomIn = () => {
    setDeviceZooms(prev => ({
      ...prev,
      [deviceType]: Math.min((prev[deviceType] || 1) + 0.1, 2)
    }));
  };

  const handleZoomOut = () => {
    setDeviceZooms(prev => ({
      ...prev,
      [deviceType]: Math.max((prev[deviceType] || 1) - 0.1, 0.5)
    }));
  };

  const resetZoom = () => {
    setDeviceZooms(prev => ({
      ...prev,
      [deviceType]: 1
    }));
  };

  const handleDrop = (item: { type: string }, monitor: any) => {
    const offset = monitor.getClientOffset();
    if (offset && onAddElement) {
      const phoneContainer = document
        .getElementById("phone-container")
        ?.getBoundingClientRect();
      const phoneScreen = document
        .getElementById("phone-screen")
        ?.getBoundingClientRect();

      if (phoneContainer && phoneScreen) {
        // Ajustar las coordenadas según el zoom
        const x = Math.round(((offset.x - phoneScreen.left) / currentZoom) / 20) * 20;
        const y = Math.round(((offset.y - phoneScreen.top) / currentZoom) / 20) * 20;

        // Only add if within phone screen bounds (ajustado por zoom)
        const scaledWidth = (phoneScreen.width / currentZoom);
        const scaledHeight = (phoneScreen.height / currentZoom);
        
        if (
          x >= 0 &&
          x <= scaledWidth &&
          y >= 0 &&
          y <= scaledHeight
        ) {
          onAddElement(item.type as any, x, y);
        }
      }
    }
    return undefined;
  };

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "component",
    drop: handleDrop,
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const combinedRef = useCallback(
    (node: HTMLDivElement | null) => {
      drop(node);
    },
    [drop]
  );

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only deselect if clicking directly on the canvas, not on an element
    if (e.target === e.currentTarget) {
      onSelectElement(null);
    }
  };

  // Handle button clicks for navigation
  const handleElementClick = (element: DesignElement) => {
    if (
      element.type === "button" &&
      element.properties.navigateTo &&
      onNavigate
    ) {
      onNavigate(element.properties.navigateTo);
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-auto bg-transparent p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <span className="ml-2 rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
            Screen: {currentScreen.name}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          {/* Controles de Zoom */}
          <div className="flex items-center space-x-2 rounded-md border border-gray-300 bg-white px-3 py-1">
            <span className="text-xs font-medium text-gray-600">Zoom:</span>
            <button
              onClick={handleZoomOut}
              className="flex h-6 w-6 items-center justify-center rounded text-xs font-bold text-gray-700 hover:bg-gray-100"
              title="Zoom Out"
            >
              −
            </button>
            <span className="min-w-[3rem] text-center text-xs font-medium">
              {Math.round(currentZoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="flex h-6 w-6 items-center justify-center rounded text-xs font-bold text-gray-700 hover:bg-gray-100"
              title="Zoom In"
            >
              +
            </button>
            <button
              onClick={resetZoom}
              className="ml-1 rounded bg-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-300"
              title="Reset Zoom"
            >
              Reset
            </button>
          </div>
          
          {/* Selector de Dispositivo */}
          <div className="flex items-center space-x-2">
            <label
              htmlFor="device-select-canvas"
              className="text-sm font-medium text-gray-700"
            >
              Device:
            </label>
            <select
              id="device-select-canvas"
              value={deviceType}
              onChange={(e) => onDeviceChange(e.target.value as DeviceType)}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm"
            >
              {devices.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-auto">
        <div className="flex min-h-full min-w-full items-start justify-center pt-8">
          <div
            id="phone-container"
            className="relative"
            style={{
              width: `${currentDevice.width + 40}px`,
              height: `${currentDevice.height + 80}px`,
              transform: `scale(${currentZoom})`,
              transformOrigin: 'center',
              marginBottom: '2rem',
            }}
          >
            {/* Phone frame */}
            <div className="absolute inset-0 rounded-[40px] bg-gray-800 shadow-xl"></div>

            {/* Phone screen */}
            <div
              id="phone-screen"
              ref={combinedRef}
              className={`absolute inset-[10px] overflow-hidden rounded-[30px] ${
                isDarkMode ? "bg-gray-900" : "bg-white"
              } ${isOver ? "bg-blue-50" : ""}`}
              onClick={handleCanvasClick}
              style={{
                backgroundImage: isDarkMode
                  ? "none"
                  : "linear-gradient(to right, #ddd 1px, transparent 1px), linear-gradient(to bottom, #ddd 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            >
              <div className="relative h-full w-full">
                {/* Phone notch/camera holes - Device specific - INSIDE screen */}
                
                {/* Samsung Galaxy A10 - Teardrop notch (forma de gota) */}
                {(deviceType as string) === "samsungA10" && (
                  <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2">
                    {/* Notch en forma de gota - más ancho arriba, puntiagudo abajo */}
                    <div 
                      className="bg-black"
                      style={{
                        width: '20px',
                        height: '24px',
                        borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                        clipPath: 'ellipse(10px 12px at 50% 45%)'
                      }}
                    ></div>
                  </div>
                )}
                
                {/* Realme 8 5G - Punch hole camera (left side) */}
                {(deviceType as string) === "realme8_5g" && (
                  <div className="absolute left-6 top-3 z-10 h-3 w-3 rounded-full bg-black"></div>
                )}
                
                {/* Samsung Galaxy S22 Ultra - Punch hole camera (centrado) */}
                {(deviceType as string) === "samsungS22Ultra" && (
                  <div className="absolute left-1/2 top-3 z-10 h-3 w-3 -translate-x-1/2 rounded-full bg-black"></div>
                )}

                {elements.map((element) => (
                  <div
                    key={element.id}
                    onClick={() => handleElementClick(element)}
                    className={
                      element.type === "button" && element.properties.navigateTo
                        ? "cursor-pointer"
                        : ""
                    }
                  >
                    <CanvasElement
                      key={element.id}
                      element={element}
                      isSelected={selectedElement?.id === element.id}
                      onSelect={() => onSelectElement(element)}
                      onUpdate={(updates) => onUpdateElement(element.id, updates)}
                      onRemove={() => onRemoveElement(element.id)}
                      isDarkMode={isDarkMode}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Home indicator (for modern phones) */}
            <div className="absolute bottom-3 left-1/2 h-1 w-32 -translate-x-1/2 rounded-full bg-gray-700"></div>
          </div>
        </div>
      </div>
    </div>
  );
}