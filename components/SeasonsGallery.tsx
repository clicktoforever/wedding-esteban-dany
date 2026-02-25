'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
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
        cover: { src: "wedding/xf5oyoezdyohmp2nt8ia.jpg", alt: "Portada Temporada 1" },
        photos: Array(3).fill({
            src: "wedding/dmxf3yjymqstzu5hvv1t.jpg",
            alt: "Foto Temporada 1",
            width: 800,
            height: 1200
        })
    },
    {
        id: 2,
        title: "Temporada 2",
        cover: { src: "wedding/n9fthw3o3ebfdvh4uhfn.jpg", alt: "Portada Temporada 2" },
        photos: Array(3).fill({
            src: "wedding/e8jkm04idkpbohxit7b2.jpg",
            alt: "Foto Temporada 2",
            width: 800,
            height: 1200
        })
    },
    {
        id: 3,
        title: "Temporada 3",
        cover: { src: "wedding/wrkuifa44f9keea005ns.jpg", alt: "Portada Temporada 3" },
        photos: Array(3).fill({
            src: "wedding/oor15ezyy3skk0wq7upy.jpg",
            alt: "Foto Temporada 3",
            width: 800,
            height: 1200
        })
    },
    {
        id: 4,
        title: "Temporada 4",
        cover: { src: "wedding/ydirwodpm5lss2izou17.jpg", alt: "Portada Temporada 4" },
        photos: Array(3).fill({
            src: "wedding/tk5lhhoduxlheruekqdy.jpg",
            alt: "Foto Temporada 4",
            width: 800,
            height: 1200
        })
    },
    {
        id: 5,
        title: "Temporada 5",
        cover: { src: "wedding/gahmy1eqb8k2d0llkdso.jpg", alt: "Portada Temporada 5" },
        photos: Array(3).fill({
            src: "wedding/tk5lhhoduxlheruekqdy.jpg",
            alt: "Foto Temporada 5",
            width: 800,
            height: 1200
        })
    },
    {
        id: 6,
        title: "Temporada 6",
        cover: { src: "wedding/kfummqqeypi9vu6l7bhw.jpg", alt: "Portada Temporada 6" },
        photos: Array(3).fill({
            src: "wedding/ojejzu9ljemlt7tizl39.jpg",
            alt: "Foto Temporada 6",
            width: 800,
            height: 1200
        })
    },
    {
        id: 7,
        title: "Temporada 7",
        cover: { src: "wedding/ifyxum4xrpumpp3klle7.jpg", alt: "Portada Temporada 7" },
        photos: Array(3).fill({
            src: "wedding/t6whyeuyxquxipkrerq8.jpg",
            alt: "Foto Temporada 7",
            width: 800,
            height: 1200
        })
    },
    {
        id: 8,
        title: "Temporada 8",
        cover: { src: "wedding/slmvwyh3y4k6xhfubwcp.jpg", alt: "Portada Temporada 8" },
        photos: Array(3).fill({
            src: "wedding/yul2vhlvkt6qv5nbfrul.jpg",
            alt: "Foto Temporada 8",
            width: 1200,
            height: 800
        })
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
                            className={`object-cover transition-transform duration-500 ${season.id !== 8 ? 'rotate-90 scale-[1.35] group-hover:scale-[1.5]' : 'group-hover:scale-105'}`}
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
                        {activeSeason.id === 8 ? (
                            <div className="relative w-full h-full max-w-5xl pointer-events-auto">
                                <CldImage
                                    src={activePhotos[currentIndex].src}
                                    alt={activePhotos[currentIndex].alt}
                                    fill
                                    className="object-contain"
                                    sizes="100vw"
                                    priority
                                />
                            </div>
                        ) : (
                            <div
                                className="relative pointer-events-auto rotate-90"
                                style={{
                                    height: 'min(calc(100vw - 32px), calc(85vh * 0.6666))',
                                    width: 'min(calc((100vw - 32px) * 1.5), 85vh)'
                                }}
                            >
                                <CldImage
                                    src={activePhotos[currentIndex].src}
                                    alt={activePhotos[currentIndex].alt}
                                    fill
                                    className="object-contain"
                                    sizes="100vw"
                                    priority
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
