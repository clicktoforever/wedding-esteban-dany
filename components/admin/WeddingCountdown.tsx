'use client'

import { useState, useEffect } from 'react'

interface WeddingCountdownProps {
  targetDate: string
}

export default function WeddingCountdown({ targetDate }: WeddingCountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
  })

  // Format the wedding date for display
  const formattedDate = new Date(targetDate).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const weddingDate = new Date(targetDate).getTime()
      const now = new Date().getTime()
      const difference = weddingDate - now

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))

        setTimeLeft({ days, hours, minutes })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 })
      }
    }

    // Calcular inmediatamente
    calculateTimeLeft()

    // Actualizar cada minuto
    const timer = setInterval(calculateTimeLeft, 60000)

    return () => clearInterval(timer)
  }, [targetDate])

  return (
    <section className="mb-8 flex flex-col items-center justify-center py-4">
      <p className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-widest mb-2">
        Faltan para el gran día
      </p>
      <div className="flex items-baseline space-x-4 font-display text-primary dark:text-primary-light">
        <div className="text-center">
          <span className="text-3xl md:text-4xl font-bold">{timeLeft.days}</span>
          <span className="block text-[10px] font-sans text-stone-400 font-medium">DÍAS</span>
        </div>
        <span className="text-2xl font-light text-stone-300">:</span>
        <div className="text-center">
          <span className="text-3xl md:text-4xl font-bold">{timeLeft.hours}</span>
          <span className="block text-[10px] font-sans text-stone-400 font-medium">HRS</span>
        </div>
        <span className="text-2xl font-light text-stone-300">:</span>
        <div className="text-center">
          <span className="text-3xl md:text-4xl font-bold">{timeLeft.minutes}</span>
          <span className="block text-[10px] font-sans text-stone-400 font-medium">MIN</span>
        </div>
      </div>
      <p className="text-[10px] text-stone-400 mt-2 capitalize">{formattedDate}</p>
    </section>
  )
}
