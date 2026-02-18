'use client'

import { useState, useRef } from 'react'
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion'
import { MessageCircle, Bell } from 'lucide-react'

interface Pass {
  id: string
  attendee_name: string
  confirmation_status: 'pending' | 'confirmed' | 'declined'
}

interface Guest {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  access_token: string
  notified_whatsapp: boolean
  passes: Pass[]
}

interface GuestSwipeActionCardProps {
  guest: Guest
  status: 'confirmed' | 'pending' | 'declined'
  onCardClick: () => void
  onSendWhatsApp: () => void
}


const SWIPE_THRESHOLD = 50
const OPEN_POSITION = -80

export default function GuestSwipeActionCard({
  guest,
  status,
  onCardClick,
  onSendWhatsApp,
}: GuestSwipeActionCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)

  // Transform for smooth visual feedback
  const opacity = useTransform(x, [-80, -40, 0], [1, 0.7, 0])

  const getStatusBadge = (status: string) => {
    const badges = {
      confirmed: {
        class: 'bg-green-50 text-green-700 border-green-100',
        label: 'Confirmado'
      },
      pending: {
        class: 'bg-amber-50 text-amber-700 border-amber-100',
        label: 'Pendiente'
      },
      declined: {
        class: 'bg-stone-100 text-stone-500 border-stone-200',
        label: 'Declinado'
      }
    }
    return badges[status as keyof typeof badges] || badges.pending
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
  }

  const hasWhatsApp = (guest: Guest) => {
    return guest.phone && guest.phone.trim() !== ''
  }

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const dragDistance = info.offset.x
    const dragVelocity = info.velocity.x

    // If already open and dragging right, close
    if (isOpen && dragDistance > 20) {
      setIsOpen(false)
      return
    }

    // If closed and dragging left beyond threshold, open
    if (!isOpen && dragDistance < -SWIPE_THRESHOLD) {
      setIsOpen(true)
    } else if (!isOpen && dragDistance < 0 && dragDistance > -SWIPE_THRESHOLD) {
      // Dragged left but not enough, snap back
      setIsOpen(false)
    } else if (!isOpen && dragVelocity < -500) {
      // Fast swipe left
      setIsOpen(true)
    } else {
      // Default: maintain current state
      setIsOpen(isOpen)
    }
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // If card is open, close it instead of opening detail modal
    if (isOpen) {
      e.stopPropagation()
      setIsOpen(false)
    } else {
      onCardClick()
    }
  }

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen(false)
    onSendWhatsApp()
  }

  const badge = getStatusBadge(status)
  const totalPasses = guest.passes.length

  return (
    <div className="relative w-full overflow-hidden rounded-2xl">
      {/* Background Layer - Action Buttons */}
      <motion.div
        className="absolute inset-0 flex items-center justify-end pr-0"
        style={{ opacity }}
      >
        {/* WhatsApp Button */}
        <button
          onClick={handleWhatsAppClick}
          className="h-full w-20 flex flex-col items-center justify-center gap-1.5 bg-[#4a5951] hover:bg-[#3d4a43] transition-colors touch-manipulation"
          aria-label="Enviar WhatsApp"
          disabled={!hasWhatsApp(guest)}
        >
          <MessageCircle className="w-6 h-6 text-white" strokeWidth={2} />
          <span className="text-[10px] font-medium text-white uppercase tracking-wide">
            WhatsApp
          </span>
        </button>
      </motion.div>

      {/* Foreground Layer - Guest Card */}
      <motion.div
        ref={cardRef}
        drag="x"
        dragConstraints={{ left: OPEN_POSITION, right: 0 }}
        dragElastic={0.1}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        animate={{
          x: isOpen ? OPEN_POSITION : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 30,
        }}
        style={{ x }}
        onClick={handleCardClick}
        className="relative bg-white p-5 rounded-2xl shadow-card border border-stone-100/50 flex items-center justify-between cursor-pointer hover:shadow-lg active:scale-[0.99] min-h-[88px] z-10 touch-manipulation"
      >
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          {/* Avatar */}
          <div className={`h-12 w-12 flex-shrink-0 rounded-full flex items-center justify-center font-display font-bold text-lg ${status === 'confirmed'
            ? 'bg-stone-100 text-primary'
            : 'bg-stone-100 text-stone-600'
            }`}>
            {getInitials(guest.name)}
          </div>

          {/* Guest Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-text-main-light text-base truncate">
                {guest.name}
              </h3>
            </div>
            <div className="flex items-center mt-1.5 space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${badge.class}`}>
                {badge.label}
              </span>
              <span className="text-xs font-medium text-stone-500">
                +{totalPasses} {totalPasses === 1 ? 'pase' : 'pases'}
              </span>
            </div>
          </div>
        </div>

        {/* Notification Status Icon */}
        <div className="flex flex-col items-end flex-shrink-0 ml-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${guest.notified_whatsapp
              ? 'bg-green-100'
              : 'bg-gray-100'
              }`}
            title={guest.notified_whatsapp ? 'Notificado por WhatsApp' : 'No notificado'}
          >
            <svg
              className={`w-5 h-5 ${guest.notified_whatsapp
                ? 'text-green-600'
                : 'text-gray-400'
                }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
