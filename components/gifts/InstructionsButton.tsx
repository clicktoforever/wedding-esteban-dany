'use client'

import { useState } from 'react'
import InstructionsModal from './InstructionsModal'

export default function InstructionsButton() {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        className="w-10 h-10 rounded-full border border-primary/10 flex items-center justify-center bg-white hover:bg-primary/5 transition-colors group"
        aria-label="Ver instrucciones"
      >
        <span className="material-symbols-outlined text-primary text-[20px] group-hover:scale-110 transition-transform">
          help
        </span>
      </button>

      <InstructionsModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </>
  )
}
