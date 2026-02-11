"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface UIContextType {
    isGalleryOpen: boolean
    setIsGalleryOpen: (isOpen: boolean) => void
}

const UIContext = createContext<UIContextType | undefined>(undefined)

export function UIProvider({ children }: { children: ReactNode }) {
    const [isGalleryOpen, setIsGalleryOpen] = useState(false)

    return (
        <UIContext.Provider value={{ isGalleryOpen, setIsGalleryOpen }}>
            {children}
        </UIContext.Provider>
    )
}

export function useUI() {
    const context = useContext(UIContext)
    if (context === undefined) {
        throw new Error("useUI must be used within a UIProvider")
    }
    return context
}
