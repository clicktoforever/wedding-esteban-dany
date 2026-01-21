'use client'

import { useState, useEffect } from 'react'

export default function WeddingCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      // Fecha de la boda: 11 de abril de 2026
      const weddingDate = new Date('2026-04-11T00:00:00').getTime()
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
  }, [])

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
      <p className="text-[10px] text-stone-400 mt-2">11 de Abril, 2026</p>
    </section>
  )
}
