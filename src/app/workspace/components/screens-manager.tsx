"use client"

import { useState, useMemo } from "react"
import type { Screen } from "@/lib/types"

interface ScreensManagerProps {
  screens: Screen[]
  currentScreenId: string
  onAddScreen: (name: string) => void
  onRenameScreen: (id: string, name: string) => void
  onDeleteScreen: (id: string) => void
  onSelectScreen: (id: string) => void
}

export default function ScreensManager({
  screens,
  currentScreenId,
  onAddScreen,
  onRenameScreen,
  onDeleteScreen,
  onSelectScreen,
}: ScreensManagerProps) {
  const [newScreenName, setNewScreenName] = useState("")
  const [editingScreenId, setEditingScreenId] = useState<string | null>(null)
  const [editingScreenName, setEditingScreenName] = useState("")
  const [scrollIndex, setScrollIndex] = useState(0)
  const maxVisible = 3

  // Calcular las pantallas visibles basadas en el índice de desplazamiento
  const visibleScreens = useMemo(() => {
    return screens.slice(scrollIndex, scrollIndex + maxVisible)
  }, [screens, scrollIndex])

  const handleAddScreen = () => {
    if (newScreenName.trim()) {
      onAddScreen(newScreenName.trim())
      setNewScreenName("")
      // Desplazar al final al añadir nueva pantalla
      setScrollIndex(Math.max(0, screens.length - maxVisible + 1))
    }
  }

  const startEditing = (screen: Screen) => {
    setEditingScreenId(screen.id)
    setEditingScreenName(screen.name)
  }

  const saveScreenName = () => {
    if (editingScreenId && editingScreenName.trim()) {
      onRenameScreen(editingScreenId, editingScreenName.trim())
      setEditingScreenId(null)
    }
  }

  const cancelEditing = () => {
    setEditingScreenId(null)
  }

  const handleDeleteScreen = (id: string) => {
    if (screens.length > 1) {
      const index = screens.findIndex(s => s.id === id)
      onDeleteScreen(id)
      
      // Ajustar el índice de desplazamiento si es necesario
      if (scrollIndex >= screens.length - 1) {
        setScrollIndex(Math.max(0, scrollIndex - 1))
      }
    } else {
      alert("You cannot delete the last screen.")
    }
  }

  const canScrollLeft = scrollIndex > 0
  const canScrollRight = scrollIndex + maxVisible < screens.length

  return (
    <div className="border-b border-transparent p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">        
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 flex-grow">
            <input
              type="text"
              value={newScreenName}
              onChange={(e) => setNewScreenName(e.target.value)}
              placeholder="New screen name"
              className="flex-1 min-w-[120px] rounded-md border border-gray-300 px-3 py-1.5 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddScreen()
              }}
            />
            <button
              onClick={handleAddScreen}
              disabled={!newScreenName.trim()}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
            >
              Add Screen
            </button>
          </div>
          
          <div className="flex items-center">
            {/* Botón de flecha izquierda */}
            <button
              onClick={() => setScrollIndex(prev => Math.max(0, prev - 1))}
              disabled={!canScrollLeft}
              className={`p-1 rounded-md ${
                canScrollLeft 
                  ? "text-gray-600 hover:bg-gray-100" 
                  : "text-gray-300 cursor-not-allowed"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Contenedor de pantallas visibles */}
            <div className="flex flex-nowrap gap-2 mx-1">
              {visibleScreens.map((screen) => (
                <div
                  key={screen.id}
                  className={`group relative flex items-center rounded-md border px-3 py-1 ${
                    screen.id === currentScreenId
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {editingScreenId === screen.id ? (
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={editingScreenName}
                        onChange={(e) => setEditingScreenName(e.target.value)}
                        className="w-24 rounded border-none bg-transparent p-0 text-sm focus:outline-none"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveScreenName()
                          if (e.key === "Escape") cancelEditing()
                        }}
                        onBlur={saveScreenName}
                      />
                      <button onClick={saveScreenName} className="ml-1 rounded p-1 text-green-600 hover:bg-green-100">
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
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </button>
                      <button onClick={cancelEditing} className="rounded p-1 text-red-600 hover:bg-red-100">
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
                    </div>
                  ) : (
                    <>
                      <span className="cursor-pointer text-sm" onClick={() => onSelectScreen(screen.id)}>
                        {screen.name}
                      </span>
                      <div className="ml-2 hidden space-x-1 group-hover:flex">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            startEditing(screen)
                          }}
                          className="rounded p-1 text-gray-500 hover:bg-gray-100"
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
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteScreen(screen.id)
                          }}
                          className="rounded p-1 text-gray-500 hover:bg-gray-100"
                          disabled={screens.length <= 1}
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
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
            
            {/* Botón de flecha derecha */}
            <button
              onClick={() => setScrollIndex(prev => prev + 1)}
              disabled={!canScrollRight}
              className={`p-1 rounded-md ${
                canScrollRight 
                  ? "text-gray-600 hover:bg-gray-100" 
                  : "text-gray-300 cursor-not-allowed"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}