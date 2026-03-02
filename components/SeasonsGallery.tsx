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
        cover: { src: "wpmeebxk5vd3zirbr3ui", alt: "Portada Temporada 1" },
        photos: [
            "nghvbqcczjqfxu8ejk6f", "vdafn5ymtnp0tjzfql2b",
            "qqayuatj3igyoapxqe0h", "qrt0btyarnh1jizgb5sp", "g4g6vpqlc91s56wir8lh",
            "uxc3lyu62qguqjmeimab", "d2krbdm1eot0qpzdricj"
        ].map(id => ({ src: id, alt: "Foto Temporada 1", width: 800, height: 1200 }))
    },
    {
        id: 2,
        title: "Temporada 2",
        cover: { src: "use5zywerth9cpjdcbop", alt: "Portada Temporada 2" },
        photos: [
            "qufdu0rbriqsluy7ohwc", "xs2hxfc3ohs77yeshxns", "vyaxnzloo0tq0t3pb5sm",
            "v6djhifxn1xrdk1qgxyd", "epbzo27ssvphvgupn3g1", "gcinojpiowd88exkuimh",
            "pkivqpbzkxct7vzfr0a1"
        ].map(id => ({ src: id, alt: "Foto Temporada 2", width: 800, height: 1200 }))
    },
    {
        id: 3,
        title: "Temporada 3",
        cover: { src: "iz8sjtk8qw8bbnjc26ek", alt: "Portada Temporada 3" },
        photos: [
            "juhlgdnkrzsuv43sq2i2", "dbremksyxjqtrtpgpfho", "olpdvdvef83qg3e9a6p6",
            "xny1qpvuk0qgtdhqsenb", "i3g5evllunhanhtagxsu", "ima2tfkrzhq5ztbltd41",
            "kcbsmytt44br88qlnmaz"
        ].map(id => ({ src: id, alt: "Foto Temporada 3", width: 800, height: 1200 }))
    },
    {
        id: 4,
        title: "Temporada 4",
        cover: { src: "qp02c8l9queeam1xth3s", alt: "Portada Temporada 4" },
        photos: [
            "caprdpqubszsujk9ytjv", "egbndbzeerot5ebfhftt", "lfxwvufvig6r2qiadt0q",
            "zqoykkuwnny8tvz2xcvb", "fm1cuuql3avga9m8f2zi", "gmehhccnschud2acxcg6",
            "xhzhsvzknnqj1bdrnhch", "n1yfzgm11bl1degezy08"
        ].map(id => ({ src: id, alt: "Foto Temporada 4", width: 800, height: 1200 }))
    },
    {
        id: 5,
        title: "Temporada 5",
        cover: { src: "ciasctujio3u30lk1kns", alt: "Portada Temporada 5" },
        photos: [
            "o312rcyofntkqw7uvfen", "gcy8a8poyqckhteeyknd", "a44gbozfgb16uke7qbwu",
            "sbwsuodrcx62ha213nh8"
        ].map(id => ({ src: id, alt: "Foto Temporada 5", width: 800, height: 1200 }))
    },
    {
        id: 6,
        title: "Temporada 6",
        cover: { src: "xgfzqy9wqazbn8kszwjy", alt: "Portada Temporada 6" },
        photos: [
            "efedizqn9amttq6uckaq", "ghnxmxuvurv7vx92twvf", "vfijv2goroorwetkyw4j",
            "rmei0igi2qyqsgkbsfvf", "p9myae2scibwc4ndgdqw", "hnsujkjobac4qadzmr3w",
            "gx0tvrfg3rmxqijcb9kp", "jz51gdlplrielendkw5c"
        ].map(id => ({ src: id, alt: "Foto Temporada 6", width: 800, height: 1200 }))
    },
    {
        id: 7,
        title: "Temporada 7",
        cover: { src: "nxcwhiv511ll958ddtvg", alt: "Portada Temporada 7" },
        photos: [
            "bdvgtnx7nfalxi0bodyv", "ifcvxyqspvhylbhjq4yu", "tih3ae8p0fgzsfayzx85",
            "rngp154egj3jxxfaphek"
        ].map(id => ({ src: id, alt: "Foto Temporada 7", width: 800, height: 1200 }))
    },
    {
        id: 8,
        title: "Próximamente...",
        cover: { src: "arhsld5yhlaorxkvtclu", alt: "Portada Temporada 8" },
        photos: [
            "szltdpx0zszhyaz478gb", "wxpcvubsjojrupyjelev", "a09rv5bhe3mrb0qaxsye",
            "hin8azfwjsqkyvj8rvkq", "clwjw5v620aby02etr9r", "j0hqx7jnqgnyxyzdfdjv",
            "wlfyjvawpaind7ggw30c"
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
                                priority
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
                                priority
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
                                priority
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
