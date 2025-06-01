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
}

export default function CanvasElement({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onRemove,
  isDarkMode,
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
    setDragStart({ x: e.clientX - element.x, y: e.clientY - element.y })
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

  const constrainToScreen = (x: number, y: number, width: number, height: number) => {
    const phoneScreen = document.getElementById("phone-screen")?.getBoundingClientRect()
    if (!phoneScreen) return { x, y }

    // Get screen dimensions
    const screenWidth = phoneScreen.width
    const screenHeight = phoneScreen.height

    // Constrain x and y to stay within screen bounds
    const constrainedX = Math.max(0, Math.min(x, screenWidth - width))
    const constrainedY = Math.max(0, Math.min(y, screenHeight - height))

    return { x: constrainedX, y: constrainedY }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      // Snap to grid (20px)
      const newX = Math.round((e.clientX - dragStart.x) / 20) * 20
      const newY = Math.round((e.clientY - dragStart.y) / 20) * 20

      // Constrain to screen bounds
      const { x: constrainedX, y: constrainedY } = constrainToScreen(newX, newY, element.width, element.height)

      onUpdate({ x: constrainedX, y: constrainedY })
    } else if (isResizing) {
      const deltaX = e.clientX - resizeStart.x
      const deltaY = e.clientY - resizeStart.y

      // Snap to grid (20px)
      const newWidth = Math.max(20, Math.round((resizeStart.width + deltaX) / 20) * 20)
      const newHeight = Math.max(20, Math.round((resizeStart.height + deltaY) / 20) * 20)

      // Get phone screen dimensions
      const phoneScreen = document.getElementById("phone-screen")?.getBoundingClientRect()
      if (phoneScreen) {
        // Constrain width and height to stay within screen bounds
        const maxWidth = phoneScreen.width - element.x
        const maxHeight = phoneScreen.height - element.y

        const constrainedWidth = Math.min(newWidth, maxWidth)
        const constrainedHeight = Math.min(newHeight, maxHeight)

        onUpdate({ width: constrainedWidth, height: constrainedHeight })
      } else {
        onUpdate({ width: newWidth, height: newHeight })
      }
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setIsResizing(false)
  }

  // Add and remove event listeners using useEffect
  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, isResizing, dragStart, resizeStart])

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

          <div
            className="absolute -bottom-2 -right-2 h-4 w-4 cursor-se-resize bg-blue-500"
            onMouseDown={handleResizeMouseDown}
          />

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
