"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import type { DesignElement } from "@/lib/types"
import { renderComponentPreview } from "@/lib/component-renderer"

interface CanvasElementProps {
  element: DesignElement
  isSelected: boolean
  onSelect: () => void
  onUpdate: (updates: Partial<DesignElement>) => void
  onRemove: () => void
  isDarkMode: boolean
  deviceBounds?: { width: number; height: number }
}

export default function CanvasElement({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onRemove,
  isDarkMode,
  deviceBounds,
}: CanvasElementProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const elementRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect()
    setIsDragging(true)
    
    // Obtener la escala actual del phone-screen
    const phoneScreen = document.getElementById("phone-screen")
    const rect = phoneScreen?.getBoundingClientRect()
    
    if (phoneScreen && rect) {
      const computedStyle = window.getComputedStyle(phoneScreen)
      const transform = computedStyle.transform
      
      let scale = 1
      if (transform && transform !== 'none') {
        const matrixMatch = transform.match(/matrix\(([^,]+),/)
        if (matrixMatch) {
          scale = parseFloat(matrixMatch[1])
        }
      }
      
      // Ajustar el punto de inicio del drag según la escala
      setDragStart({ 
        x: (e.clientX - rect.left) / scale - element.x, 
        y: (e.clientY - rect.top) / scale - element.y 
      })
    }
  }

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsResizing(true)
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: element.width,
      height: element.height,
    })
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const phoneScreen = document.getElementById("phone-screen")
      const rect = phoneScreen?.getBoundingClientRect()
      
      if (phoneScreen && rect) {
        const computedStyle = window.getComputedStyle(phoneScreen)
        const transform = computedStyle.transform
        
        let scale = 1
        if (transform && transform !== 'none') {
          const matrixMatch = transform.match(/matrix\(([^,]+),/)
          if (matrixMatch) {
            scale = parseFloat(matrixMatch[1])
          }
        }
        
        // Calcular la nueva posición teniendo en cuenta la escala
        const newX = Math.round(((e.clientX - rect.left) / scale - dragStart.x) / 20) * 20
        const newY = Math.round(((e.clientY - rect.top) / scale - dragStart.y) / 20) * 20
        
        // Actualizar sin restricciones para permitir movimiento libre
        onUpdate({ x: newX, y: newY })
      }
    } else if (isResizing) {
      const deltaX = e.clientX - resizeStart.x
      const deltaY = e.clientY - resizeStart.y

      // Snap to grid (20px) con tamaño mínimo
      const newWidth = Math.max(40, Math.round((resizeStart.width + deltaX) / 20) * 20)
      const newHeight = Math.max(40, Math.round((resizeStart.height + deltaY) / 20) * 20)

      onUpdate({ width: newWidth, height: newHeight })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setIsResizing(false)
  }

  // Add and remove event listeners
  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
      
      // Prevenir selección de texto mientras arrastra
      document.body.style.userSelect = 'none'
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
      document.body.style.userSelect = ''
    }
  }, [isDragging, isResizing, dragStart, resizeStart, element.x, element.y])

  return (
    <div
      ref={elementRef}
      className={`absolute cursor-move ${isSelected ? "z-10" : ""}`}
      style={{
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: `${element.width}px`,
        height: `${element.height}px`,
      }}
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
      onMouseDown={handleMouseDown}
    >
      {renderComponentPreview(element, isDarkMode)}

      {isSelected && (
        <>
          <div className="absolute inset-0 border-2 border-blue-500 pointer-events-none" />

          {/* Resize handle */}
          <div
            className="absolute -bottom-2 -right-2 h-4 w-4 cursor-se-resize bg-blue-500"
            onMouseDown={handleResizeMouseDown}
          />

          {/* Delete button */}
          <button
            className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </>
      )}
    </div>
  )
}