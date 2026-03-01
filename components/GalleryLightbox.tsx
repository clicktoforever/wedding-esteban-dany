'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useUI } from '@/components/providers/UIProvider'

interface GalleryImage {
  src: string
  alt: string
  width: number
  height: number
}

interface GalleryLightboxProps {
  images: GalleryImage[]
}

export default function GalleryLightbox({ images }: GalleryLightboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const { setIsGalleryOpen } = useUI()

  // Prevenir scroll cuando el lightbox está abierto y notificar el estado
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setIsGalleryOpen(true)
    } else {
      document.body.style.overflow = 'unset'
      setIsGalleryOpen(false)
    }
    return () => {
      document.body.style.overflow = 'unset'
      setIsGalleryOpen(false)
    }
  }, [isOpen, setIsGalleryOpen])

  // Navegación con teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.key === 'Escape') {
        setIsOpen(false)
      } else if (e.key === 'ArrowRight') {
        handleNext()
      } else if (e.key === 'ArrowLeft') {
        handlePrevious()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentIndex])

  const openLightbox = (index: number) => {
    setCurrentIndex(index)
    setIsOpen(true)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const closeLightbox = () => {
    setIsOpen(false)
  }

  return (
    <>
      {/* Gallery Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5 xl:gap-6 mb-8 lg:mx-auto lg:max-w-6xl">
        {images.map((image, index) => (
          <div
            key={index}
            onClick={() => openLightbox(index)}
            className={`
              ${index === 0 ? 'col-span-2 lg:col-span-4 h-64 lg:h-80 xl:h-96' : 'h-40 lg:h-56 xl:h-64 lg:col-span-2'}
              rounded-xl lg:rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer
            `}
          >
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              sizes="(max-width: 1024px) 50vw, 25vw"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-50 text-white hover:text-gray-300 transition-colors"
            aria-label="Cerrar galería"
          >
            <svg className="w-8 h-8 lg:w-10 lg:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white text-sm lg:text-base font-light">
            {currentIndex + 1} / {images.length}
          </div>

          {/* Previous Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              handlePrevious()
            }}
            className="absolute left-4 text-white hover:text-gray-300 transition-colors z-50 bg-black/50 rounded-full p-2 lg:p-3"
            aria-label="Imagen anterior"
          >
            <svg className="w-6 h-6 lg:w-8 lg:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Current Image */}
          <div
            className="relative max-w-7xl max-h-[90vh] px-16 lg:px-20"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[currentIndex].src}
              alt={images[currentIndex].alt}
              width={1200}
              height={800}
              className="max-h-[90vh] w-auto object-contain"
              priority
            />
          </div>

          {/* Next Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleNext()
            }}
            className="absolute right-4 text-white hover:text-gray-300 transition-colors z-50 bg-black/50 rounded-full p-2 lg:p-3"
            aria-label="Siguiente imagen"
          >
            <svg className="w-6 h-6 lg:w-8 lg:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Image Name */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm lg:text-base text-center px-4">
            {images[currentIndex].alt}
          </div>
        </div>
      )}
    </>
  )
}
