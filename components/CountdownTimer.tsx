'use client'

import { useState, useEffect } from 'react'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export default function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date()
      
      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        }
      }
      
      return { days: 0, hours: 0, minutes: 0, seconds: 0 }
    }

    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  return (
    <div className="flex justify-center gap-4 lg:gap-6 xl:gap-8 text-white mt-8 lg:mt-10 xl:mt-12 backdrop-blur-sm bg-black/20 p-4 lg:p-6 xl:p-8 rounded-xl lg:rounded-2xl border border-white/20 transition-all duration-300">
      <div className="flex flex-col items-center min-w-[60px] lg:min-w-[80px] xl:min-w-[100px]">
        <span className="font-display text-2xl lg:text-3xl xl:text-5xl font-bold transition-all duration-300">{timeLeft.days}</span>
        <span className="text-[10px] lg:text-xs xl:text-sm uppercase tracking-wider">Días</span>
      </div>
      <div className="h-8 lg:h-10 xl:h-12 w-px bg-white/40 self-center"></div>
      <div className="flex flex-col items-center min-w-[60px] lg:min-w-[80px] xl:min-w-[100px]">
        <span className="font-display text-2xl lg:text-3xl xl:text-5xl font-bold transition-all duration-300">{timeLeft.hours}</span>
        <span className="text-[10px] lg:text-xs xl:text-sm uppercase tracking-wider">Horas</span>
      </div>
      <div className="h-8 lg:h-10 xl:h-12 w-px bg-white/40 self-center"></div>
      <div className="flex flex-col items-center min-w-[60px] lg:min-w-[80px] xl:min-w-[100px]">
        <span className="font-display text-2xl lg:text-3xl xl:text-5xl font-bold transition-all duration-300">{timeLeft.minutes}</span>
        <span className="text-[10px] lg:text-xs xl:text-sm uppercase tracking-wider">Min</span>
      </div>
      <div className="h-8 lg:h-10 xl:h-12 w-px bg-white/40 self-center"></div>
      <div className="flex flex-col items-center min-w-[60px] lg:min-w-[80px] xl:min-w-[100px]">
        <span className="font-display text-2xl lg:text-3xl xl:text-5xl font-bold transition-all duration-300">{timeLeft.seconds}</span>
        <span className="text-[10px] lg:text-xs xl:text-sm uppercase tracking-wider">Seg</span>
      </div>
    </div>
  )
}
