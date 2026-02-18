'use client'

import { useState } from 'react'
import InstructionsModal from './InstructionsModal'

export default function InstructionsButton() {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center bg-white hover:bg-gray-50 transition-colors group"
        aria-label="Ver instrucciones"
      >
        <span className="material-symbols-outlined text-[#4a4a4a] text-[20px] group-hover:scale-110 transition-transform">
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
