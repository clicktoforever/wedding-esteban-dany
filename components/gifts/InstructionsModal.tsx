'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

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

  if (!isOpen || !mounted) return null

  const modalContent = (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div 
          className="relative w-full max-w-[500px] max-h-[75vh] bg-background-light overflow-hidden flex flex-col shadow-2xl rounded-2xl border border-gray-200 animate-in zoom-in-95 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Decorative gradient */}
          <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[50%] bg-gradient-to-b from-primary/5 to-transparent rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="relative z-20 flex flex-col w-full bg-background-light">
            {/* Close button */}
            <button 
              onClick={onClose}
              className="absolute right-5 top-5 p-2 rounded-full text-primary hover:bg-gray-100 transition-colors z-30"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>

            {/* Title */}
            <div className="flex flex-col items-center justify-center px-6 pt-6 pb-2 text-center">
              <h1 className="text-neutral-text tracking-tight text-[20px] font-bold italic leading-tight pb-2 font-display whitespace-nowrap">
                ¿Cómo hacerte presente?
              </h1>
              <p className="text-gray-600 text-xs font-normal leading-relaxed max-w-[280px]">
                Sigue estos pasos para compartir con nosotros en este día especial.
              </p>
            </div>
          </div>

          {/* Carousel */}
          <div 
            ref={carouselRef}
            onScroll={handleScroll}
            className="flex-1 w-full overflow-x-auto snap-x snap-mandatory flex no-scrollbar py-2 z-10"
            style={{
              scrollBehavior: 'smooth',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {/* Slide 1 */}
            <div className="min-w-full w-full snap-center flex flex-col items-center justify-center px-4 py-1">
              <div className="w-full h-full bg-white rounded-3xl border border-white/50 shadow-sm p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
                <div className="mb-4 w-20 h-20 flex items-center justify-center">
                  <img src="https://cdn.builder.io/api/v1/image/assets%2F7275fb28b3684652a493c6fd6532e314%2Fef239701b75245adb5a422193d961fb8" alt="Paso 1" className="w-full h-full object-contain" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2 italic font-display">Explora nuestros sueños</h2>
                <p className="text-xs text-gray-500 leading-relaxed max-w-[240px] font-sans font-normal">
                  Navega por las tarjetas. Cada una representa una meta, un viaje o un rincón de nuestro futuro hogar. Selecciona la que más te inspire.
                </p>
              </div>
            </div>

            {/* Slide 2 */}
            <div className="min-w-full w-full snap-center flex flex-col items-center justify-center px-4 py-1">
              <div className="w-full h-full bg-white rounded-3xl border border-white/50 shadow-sm p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
                <div className="mb-4 w-20 h-20 flex items-center justify-center">
                  <img src="https://cdn.builder.io/api/v1/image/assets%2F7275fb28b3684652a493c6fd6532e314%2F39c2bf773bca4113ad8ac0fc88bc2afc" alt="Paso 2" className="w-full h-full object-contain" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2 italic font-display">Suma tu granito de arena</h2>
                <p className="text-xs text-gray-500 leading-relaxed max-w-[260px] font-sans font-normal">
                  Al dar clic en &ldquo;Regalar&rdquo;, podrás escribirnos un mensaje y definir cuánto deseas aportar. Cualquier monto es recibido con inmensa gratitud. No tienes que comprar el regalo completo.
                </p>
              </div>
            </div>

            {/* Slide 3 */}
            <div className="min-w-full w-full snap-center flex flex-col items-center justify-center px-4 py-1">
              <div className="w-full h-full bg-white rounded-3xl border border-white/50 shadow-sm p-5 flex flex-col items-center justify-start text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
                <div className="mt-2 mb-3 w-16 h-16 flex items-center justify-center shrink-0">
                  <img src="https://cdn.builder.io/api/v1/image/assets%2F7275fb28b3684652a493c6fd6532e314%2Fb4effad617be42a0b7cf1833ab88c15f" alt="Paso 3" className="w-full h-full object-contain" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 italic shrink-0 font-display">Métodos Seguros</h2>
                <div className="w-full flex flex-col gap-3 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#d3c3db transparent' }}>
                  {/* Ecuador */}
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-background-light/50 border border-gray-100 hover:border-primary/30 transition-colors">
                    <div className="shadow-sm rounded-sm overflow-hidden h-6 w-8 flex items-center justify-center shrink-0">
                      <img src="https://cdn.builder.io/api/v1/image/assets%2F7275fb28b3684652a493c6fd6532e314%2F64df22a18b8b43a4a5595d6d361c5a67" alt="Ecuador" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex flex-col items-start text-left">
                      <span className="text-xs font-bold text-gray-800 uppercase tracking-wider font-sans">Ecuador ($ USD)</span>
                      <span className="text-[11px] text-gray-500 font-normal">Todas las tarjetas crédito/débito (Payphone) o Transferencia Banco Pichincha/Guayaquil etc.</span>
                    </div>
                  </div>
                  {/* Mexico */}
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-background-light/50 border border-gray-100 hover:border-primary/30 transition-colors">
                    <div className="shadow-sm rounded-sm overflow-hidden h-6 w-8 flex items-center justify-center shrink-0">
                      <img src="https://cdn.builder.io/api/v1/image/assets%2F7275fb28b3684652a493c6fd6532e314%2F1d9b808429724787af7bc584d9961030" alt="México" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex flex-col items-start text-left">
                      <span className="text-xs font-bold text-gray-800 uppercase tracking-wider font-sans">México ($ MXN)</span>
                      <span className="text-[11px] text-gray-500 font-normal">Transferencia SPEI a nuestra cuenta mexicana</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Slide 4 */}
            <div className="min-w-full w-full snap-center flex flex-col items-center justify-center px-4 py-1">
              <div className="w-full h-full bg-white rounded-3xl border border-white/50 shadow-sm p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
                <div className="mb-4 w-20 h-20 flex items-center justify-center">
                  <img src="https://cdn.builder.io/api/v1/image/assets%2F7275fb28b3684652a493c6fd6532e314%2F6b3ed7ebe67147e1ad06d3edc78458c0" alt="Paso 4" className="w-full h-full object-contain" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2 italic font-display">¡Celebremos!</h2>
                <p className="text-xs text-gray-500 leading-relaxed max-w-[260px] font-sans font-normal">
                  Si elegiste transferencia, podrás subir la foto del comprobante ahí mismo. Si usaste tarjeta, es automático. Al final, recibirás una confirmación inmediata.
                </p>
              </div>
            </div>
          </div>

          {/* Footer with indicators and button */}
          <div className="relative z-20 w-full bg-background-light pt-2 pb-8 px-6 flex flex-col gap-5">
            {/* Slide indicators */}
            <div className="flex w-full flex-row items-center justify-center gap-2.5 py-2">
              {[0, 1, 2, 3].map((index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`rounded-full transition-all ${
                    currentSlide === index 
                      ? 'h-2 w-6 bg-primary shadow-sm shadow-primary/40' 
                      : 'h-2 w-2 bg-secondary hover:bg-primary/30'
                  }`}
                  aria-label={`Ir a paso ${index + 1}`}
                />
              ))}
            </div>

            {/* CTA Button */}
            <button 
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 text-white text-sm font-semibold py-3 rounded-xl shadow-lg shadow-primary/20 font-sans"
            >
              <span>Comenzar a Regalar</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )

  return createPortal(modalContent, document.body)
}
