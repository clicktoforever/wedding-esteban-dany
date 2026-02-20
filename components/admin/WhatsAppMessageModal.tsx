'use client'

import { useEffect, useRef, useState } from 'react'

interface Guest {
    id: string
    name: string
    phone?: string | null
    access_token: string
}

interface WhatsAppMessageModalProps {
    isOpen: boolean
    onClose: () => void
    guest: Guest | null
    onSend: (message: string) => void
}

export default function WhatsAppMessageModal({
    isOpen,
    onClose,
    guest,
    onSend
}: WhatsAppMessageModalProps) {
    const contentRef = useRef<HTMLDivElement>(null)
    const [startY, setStartY] = useState(0)
    const [currentY, setCurrentY] = useState(0)
    const [isDragging, setIsDragging] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<'invite' | 'remind' | 'close'>('invite')
    const [selectedOption, setSelectedOption] = useState<1 | 2>(1)

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
            if (contentRef.current) {
                contentRef.current.scrollTop = 0
            }
        } else {
            document.body.style.overflow = 'unset'
        }

        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    if (!isOpen || !guest) return null

    const getMessageOption1 = () => {
        return `¡Hola *${guest.name}*! 👋 Nos casamos y nos encantaría contar con tu presencia.\n\n` +
            `🚨 *IMPORTANTE:* Por seguridad de WhatsApp, el enlace de tu invitación aparece inactivo.\n\n` +
            `� *Para activarlo, por favor respóndenos este mensaje con un "Hola".*\n\n` +
            `Una vez que nos respondas, el enlace se pondrá azul. Toca aquí para abrirlo:\n` +
            `�👇👇\n` +
            `https://carlosydany.clicktoforever.com/?token=${guest.access_token}\n\n` +
            `Con cariño, *Carlos y Dany* 💍`
    }

    const getMessageOption2 = () => {
        return `¡Hola *${guest.name}*! 👋✨ ¡Nos casamos y tienes que estar ahí!\n\n` +
            `� *TU ENLACE ESTÁ BLOQUEADO*\n\n` +
            `WhatsApp no te deja abrirlo hasta que nos respondas. *Envíame un emoji (🥂, 🎉) o un "Hola" aquí mismo para desbloquearlo.*\n\n` +
            `En cuanto respondas, el link se pondrá azul. Pícale aquí para ver tus pases:\n` +
            `👇👇👇\n` +
            `https://carlosydany.clicktoforever.com/?token=${guest.access_token}\n\n` +
            `¡Te esperamos!\n` +
            `*Carlos y Dany* 💍`
    }

    const getReminderMessage = () => {
        return `¡Hola ${guest.name}! 💌\n\n` +
            `Te recordamos que la fecha límite para confirmar tu asistencia es el 10 de marzo. 📅\n\n` +
            `Si aún no lo has hecho, por favor confirma tu pase a través de este enlace:\n\n` +
            `https://carlosydany.clicktoforever.com/?token=${guest.access_token}\n\n` +
            `¡Tu presencia es muy importante para nosotros! 💕✨`
    }

    const getClosingMessage = () => {
        return `Hola *${guest.name}*, esperamos que estés bien. 👋\n\n` +
            `Hoy debemos cerrar la lista final de nuestra boda. Al no recibir tu confirmación, *entendemos que en esta ocasión no podrás acompañarnos*.\n\n` +
            `Sentiremos mucho tu ausencia, pero te tendremos muy presente en nuestro brindis a la distancia. 🥂\n\n` +
            `Un abrazo,\n` +
            `*Carlos y Dany*`
    }

    const getCurrentMessage = () => {
        switch (selectedCategory) {
            case 'invite':
                return selectedOption === 1 ? getMessageOption1() : getMessageOption2()
            case 'remind':
                return getReminderMessage()
            case 'close':
                return getClosingMessage()
        }
    }

    const currentMessage = getCurrentMessage()

    const handleTouchStart = (e: React.TouchEvent) => {
        setStartY(e.touches[0].clientY)
        setIsDragging(true)
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return
        const diff = e.touches[0].clientY - startY
        if (diff > 0) {
            setCurrentY(diff)
        }
    }

    const handleTouchEnd = () => {
        if (currentY > 100) {
            onClose()
        }
        setCurrentY(0)
        setIsDragging(false)
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div
                className="fixed bottom-0 inset-x-0 z-50 md:inset-0 md:flex md:items-center md:justify-center md:p-4"
            >
                <div
                    className="relative flex max-h-[90dvh] md:h-[90vh] w-full md:max-w-md flex-col bg-[#F9F7F2] shadow-2xl overflow-hidden rounded-t-2xl md:rounded-[32px] animate-in slide-in-from-bottom duration-300"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        transform: `translateY(${currentY}px)`,
                        transition: isDragging ? 'none' : 'transform 0.3s ease-out',
                        overscrollBehavior: 'contain'
                    }}
                >

                    {/* Header */}
                    <div className="sticky top-0 z-40 bg-[#F9F7F2] border-b border-stone-200/50 px-4 py-3 pb-0 flex flex-col pt-8 md:pt-3">
                        <div className="flex items-center justify-between mb-4">
                            <button
                                onClick={onClose}
                                className="flex items-center text-primary group/nav transition-opacity active:opacity-60"
                            >
                                <span className="material-symbols-outlined text-[32px] -ml-2 transition-transform group-hover/nav:-translate-x-0.5">
                                    chevron_left
                                </span>
                            </button>
                            <h2 className="text-[17px] font-bold text-stone-900 absolute left-1/2 -translate-x-1/2 w-max">
                                Enviar WhatsApp
                            </h2>
                            <div className="w-10"></div>
                        </div>

                        {/* Category Tabs */}
                        <div className="flex p-1 bg-stone-100/50 rounded-xl mb-3">
                            <button
                                onClick={() => setSelectedCategory('invite')}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${selectedCategory === 'invite'
                                    ? 'bg-white text-stone-900 shadow-sm'
                                    : 'text-stone-500 hover:text-stone-700'
                                    }`}
                            >
                                Invitar
                            </button>
                            <button
                                onClick={() => setSelectedCategory('remind')}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${selectedCategory === 'remind'
                                    ? 'bg-white text-stone-900 shadow-sm'
                                    : 'text-stone-500 hover:text-stone-700'
                                    }`}
                            >
                                Recordar
                            </button>
                            <button
                                onClick={() => setSelectedCategory('close')}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${selectedCategory === 'close'
                                    ? 'bg-white text-stone-900 shadow-sm'
                                    : 'text-stone-500 hover:text-stone-700'
                                    }`}
                            >
                                Cierre
                            </button>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div
                        ref={contentRef}
                        className="flex-1 overflow-y-auto p-5 pb-32"
                        style={{ overscrollBehavior: 'contain' }}
                    >
                        {/* Options */}
                        <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-4">
                            {selectedCategory === 'invite' ? 'Selecciona un mensaje' : 'Mensaje a enviar'}
                        </h3>

                        {selectedCategory === 'invite' && (
                            <div className="flex flex-col gap-4 mb-8">
                                <button
                                    onClick={() => setSelectedOption(1)}
                                    className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left ${selectedOption === 1
                                        ? 'border-primary bg-primary/5 shadow-md'
                                        : 'border-stone-200 bg-white hover:border-stone-300'
                                        }`}
                                >
                                    <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${selectedOption === 1 ? 'border-primary' : 'border-stone-300'
                                        }`}>
                                        {selectedOption === 1 && (
                                            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className={`font-bold text-base ${selectedOption === 1 ? 'text-primary' : 'text-stone-700'
                                            }`}>
                                            Opción 1: Formal
                                        </h4>
                                        <p className="text-sm text-stone-500 mt-1 line-clamp-2">
                                            ¡Hola {guest.name}! 👋✨ Nos emociona invitarte a nuestro gran día...
                                        </p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setSelectedOption(2)}
                                    className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left ${selectedOption === 2
                                        ? 'border-primary bg-primary/5 shadow-md'
                                        : 'border-stone-200 bg-white hover:border-stone-300'
                                        }`}
                                >
                                    <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${selectedOption === 2 ? 'border-primary' : 'border-stone-300'
                                        }`}>
                                        {selectedOption === 2 && (
                                            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className={`font-bold text-base ${selectedOption === 2 ? 'text-primary' : 'text-stone-700'
                                            }`}>
                                            Opción 2: Sorpresa
                                        </h4>
                                        <p className="text-sm text-stone-500 mt-1 line-clamp-2">
                                            ¡{guest.name}, tenemos una sorpresa para ti! 👋 Se acerca nuestra boda...
                                        </p>
                                    </div>
                                </button>
                            </div>
                        )}

                        {/* Preview */}
                        <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-4">
                            Vista Previa
                        </h3>

                        <div className="bg-[#DCF8C6] rounded-xl p-4 shadow-sm border border-[#c4e6ad] relative mb-6">
                            <p className="text-stone-800 whitespace-pre-line text-sm leading-relaxed font-sans">
                                {currentMessage}
                            </p>
                            <div className="flex justify-end mt-2">
                                <span className="text-[10px] text-stone-500 font-medium">
                                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>

                    </div>

                    {/* Bottom Actions */}
                    <div className="sticky bottom-0 bg-[#F9F7F2] border-t border-stone-200 p-5">
                        <button
                            onClick={() => onSend(currentMessage)}
                            className="w-full py-4 px-6 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-lg active:scale-[0.98] transform flex items-center justify-center gap-2 text-lg"
                        >
                            <span className="material-symbols-outlined text-[24px]">send</span>
                            Enviar Mensaje
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
