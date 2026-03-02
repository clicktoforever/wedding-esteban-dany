'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { CldImage } from 'next-cloudinary'
import { Plane, PartyPopper, ArrowRight, Check } from 'lucide-react'

interface InstructionsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function InstructionsModal({ isOpen, onClose }: InstructionsModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [mounted, setMounted] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setCurrentSlide(0)
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleScroll = () => {
    if (carouselRef.current) {
      const scrollLeft = carouselRef.current.scrollLeft
      const slideWidth = carouselRef.current.offsetWidth
      const newSlide = Math.round(scrollLeft / slideWidth)
      setCurrentSlide(newSlide)
    }
  }

  const goToSlide = (index: number) => {
    if (carouselRef.current) {
      const slideWidth = carouselRef.current.offsetWidth
      carouselRef.current.scrollTo({
        left: slideWidth * index,
        behavior: 'smooth'
      })
    }
  }

  const handleNext = () => {
    if (currentSlide < 2) {
      goToSlide(currentSlide + 1)
    } else {
      onClose()
    }
  }

  if (!isOpen || !mounted) return null

  const modalContent = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-[400px] bg-white overflow-hidden flex flex-col shadow-2xl rounded-3xl animate-in zoom-in-95 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative z-20 flex w-full justify-end px-4 pt-4">
            {/* Close button removed */}
          </div>

          {/* Carousel */}
          <div
            ref={carouselRef}
            onScroll={handleScroll}
            className="flex-1 w-full overflow-x-auto snap-x snap-mandatory flex no-scrollbar z-10"
            style={{
              scrollBehavior: 'smooth',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {/* Slide 1: EL PROPÓSITO */}
            <div className="min-w-full w-full snap-center flex flex-col items-center justify-center px-8 pb-8 pt-2 text-center">
              <div className="w-24 h-24 mb-6 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <Plane size={48} strokeWidth={1.5} />
              </div>

              <span className="inline-block px-3 py-1 mb-4 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/5 rounded-full border border-primary/10 font-body">
                Aceptamos Tarjetas y Transferencias
              </span>

              <h2 className="text-2xl font-display font-bold text-gray-900 mb-3">
                Suma a nuestros sueños
              </h2>

              <p className="text-gray-500 text-sm leading-relaxed max-w-[280px] font-body">
                Elige un regalo y aporta la cantidad que desees. Todo suma para nuestra nueva vida.
              </p>
            </div>

            {/* Slide 2: LA RECOMPENSA */}
            <div className="min-w-full w-full snap-center flex flex-col items-center justify-center px-8 pb-8 pt-2 text-center">
              <div className="w-24 h-24 mb-4 relative drop-shadow-2xl animate-pulse-slow">
                <CldImage
                  src="wedding/icons/machicoin"
                  alt="Machi Coin"
                  fill
                  format="webp"
                  quality="50"
                  sizes="96px"
                  className="object-contain"
                />
              </div>

              <h2 className="text-2xl font-display font-bold text-gray-900 mb-3">
                Gana Machi Coins
              </h2>

              <p className="text-gray-500 text-sm leading-relaxed max-w-[280px] mb-4 font-body">
                Recibe monedas virtuales por cada aporte.
              </p>

              <div className="bg-yellow-50 border border-yellow-100 rounded-xl px-4 py-2">
                <span className="text-yellow-700 font-bold text-lg font-body">
                  $1 USD = 10 Monedas
                </span>
              </div>
            </div>

            {/* Slide 3: LA DIVERSIÓN */}
            <div className="min-w-full w-full snap-center flex flex-col items-center justify-center px-8 pb-8 pt-2 text-center">
              <div className="w-24 h-24 mb-6 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <PartyPopper size={48} strokeWidth={1.5} />
              </div>

              <h2 className="text-2xl font-display font-bold text-gray-900 mb-3">
                ¡Disfruta la fiesta! 🥂
              </h2>

              <p className="text-gray-500 text-sm leading-relaxed max-w-[280px] font-body">
                Usa tus monedas para canjear premios, tragos y sorpresas el día de la boda.
              </p>
            </div>
          </div>

          {/* Footer controls */}
          <div className="p-6 bg-white border-t border-gray-50">
            {/* Indicators */}
            <div className="flex justify-center gap-2 mb-6">
              {[0, 1, 2].map((index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === index ? 'w-6 bg-primary' : 'w-1.5 bg-gray-200'
                    }`}
                  aria-label={`Ir a slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Main Action Button */}
            <button
              onClick={handleNext}
              className="w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-lg bg-primary text-white hover:bg-primary/90 shadow-primary/25"
            >
              {currentSlide === 2 ? (
                <>
                  <span>Comenzar a Regalar</span>
                  <Check size={18} strokeWidth={2.5} />
                </>
              ) : (
                <>
                  <span>Siguiente</span>
                  <ArrowRight size={18} strokeWidth={2.5} />
                </>
              )}
            </button>
          </div>
        </div>

        <style jsx>{`
            .animate-pulse-slow {
                animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
            @keyframes pulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: .9; transform: scale(0.95); }
            }
        `}</style>
      </div>
    </>
  )

  return createPortal(modalContent, document.body)
}
