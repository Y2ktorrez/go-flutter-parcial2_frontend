'use client'

import React, { useEffect } from 'react'
import dynamic from 'next/dynamic'

const DesignerWorkspace = dynamic(
  () => import('./components/designer-workspace'),
  { ssr: false } // This will disable server-side rendering for this component
)

const WorkspacePage = () => {
  useEffect(() => {
    // Client-side only code can go here
  }, [])

  return (
    <main className="flex min-h-screen flex-col">
      <DesignerWorkspace />
    </main>
  )
}

export default WorkspacePage
