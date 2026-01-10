'use client'

import { useEffect, useState } from 'react'

interface WeddingCountdownProps {
  targetDate: string
  title?: string
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export default function WeddingCountdown({ targetDate, title = 'Faltan' }: WeddingCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - Date.now()
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  return (
    <div className="py-12 px-4">
      <h2 className="text-3xl md:text-4xl font-serif text-center mb-8 text-primary-600">
        {title}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
        <TimeCard value={timeLeft.days} label="Días" />
        <TimeCard value={timeLeft.hours} label="Horas" />
        <TimeCard value={timeLeft.minutes} label="Minutos" />
        <TimeCard value={timeLeft.seconds} label="Segundos" />
      </div>
    </div>
  )
}

function TimeCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-primary-50 rounded-lg p-6 text-center shadow-sm">
      <div className="text-4xl md:text-5xl font-bold text-primary-600 mb-2">
        {value.toString().padStart(2, '0')}
      </div>
      <div className="text-sm md:text-base text-gray-600 uppercase tracking-wide">
        {label}
      </div>
    </div>
  )
}
