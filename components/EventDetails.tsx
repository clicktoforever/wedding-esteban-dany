"use client"

import Image from 'next/image'
import { Map, Navigation, User, Clock, Car, Wine, Pin, MapPin } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function EventDetails() {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    const images = [
        "https://cdn.builder.io/api/v1/image/assets%2F7275fb28b3684652a493c6fd6532e314%2F1f53f3fe3eee4969aa9ae6a68db621d2",
        "https://cdn.builder.io/api/v1/image/assets%2F7275fb28b3684652a493c6fd6532e314%2Fa7e2edd907e54831b10c9d079377820b",
        "https://cdn.builder.io/api/v1/image/assets%2F7275fb28b3684652a493c6fd6532e314%2F33a754f4a06f48d49fd6330047b4a020"
    ]

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length)
        }, 3000)

        return () => clearInterval(interval)
    }, [images.length])

    return (
        <section className="px-6 py-12 bg-secondary/10 rounded-t-[40px] border-t border-secondary/20 relative">
            <div className="text-center mb-8">
                <Map className="w-8 h-8 mx-auto text-primary mb-2" />
                <h2 className="font-display text-3xl text-gray-800">Detalles del Evento</h2>
            </div>

            <div className="space-y-6 max-w-md mx-auto">

                {/* Card 1: Ubicación (Hacienda Capelo) */}
                <div className="relative w-full h-80 rounded-2xl overflow-hidden shadow-lg group">
                    {images.map((src, index) => (
                        <Image
                            key={src}
                            src={src}
                            alt="Hacienda Venue"
                            fill
                            className={`object-cover transition-opacity duration-1000 ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
                            priority={index === 0}
                        />
                    ))}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10"></div>

                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Ceremonia & Recepción</span>
                    </div>

                    <div className="absolute bottom-0 left-0 w-full p-6 text-white">
                        <h3 className="font-display text-3xl mb-1">Hacienda Capelo</h3>
                        <p className="text-white/80 text-sm mb-6">Un lugar mágico para nuestro día especial</p>

                        <div className="flex gap-3">
                            <a
                                href="https://waze.com/ul/h6rbnnqze2"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 bg-white/90 hover:bg-white text-gray-900 py-2.5 px-2 rounded-lg text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
                            >
                                <div className="relative w-4 h-4 flex-shrink-0">
                                    <Image
                                        src="/icons/waze.svg"
                                        alt="Waze"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                                Ir con Waze
                            </a>
                            <a
                                href="https://maps.app.goo.gl/9mZ4UAuoyY9vHsHs6?g_st=ic"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 bg-primary/90 hover:bg-primary text-white py-2.5 px-2 rounded-lg text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-colors border border-white/20 whitespace-nowrap"
                            >
                                <MapPin className="w-4 h-4 flex-shrink-0" />
                                Ir con Maps
                            </a>
                        </div>
                    </div>
                </div>

                {/* Card 2: Dress Code */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-display text-2xl text-center text-gray-800 mb-6 border-b border-gray-100 pb-4">
                        Código de Vestimenta: <span className="text-primary font-bold">Formal</span>
                    </h3>

                    <div className="flex gap-6">
                        {/* Ellas */}
                        <div className="flex-1 flex flex-col items-center">
                            <div className="mb-3 p-3 bg-secondary/20 rounded-full overflow-hidden flex items-center justify-center">
                                <div className="relative w-8 h-8">
                                    <Image
                                        src="/icons/dress.png"
                                        alt="Vestido"
                                        fill
                                        className="object-contain mix-blend-multiply"
                                    />
                                </div>
                            </div>
                            <span className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-3">Ellas</span>

                            <div className="flex gap-1.5 justify-center flex-wrap mb-2">
                                <div className="w-5 h-5 rounded-full bg-rose-300 shadow-sm ring-1 ring-gray-200"></div>
                                <div className="w-5 h-5 rounded-full bg-sky-300 shadow-sm ring-1 ring-gray-200"></div>
                                <div className="w-5 h-5 rounded-full bg-emerald-300 shadow-sm ring-1 ring-gray-200"></div>
                                <div className="w-5 h-5 rounded-full bg-amber-200 shadow-sm ring-1 ring-gray-200"></div>
                            </div>

                            <div className="text-[10px] text-gray-400 text-center mt-1 leading-tight">
                                Vestido largo<br />(Evitar blanco y rojo)
                            </div>
                        </div>

                        <div className="w-px bg-gray-100"></div>

                        {/* Ellos */}
                        <div className="flex-1 flex flex-col items-center">
                            <div className="mb-3 p-3 bg-secondary/20 rounded-full overflow-hidden flex items-center justify-center">
                                <div className="relative w-8 h-8">
                                    <Image
                                        src="/icons/traje.png"
                                        alt="Traje"
                                        fill
                                        className="object-contain mix-blend-multiply"
                                    />
                                </div>
                            </div>
                            <span className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-3">Ellos</span>

                            <div className="flex gap-1.5 justify-center flex-wrap mb-2">
                                <div className="w-5 h-5 rounded-full bg-black shadow-sm ring-1 ring-gray-200"></div>
                                <div className="w-5 h-5 rounded-full bg-slate-900 shadow-sm ring-1 ring-gray-200"></div>
                                <div className="w-5 h-5 rounded-full bg-gray-800 shadow-sm ring-1 ring-gray-200"></div>
                            </div>
                            <div className="text-[10px] text-gray-400 text-center mt-1 leading-tight">
                                Traje formal<br />(Evitar gris humo)
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <a href="https://pin.it/2yAgUEz1x" target="_blank" rel="noopener noreferrer" className="text-primary text-xs font-bold underline decoration-primary/30 underline-offset-4 hover:decoration-primary transition-all">
                            Ver tablero de inspiración
                        </a>
                    </div>
                </div>

                {/* Card 3: Logística */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="space-y-6">
                        {/* Horario */}
                        <div className="flex gap-4 items-start">
                            <div className="flex-shrink-0 mt-1">
                                <Clock className="w-6 h-6 text-[#4a5951]" />
                            </div>
                            <div className="flex-grow">
                                <h4 className="font-display font-bold text-xl text-gray-800 mb-1">Horario</h4>
                                <div className="relative pl-3 border-l-2 border-[#4a5951]/20 space-y-2 py-1">
                                    <p className="text-sm text-gray-600">
                                        <span className="font-bold text-[#4a5951]">11:30 AM</span> — Ceremonia y Recepción
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Parking */}
                        <div className="flex gap-4 items-start border-t border-gray-50 pt-4">
                            <div className="flex-shrink-0 mt-1">
                                <Car className="w-6 h-6 text-[#4a5951]" />
                            </div>
                            <div className="flex-grow">
                                <h4 className="font-display font-bold text-xl text-gray-800 mb-1">Estacionamiento</h4>
                                <p className="text-sm text-gray-600">
                                    Estacionamiento privado y seguridad para todos los invitados.
                                </p>
                            </div>
                        </div>

                        {/* Niños */}
                        <div className="flex gap-4 items-start border-t border-gray-50 pt-4">
                            <div className="flex-shrink-0 mt-1">
                                <Wine className="w-6 h-6 text-[#4a5951]" />
                            </div>
                            <div className="flex-grow">
                                <h4 className="font-display font-bold text-xl text-gray-800 mb-1">Recepción Solo Adultos</h4>
                                <p className="text-sm text-gray-600 italic leading-relaxed">
                                    "Amamos a tus pequeños, pero queremos que esta noche te relajes y disfrutes con nosotros. Evento solo para adultos."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    )
}
