"use client";

import React from "react";
import { useDrop } from "react-dnd";
import type {
  ComponentType,
  DesignElement,
  DeviceType,
  Screen,
} from "@/lib/types";
import CanvasElement from "./canvas-element";
import { useCallback, useState, useRef } from "react";
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

// Factor de escala base para mostrar los dispositivos en el canvas
// Ajustamos la escala base según el tamaño del dispositivo para que se vean proporcionalmente correctos
const getBaseScale = (deviceWidth: number) => {
  // Escalar inversamente proporcional al ancho del dispositivo
  // Los dispositivos más grandes tendrán una escala menor
  if (deviceWidth <= 360) return 0.8;  // A10, Realme 8
  if (deviceWidth <= 400) return 0.7;  // Dispositivos medianos
  return 0.6;  // S22 Ultra
};

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

  // Estado para posición del celular (pan/drag)
  const [devicePositions, setDevicePositions] = useState<Record<string, { x: number; y: number }>>({
    samsungA10: { x: 0, y: 0 },
    realme8_5g: { x: 0, y: 0 },
    samsungS22Ultra: { x: 0, y: 0 },
  });

  // Estado para controlar el arrastre
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });
  
  const canvasRef = useRef<HTMLDivElement>(null);

  const currentDevice = devices.find((d) => d.id === deviceType) || devices[0];
  const currentZoom = deviceZooms[deviceType] || 1;
  const currentPosition = devicePositions[deviceType] || { x: 0, y: 0 };

  // Calcular el factor de escala real basado en el dispositivo actual
  const baseScale = getBaseScale(currentDevice.width);
  const deviceScale = baseScale * currentZoom;

  // Funciones para controlar el zoom
  const handleZoomIn = () => {
    setDeviceZooms(prev => ({
      ...prev,
      [deviceType]: Math.min((prev[deviceType] || 1) + 0.1, 3)
    }));
  };

  const handleZoomOut = () => {
    setDeviceZooms(prev => ({
      ...prev,
      [deviceType]: Math.max((prev[deviceType] || 1) - 0.1, 0.3)
    }));
  };

  const resetZoom = () => {
    setDeviceZooms(prev => ({
      ...prev,
      [deviceType]: 1
    }));
  };

  // Función para resetear posición
  const resetPosition = () => {
    setDevicePositions(prev => ({
      ...prev,
      [deviceType]: { x: 0, y: 0 }
    }));
  };

  // Funciones para manejar el arrastre del celular
  const handleMouseDown = (e: React.MouseEvent) => {
    // Solo permitir arrastre si se hace clic en el frame del celular, no en la pantalla
    const target = e.target as HTMLElement;
    if (target.id === 'phone-screen' || target.closest('#phone-screen')) {
      return; // No permitir arrastre si se hace clic en la pantalla
    }

    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialPosition(currentPosition);
    e.preventDefault();
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    setDevicePositions(prev => ({
      ...prev,
      [deviceType]: {
        x: initialPosition.x + deltaX,
        y: initialPosition.y + deltaY
      }
    }));
  }, [isDragging, dragStart, initialPosition, deviceType]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Event listeners para el arrastre
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleDrop = (item: { type: string }, monitor: any) => {
    const offset = monitor.getClientOffset();
    if (offset && onAddElement) {
      const phoneScreen = document
        .getElementById("phone-screen")
        ?.getBoundingClientRect();

      if (phoneScreen) {
        // Ajustar las coordenadas según el zoom y la escala del dispositivo
        const x = Math.round(((offset.x - phoneScreen.left) / deviceScale) / 20) * 20;
        const y = Math.round(((offset.y - phoneScreen.top) / deviceScale) / 20) * 20;

        // Solo agregar si está dentro de los límites de la pantalla del teléfono
        if (
          x >= 0 &&
          x <= currentDevice.width &&
          y >= 0 &&
          y <= currentDevice.height
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

  // Escalar los elementos según el dispositivo actual
  const scaleElement = (element: DesignElement) => {
    return {
      ...element,
      // Los elementos mantienen sus posiciones y tamaños relativos al dispositivo
      // No necesitan escalar aquí porque el canvas ya aplica la escala
    };
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-black p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <span className="ml-2 rounded-md bg-black px-2 py-1 text-xs font-medium text-white">
            Screen: {currentScreen.name}
          </span>
          <span className="ml-2 rounded-md bg-gray-800 px-2 py-1 text-xs font-medium text-gray-300">
            {currentDevice.width} x {currentDevice.height}px
          </span>
        </div>
        <div className="flex items-center space-x-3">
          {/* Controles de Zoom y Posición */}
          <div className="flex items-center space-x-2 rounded-md border border-gray-600 bg-black px-3 py-1">
            <span className="text-xs font-medium text-gray-300">Zoom:</span>
            <button
              onClick={handleZoomOut}
              className="flex h-6 w-6 items-center justify-center rounded text-xs font-bold text-gray-300 hover:bg-gray-700 hover:text-white"
              title="Zoom Out"
            >
              −
            </button>
            <span className="min-w-[3rem] text-center text-xs font-medium text-white">
              {Math.round(currentZoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="flex h-6 w-6 items-center justify-center rounded text-xs font-bold text-gray-300 hover:bg-gray-700 hover:text-white"
              title="Zoom In"
            >
              +
            </button>
            <button
              onClick={resetZoom}
              className="ml-1 rounded bg-gray-700 px-2 py-1 text-xs text-gray-300 hover:bg-gray-400 hover:text-white"
              title="Reset Zoom"
            >
              Reset
            </button>
          </div>

          {/* Control de Posición */}
          <div className="flex items-center space-x-2 rounded-md border border-gray-600 bg-black px-3 py-1">
            <span className="text-xs font-medium text-gray-300">Position:</span>
            <button
              onClick={resetPosition}
              className="rounded bg-gray-700 px-2 py-1 text-xs text-gray-300 hover:bg-gray-400 hover:text-white"
              title="Center Device"
            >
              Center
            </button>
          </div>
          
          {/* Selector de Dispositivo */}
          <div className="flex items-center space-x-2">
            <label
              htmlFor="device-select-canvas"
              className="text-sm font-medium text-gray-300"
            >
              Device:
            </label>
            <select
              id="device-select-canvas"
              value={deviceType}
              onChange={(e) => onDeviceChange(e.target.value as DeviceType)}
              className="rounded-md border border-gray-600 bg-black px-3 py-1 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {devices.map((d) => (
                <option key={d.id} value={d.id} className="bg-black text-white">
                  {d.label} ({d.screenSize})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div 
        ref={canvasRef}
        className="flex flex-1 overflow-hidden relative bg-black rounded-lg"
        style={{ 
          cursor: isDragging ? 'grabbing' : 'default',
          backgroundImage: "linear-gradient(to right, #374151 1px, transparent 1px), linear-gradient(to bottom, #374151 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Guías de centro */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-px h-full bg-gray-600 opacity-20"></div>
            <div className="absolute w-full h-px bg-gray-600 opacity-20"></div>
          </div>

          <div
            id="phone-container"
            className="relative select-none"
            style={{
              width: `${(currentDevice.width + 40) * deviceScale}px`,
              height: `${(currentDevice.height + 80) * deviceScale}px`,
              transform: `translate(${currentPosition.x}px, ${currentPosition.y}px)`,
              cursor: isDragging ? 'grabbing' : 'grab',
              transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            }}
            onMouseDown={handleMouseDown}
          >
            {/* Phone frame */}
            <div 
              className="absolute inset-0 rounded-[40px] bg-gradient-to-b from-gray-700 to-gray-900 shadow-2xl pointer-events-auto"
              style={{
                boxShadow: '0 10px 40px rgba(0,0,0,0.5), inset 0 0 0 2px rgba(255,255,255,0.1)'
              }}
            ></div>

            {/* Phone screen */}
            <div
              id="phone-screen"
              ref={combinedRef}
              className={`absolute overflow-hidden pointer-events-auto ${
                isDarkMode ? "bg-gray-900" : "bg-white"
              } ${isOver ? "bg-blue-50" : ""}`}
              onClick={handleCanvasClick}
              style={{
                left: '20px',
                right: '20px',
                top: '40px',
                bottom: '40px',
                borderRadius: '20px',
                backgroundImage: isDarkMode
                  ? "none"
                  : "linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)",
                backgroundSize: `${20 * deviceScale}px ${20 * deviceScale}px`,
                cursor: 'default',
                transform: `scale(${deviceScale})`,
                transformOrigin: 'top left',
                width: `${currentDevice.width}px`,
                height: `${currentDevice.height}px`,
              }}
              onMouseDown={(e) => e.stopPropagation()} // Evitar que el arrastre se propague desde la pantalla
            >
              <div className="relative h-full w-full">
                {/* Phone notch/camera holes - Device specific */}
                
                {/* Samsung Galaxy A10 - Teardrop notch */}
                {(deviceType as string) === "samsungA10" && (
                  <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2">
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
                
                {/* Samsung Galaxy S22 Ultra - Punch hole camera (centered) */}
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
                      element={scaleElement(element)}
                      isSelected={selectedElement?.id === element.id}
                      onSelect={() => onSelectElement(element)}
                      onUpdate={(updates) => onUpdateElement(element.id, updates)}
                      onRemove={() => onRemoveElement(element.id)}
                      isDarkMode={isDarkMode}
                      deviceBounds={{ width: currentDevice.width, height: currentDevice.height }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Home indicator (scaled) */}
            <div 
              className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-gray-400"
              style={{
                width: `${100 * deviceScale}px`,
                height: `${4 * deviceScale}px`,
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}