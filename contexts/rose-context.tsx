"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getUserRoses } from "@/actions/rose-actions"

type RoseContextType = {
  roseCount: number
  updateRoseCount: (newCount: number) => void
  refreshRoseCount: () => Promise<void>
}

const RoseContext = createContext<RoseContextType | undefined>(undefined)

export function RoseProvider({ children }: { children: ReactNode }) {
  const [roseCount, setRoseCount] = useState(0)

  const updateRoseCount = (newCount: number) => {
    setRoseCount(newCount)
  }

  const refreshRoseCount = async () => {
    const count = await getUserRoses()
    setRoseCount(count)
  }

  // Initialize rose count
  useEffect(() => {
    refreshRoseCount()
  }, [])

  return (
    <RoseContext.Provider value={{ roseCount, updateRoseCount, refreshRoseCount }}>{children}</RoseContext.Provider>
  )
}

export function useRoses() {
  const context = useContext(RoseContext)
  if (context === undefined) {
    throw new Error("useRoses must be used within a RoseProvider")
  }
  return context
}
