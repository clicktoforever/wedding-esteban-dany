'use client'

import { useState } from 'react'
import WelcomeModal from './WelcomeModal'

export default function HelpButton() {
  const [showHelp, setShowHelp] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowHelp(true)}
        className="flex items-center space-x-2 px-4 py-2 bg-wedding-purple/10 hover:bg-wedding-purple/20 
                   text-wedding-purple rounded-lg transition-all duration-200 group"
        aria-label="Ayuda"
      >
        <svg 
          className="w-5 h-5 group-hover:scale-110 transition-transform" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
        <span className="hidden sm:inline text-sm font-medium tracking-wide">Ayuda</span>
      </button>

      {showHelp && (
        <WelcomeModal onClose={() => setShowHelp(false)} />
      )}
    </>
  )
}
