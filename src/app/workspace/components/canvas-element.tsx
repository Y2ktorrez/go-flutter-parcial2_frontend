"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import type { DesignElement } from "@/lib/types"
import { renderComponentPreview } from "@/lib/component-renderer"

interface CanvasElementProps {
  element: DesignElement
  isSelected: boolean
  onSelect: () => void
  onUpdate: (updates: Partial<DesignElement>) => void
  onMove?: (position: { x: number; y: number }) => void
  onRemove: () => void
  isDarkMode: boolean
}

export default function CanvasElement({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onMove,
  onRemove,
  isDarkMode,
}: CanvasElementProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const elementRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isSelected) {
      onSelect()
    }
    setIsDragging(true)
    setDragStart({
      x: e.clientX - (element.position?.x || 0),
      y: e.clientY - (element.position?.y || 0),
    })
    e.stopPropagation()
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return

      const newPosition = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      }

      // Actualizar la posición localmente
      onUpdate({ position: newPosition })

      // Notificar el movimiento
      onMove?.(newPosition)
    },
    [isDragging, dragStart.x, dragStart.y, onUpdate, onMove]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)

      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const Component = renderComponentPreview(element, isDarkMode)

  return (
    <div
      ref={elementRef}
      className={`absolute ${isSelected ? "ring-2 ring-blue-500" : ""}`}
      style={{
        transform: `translate(${element.position?.x || 0}px, ${
          element.position?.y || 0
        }px)`,
        cursor: isDragging ? "grabbing" : "grab",
        zIndex: isSelected ? 1 : "auto",
      }}
      onMouseDown={handleMouseDown}
    >
      {Component}
    </div>
  )
}
