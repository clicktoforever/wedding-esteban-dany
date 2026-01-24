'use client'

import { useState, useEffect, useRef } from 'react'

interface WelcomeModalProps {
  onClose: () => void
}

export default function WelcomeModal({ onClose }: WelcomeModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  
  // Drag state for swipe to dismiss
  const [dragStartY, setDragStartY] = useState<number | null>(null)
  const [dragCurrentY, setDragCurrentY] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleClose = () => {
    onClose()
  }

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    // Prevent scroll on iOS Safari
    document.body.style.position = 'fixed'
    document.body.style.width = '100%'
    return () => {
      document.body.style.overflow = 'unset'
      document.body.style.position = 'unset'
      document.body.style.width = 'auto'
    }
  }, [])

  // Drag handlers for swipe to dismiss
  const handleDragStart = (clientY: number) => {
    setDragStartY(clientY)
    setIsDragging(true)
  }

  const handleDragMove = (clientY: number) => {
    if (dragStartY === null) return
    
    const diff = clientY - dragStartY
    // Only allow dragging down
    if (diff > 0) {
      setDragCurrentY(clientY)
      if (modalRef.current) {
        modalRef.current.style.transform = `translateY(${diff}px)`
      }
    }
  }

  const handleDragEnd = () => {
    if (dragStartY === null || dragCurrentY === null) {
      setIsDragging(false)
      setDragStartY(null)
      setDragCurrentY(null)
      return
    }

    const diff = dragCurrentY - dragStartY
    
    // Reset modal position
    if (modalRef.current) {
      modalRef.current.style.transform = ''
    }

    // If dragged down more than 180px, close the modal
    if (diff > 180) {
      handleClose()
    }

    setIsDragging(false)
    setDragStartY(null)
    setDragCurrentY(null)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-12 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-md"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div 
        ref={modalRef}
        className="relative z-10 w-full max-w-[430px] min-h-[calc(100vh-6rem)] bg-background-light rounded-t-[32px] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300"
        style={{ transition: isDragging ? 'none' : 'transform 0.5s ease-in-out' }}
      >
        {/* Handle Bar */}
        <div 
          className="flex flex-col items-center pt-4 pb-2 shrink-0 cursor-grab active:cursor-grabbing"
          onTouchStart={(e) => handleDragStart(e.touches[0].clientY)}
          onTouchMove={(e) => handleDragMove(e.touches[0].clientY)}
          onTouchEnd={handleDragEnd}
          onMouseDown={(e) => handleDragStart(e.clientY)}
          onMouseMove={(e) => isDragging && handleDragMove(e.clientY)}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
        >
          <div className="h-1.5 w-16 rounded-full bg-gray-300" />
        </div>

        <button
          onClick={handleClose}
          aria-label="Close"
          className="absolute top-5 right-5 z-20 p-2 rounded-full text-gray-500 hover:bg-black/5 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-8 no-scrollbar">
          <div className="flex flex-col items-center pt-8 pb-6 text-center">
            <div className="mb-6 h-14 w-14 rounded-full bg-accent/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-accent" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>

            <h1 className="font-display text-[28px] lg:text-3xl xl:text-4xl leading-[1.15] text-primary font-medium mb-5 transition-all duration-300">
              Bienvenido a nuestra <br/>
              <span className="italic text-primary font-display">Mesa de Regalos</span>
            </h1>

            <p className="text-gray-600 text-[15px] lg:text-base xl:text-lg leading-relaxed max-w-xs lg:max-w-sm xl:max-w-md mx-auto font-medium transition-all duration-300">
              Para facilitar su comodidad, hemos optado por una mesa de regalos tipo <span className="text-primary/80 font-bold">&lsquo;crowdfunding&rsquo;</span>. Pueden contribuir con el monto que deseen hacia los regalos que hemos seleccionado para nuestra nueva vida juntos.
            </p>
          </div>

          <div className="py-2 w-full">
            <div className="flex items-center gap-4 mb-5 opacity-60">
              <div className="h-px bg-accent/50 flex-1"></div>
              <h4 className="text-gray-500 text-xs font-bold uppercase tracking-[0.15em]">Métodos de Pago</h4>
              <div className="h-px bg-accent/50 flex-1"></div>
            </div>

            <div className="grid grid-cols-3 gap-3 lg:gap-4 xl:gap-5">
              <div className="group flex flex-col items-center justify-center gap-3 p-3 pt-4 lg:p-4 lg:pt-5 rounded-2xl bg-white border border-accent/20 shadow-sm hover:border-accent/50 transition-colors cursor-pointer">
                <div className="text-primary transition-transform group-hover:scale-110">
                  <svg className="w-7 h-7 lg:w-8 lg:h-8 xl:w-9 xl:h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div className="text-center">
                  <h3 className="text-xs lg:text-sm font-bold text-primary">Payphone</h3>
                  <p className="text-[10px] lg:text-xs text-gray-500 mt-0.5">Tarjetas</p>
                </div>
              </div>

              <div className="group flex flex-col items-center justify-center gap-3 p-3 pt-4 lg:p-4 lg:pt-5 rounded-2xl bg-white border border-accent/20 shadow-sm hover:border-accent/50 transition-colors cursor-pointer">
                <div className="text-primary transition-transform group-hover:scale-110">
                  <svg className="w-7 h-7 lg:w-8 lg:h-8 xl:w-9 xl:h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                  </svg>
                </div>
                <div className="text-center">
                  <h3 className="text-xs lg:text-sm font-bold text-primary">Ecuador</h3>
                  <p className="text-[10px] lg:text-xs text-gray-500 mt-0.5">Transferencia</p>
                </div>
              </div>

              <div className="group flex flex-col items-center justify-center gap-3 p-3 pt-4 lg:p-4 lg:pt-5 rounded-2xl bg-white border border-accent/20 shadow-sm hover:border-accent/50 transition-colors cursor-pointer">
                <div className="text-primary transition-transform group-hover:scale-110">
                  <svg className="w-7 h-7 lg:w-8 lg:h-8 xl:w-9 xl:h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <div className="text-center">
                  <h3 className="text-xs lg:text-sm font-bold text-primary">México</h3>
                  <p className="text-[10px] lg:text-xs text-gray-500 mt-0.5">Transferencia</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 pb-10 lg:pb-12 flex flex-col items-center gap-6 transition-all duration-300">
            <p className="font-display italic text-gray-500 text-sm lg:text-base xl:text-lg text-center opacity-80 transition-all duration-300">
              &ldquo;Gracias por ser parte de nuestra historia&rdquo;<br/>
              <span className="text-xs lg:text-sm font-body not-italic font-bold tracking-widest mt-1 block text-accent uppercase">— Esteban &amp; Dany —</span>
            </p>

            <button
              onClick={handleClose}
              className="w-full bg-primary hover:bg-[#2C4F32] active:scale-[0.98] transition-all text-white font-bold h-14 lg:h-16 rounded-xl text-base lg:text-lg shadow-xl shadow-primary/20 flex items-center justify-center gap-3 group"
            >
              <span>Comenzar a Regalar</span>
              <svg className="w-5 h-5 lg:w-6 lg:h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
