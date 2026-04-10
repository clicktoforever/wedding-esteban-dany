"use client"

import { Wine, Shirt, Heart } from 'lucide-react'

export default function LiveEventDetails({ youtubeStreamUrl = "#" }: { youtubeStreamUrl?: string }) {
    return (
        <section className="px-6 py-16 bg-secondary/10 rounded-t-[40px] border-t border-secondary/20 relative">
            <div className="text-center mb-12 max-w-lg mx-auto">
                <div className="flex justify-center mb-4">
                    <Heart className="w-8 h-8 text-primary fill-primary/20" />
                </div>
                <h2 className="font-display text-4xl text-gray-800 mb-6">Desde Quito con Amor</h2>
                <p className="text-gray-700 leading-relaxed text-lg">
                    Nos emociona enormemente compartir este día tan especial con todos ustedes, sin importar la distancia. Esta es una celebración donde México y Ecuador se unen en un solo corazón. Prepara tu mejor sonrisa y acompáñanos a celebrar el amor desde la comodidad de tu hogar.
                </p>
            </div>

            <div className="space-y-8 max-w-md mx-auto">
                
                {/* Dress Code Cards */}
                <div className="flex flex-col mt-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 pt-10 relative mb-12">
                        <div className="absolute -top-6 left-6 bg-[#d2a65a] w-12 h-12 rounded-[14px] flex items-center justify-center shadow-md">
                            <Wine className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-display text-2xl text-gray-800 mb-2">Tu Bebida Favorita</h3>
                        <p className="text-gray-600">
                            Sírvete una copa de vino, un tequila o un canelazo. ¡Brindaremos juntos!
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 pt-10 relative">
                        <div className="absolute -top-6 left-6 bg-[#d2a65a] w-12 h-12 rounded-[14px] flex items-center justify-center shadow-md">
                            <Shirt className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-display text-2xl text-gray-800 mb-2">Dress Code Cómodo</h3>
                        <p className="text-gray-600">
                            Arriba de gala, abajo pijama. Tú decides qué tan elegante quieres estar en el sofá.
                        </p>
                    </div>
                </div>

                {/* Transmisión En Vivo */}
                <div className="bg-[#f9f8f4] rounded-3xl p-8 text-center shadow-sm border border-gray-100 mt-12 mb-12">
                    <div className="inline-flex items-center justify-center space-x-2 bg-gray-200/60 rounded-full px-4 py-1.5 mb-6">
                        <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse"></span>
                        <span className="text-[10px] font-bold tracking-wider text-gray-800 uppercase">Transmisión en vivo</span>
                    </div>
                    <h3 className="font-display text-4xl text-gray-900 mb-4">La Alfombra Roja<br/>Digital</h3>
                    <p className="text-gray-700 mb-8 leading-relaxed">
                        Acompaña a nuestro host especial en entrevistas exclusivas antes de la ceremonia. No te pierdas ni un detalle de la llegada de los invitados.
                    </p>
                    <a href={youtubeStreamUrl} target="_blank" rel="noopener noreferrer" className="w-full bg-white text-black font-bold py-4 px-6 rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors uppercase tracking-wide flex items-center justify-center space-x-2">
                        <span>VER TRANSMISIÓN EN YOUTUBE</span>
                    </a>
                </div>

                {/* Logística / Horario */}
                <div className="bg-[#f9f8f4] rounded-2xl shadow-sm border border-gray-100 p-6">                    
                    <div className="space-y-8 relative before:absolute before:inset-0 before:ml-[7px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[#c8b488] before:via-[#c8b488]/50 before:to-transparent">
                        
                        {/* Event 1 */}
                        <div className="relative flex items-start gap-4">
                            <div className="absolute left-[7px] -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#c8b488] ring-4 ring-[#f9f8f4]"></div>
                            <div className="pl-6">
                                <div className="text-xs font-bold text-[#b59a68] tracking-wider mb-1">12:00 PM - Hora Ecuador</div>
                                <h4 className="font-display text-xl text-gray-900 mb-1">Llegada y Primeros Saludos</h4>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    Iniciamos la velada con la bienvenida de nuestros seres queridos y entrevistas especiales para compartir la emoción del momento.
                                </p>
                            </div>
                        </div>

                        {/* Event 2 */}
                        <div className="relative flex items-start gap-4">
                            <div className="absolute left-[7px] -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white border-[2.5px] border-[#c8b488] ring-4 ring-[#f9f8f4]"></div>
                            <div className="pl-6">
                                <div className="text-xs font-bold text-[#b59a68] tracking-wider mb-1">1:30 PM - Hora Ecuador</div>
                                <h4 className="font-display text-xl text-gray-900 mb-1">El Corazón al Descubierto</h4>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    Una íntima sesión de preguntas a los novios, donde compartiremos nuestra historia, nervios y alegría antes de dar el gran paso.
                                </p>
                            </div>
                        </div>

                        {/* Event 3 */}
                        <div className="relative flex items-start gap-4">
                            <div className="absolute left-[7px] -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white border-[2.5px] border-[#c8b488] ring-4 ring-[#f9f8f4]"></div>
                            <div className="pl-6">
                                <div className="text-xs font-bold text-[#b59a68] tracking-wider mb-1">2:00 PM - Hora Ecuador</div>
                                <h4 className="font-display text-xl text-gray-900 mb-1">El Sí, Acepto</h4>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    Acompáñanos a presenciar nuestra ceremonia civil, el instante donde uniremos nuestras vidas para siempre.
                                </p>
                            </div>
                        </div>

                        {/* Event 4 */}
                        <div className="relative flex items-start gap-4">
                            <div className="absolute left-[7px] -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white border-[2.5px] border-[#c8b488] ring-4 ring-[#f9f8f4]"></div>
                            <div className="pl-6">
                                <div className="text-xs font-bold text-[#b59a68] tracking-wider mb-1">2:30 PM - Hora Ecuador</div>
                                <h4 className="font-display text-xl text-gray-900 mb-1">Nuestro Primer Paseo</h4>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    El triunfal ingreso de los novios al salón. Celebremos juntos este primer recorrido como esposos.
                                </p>
                            </div>
                        </div>

                        {/* Event 5 */}
                        <div className="relative flex items-start gap-4">
                            <div className="absolute left-[7px] -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white border-[2.5px] border-[#c8b488] ring-4 ring-[#f9f8f4]"></div>
                            <div className="pl-6">
                                <div className="text-xs font-bold text-[#b59a68] tracking-wider mb-1">2:45 PM - Hora Ecuador</div>
                                <h4 className="font-display text-xl text-gray-900 mb-1">Un Brindis por el Amor</h4>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    Levantemos nuestras copas a la distancia. Un momento lleno de emociones, palabras de los padrinos y protocolo especial.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </section>
    )
}
