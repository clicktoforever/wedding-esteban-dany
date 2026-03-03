'use client'

import { useState, useEffect } from 'react'
import { CldImage } from 'next-cloudinary'
import { useUI } from '@/components/providers/UIProvider'

interface GalleryPhoto {
    src: string
    alt: string
    width: number
    height: number
}

interface Season {
    id: number
    title: string
    cover: {
        src: string
        alt: string
    }
    photos: GalleryPhoto[]
}

const seasonsData: Season[] = [
    {
        id: 1,
        title: "Temporada 1",
        cover: { src: "wedding/gallery/temp1/1", alt: "Portada Temporada 1" },
        photos: [
            "wedding/gallery/temp1/2", "wedding/gallery/temp1/4",
            "wedding/gallery/temp1/5", "wedding/gallery/temp1/6", "wedding/gallery/temp1/7",
            "wedding/gallery/temp1/8", "wedding/gallery/temp1/9"
        ].map(id => ({ src: id, alt: "Foto Temporada 1", width: 800, height: 1200 }))
    },
    {
        id: 2,
        title: "Temporada 2",
        cover: { src: "wedding/gallery/temp2/1", alt: "Portada Temporada 2" },
        photos: [
            "wedding/gallery/temp2/2", "wedding/gallery/temp2/3", "wedding/gallery/temp2/4",
            "wedding/gallery/temp2/5", "wedding/gallery/temp2/6", "wedding/gallery/temp2/7",
            "wedding/gallery/temp2/8"
        ].map(id => ({ src: id, alt: "Foto Temporada 2", width: 800, height: 1200 }))
    },
    {
        id: 3,
        title: "Temporada 3",
        cover: { src: "wedding/gallery/temp3/1", alt: "Portada Temporada 3" },
        photos: [
            "wedding/gallery/temp3/2", "wedding/gallery/temp3/3", "wedding/gallery/temp3/4",
            "wedding/gallery/temp3/5", "wedding/gallery/temp3/6", "wedding/gallery/temp3/7",
            "wedding/gallery/temp3/8"
        ].map(id => ({ src: id, alt: "Foto Temporada 3", width: 800, height: 1200 }))
    },
    {
        id: 4,
        title: "Temporada 4",
        cover: { src: "wedding/gallery/temp4/1", alt: "Portada Temporada 4" },
        photos: [
            "wedding/gallery/temp4/2", "wedding/gallery/temp4/3", "wedding/gallery/temp4/4",
            "wedding/gallery/temp4/5", "wedding/gallery/temp4/6", "wedding/gallery/temp4/7",
            "wedding/gallery/temp4/8", "wedding/gallery/temp4/9"
        ].map(id => ({ src: id, alt: "Foto Temporada 4", width: 800, height: 1200 }))
    },
    {
        id: 5,
        title: "Temporada 5",
        cover: { src: "wedding/gallery/temp5/1", alt: "Portada Temporada 5" },
        photos: [
            "wedding/gallery/temp5/2", "wedding/gallery/temp5/3", "wedding/gallery/temp5/4",
            "wedding/gallery/temp5/5"
        ].map(id => ({ src: id, alt: "Foto Temporada 5", width: 800, height: 1200 }))
    },
    {
        id: 6,
        title: "Temporada 6",
        cover: { src: "wedding/gallery/temp6/1", alt: "Portada Temporada 6" },
        photos: [
            "wedding/gallery/temp6/2", "wedding/gallery/temp6/3", "wedding/gallery/temp6/4",
            "wedding/gallery/temp6/5", "wedding/gallery/temp6/6", "wedding/gallery/temp6/7",
            "wedding/gallery/temp6/8", "wedding/gallery/temp6/9"
        ].map(id => ({ src: id, alt: "Foto Temporada 6", width: 800, height: 1200 }))
    },
    {
        id: 7,
        title: "Temporada 7",
        cover: { src: "wedding/gallery/temp7/1", alt: "Portada Temporada 7" },
        photos: [
            "wedding/gallery/temp7/IMG_3136", "wedding/gallery/temp7/IMG_6928", "wedding/gallery/temp7/IMG_6986",
            "wedding/gallery/temp7/IMG_7061", "wedding/gallery/temp7/cwpkgyuwq6ezbftkkjci", "wedding/gallery/temp7/h9rwlpy01tinvj3gmqry",
            "wedding/gallery/temp7/hefstxxtkvhjyz5mqxlw", "wedding/gallery/temp7/wn7duwj7toth2mqco96q"
        ].map(id => ({ src: id, alt: "Foto Temporada 7", width: 800, height: 1200 }))
    },
    {
        id: 8,
        title: "Próximamente...",
        cover: { src: "wedding/gallery/temp8/1", alt: "Portada Temporada 8" },
        photos: [
            "wedding/gallery/temp8/2", "wedding/gallery/temp8/3", "wedding/gallery/temp8/4",
            "wedding/gallery/temp8/5", "wedding/gallery/temp8/6", "wedding/gallery/temp8/7",
            "wedding/gallery/temp8/8"
        ].map(id => ({ src: id, alt: "Foto Temporada 8", width: 1200, height: 800 }))
    }
]

export default function SeasonsGallery() {
    const [activeSeason, setActiveSeason] = useState<Season | null>(null)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [touchStart, setTouchStart] = useState<number | null>(null)
    const [touchEnd, setTouchEnd] = useState<number | null>(null)
    const { setIsGalleryOpen } = useUI()

    // Prevenir scroll cuando el lightbox está abierto y notificar el estado
    useEffect(() => {
        if (activeSeason) {
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
    }, [activeSeason, setIsGalleryOpen])

    // Navegación con teclado
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!activeSeason) return

            if (e.key === 'Escape') {
                setActiveSeason(null)
            } else if (e.key === 'ArrowRight') {
                handleNext()
            } else if (e.key === 'ArrowLeft') {
                handlePrevious()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [activeSeason, currentIndex])

    const activePhotos = activeSeason
        ? [
            { src: activeSeason.cover.src, alt: activeSeason.cover.alt, width: 800, height: 1200 }, // Cover will use the same dimensions logic (vertical except season 8)
            ...activeSeason.photos
        ]
        : []

    const openLightbox = (season: Season) => {
        setActiveSeason(season)
        setCurrentIndex(0)
    }

    const handleNext = () => {
        if (!activeSeason) return
        setCurrentIndex((prev) => (prev + 1) % activePhotos.length)
    }

    const handlePrevious = () => {
        if (!activeSeason) return
        setCurrentIndex((prev) => (prev - 1 + activePhotos.length) % activePhotos.length)
    }

    const closeLightbox = () => {
        setActiveSeason(null)
    }

    // Swipe handlers
    const minSwipeDistance = 50

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null)
        setTouchStart(e.targetTouches[0].clientX)
    }

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX)
    }

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return

        const distance = touchStart - touchEnd
        const isLeftSwipe = distance > minSwipeDistance
        const isRightSwipe = distance < -minSwipeDistance

        if (isLeftSwipe || isRightSwipe) {
            if (isLeftSwipe) {
                handleNext()
            } else {
                handlePrevious()
            }
        }
    }

    return (
        <>
            {/* Seasons Grid */}
            <div className="grid grid-cols-2 gap-3 lg:gap-5 xl:gap-6 mx-auto lg:max-w-4xl">
                {seasonsData.map((season) => (
                    <div
                        key={season.id}
                        onClick={() => openLightbox(season)}
                        className="relative h-56 md:h-72 lg:h-96 w-full rounded-xl lg:rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer"
                    >
                        <CldImage
                            src={season.cover.src}
                            alt={season.cover.alt}
                            fill
                            format="webp"
                            quality="50"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        {/* Overlay for Season Title */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end">
                            <span className="text-white font-medium p-4 text-sm md:text-lg">
                                {season.title}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Lightbox Modal */}
            {activeSeason && (
                <div
                    className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4 touch-none"
                    onClick={closeLightbox}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >
                    {/* Preload adjacent images for smooth swiping */}
                    <div className="hidden">
                        {activePhotos[currentIndex - 1 >= 0 ? currentIndex - 1 : activePhotos.length - 1] && (
                            <CldImage
                                src={activePhotos[currentIndex - 1 >= 0 ? currentIndex - 1 : activePhotos.length - 1].src}
                                alt="Preload Previous"
                                width={800}
                                height={1200}
                                format="webp"
                                quality="50"
                                preload={true}
                            />
                        )}
                        {activePhotos[(currentIndex + 1) % activePhotos.length] && (
                            <CldImage
                                src={activePhotos[(currentIndex + 1) % activePhotos.length].src}
                                alt="Preload Next"
                                width={800}
                                height={1200}
                                format="webp"
                                quality="50"
                                preload={true}
                            />
                        )}
                    </div>
                    {/* Top Bar Navigation */}
                    <div className="absolute top-0 w-full flex justify-between items-center p-4 lg:p-6 z-50">
                        <div className="text-white text-sm lg:text-base font-medium">
                            {activeSeason.title} ({currentIndex + 1} / {activePhotos.length})
                        </div>
                        {/* Close Button */}
                        <button
                            onClick={closeLightbox}
                            className="text-white/80 hover:text-white transition-colors bg-white/10 rounded-full p-2 backdrop-blur-sm"
                            aria-label="Cerrar galería"
                        >
                            <svg className="w-6 h-6 lg:w-8 lg:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Navigation Area */}
                    <div className="absolute inset-0 flex items-center justify-between px-2 lg:px-8 z-40 pointer-events-none">
                        {/* Previous Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                handlePrevious()
                            }}
                            className="pointer-events-auto text-white/50 hover:text-white transition-all bg-black/50 hover:bg-black/80 rounded-full p-3 lg:p-4 backdrop-blur-sm"
                            aria-label="Imagen anterior"
                        >
                            <svg className="w-5 h-5 lg:w-8 lg:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        {/* Next Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                handleNext()
                            }}
                            className="pointer-events-auto text-white/50 hover:text-white transition-all bg-black/50 hover:bg-black/80 rounded-full p-3 lg:p-4 backdrop-blur-sm"
                            aria-label="Siguiente imagen"
                        >
                            <svg className="w-5 h-5 lg:w-8 lg:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* Current Image */}
                    <div
                        className="relative w-full h-[85vh] flex items-center justify-center mt-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative w-full h-full max-w-5xl pointer-events-auto">
                            <CldImage
                                src={activePhotos[currentIndex].src}
                                alt={activePhotos[currentIndex].alt}
                                fill
                                format="webp"
                                quality="50"
                                className="object-contain"
                                sizes="(max-width: 1024px) 100vw, 1024px"
                                preload={true}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
