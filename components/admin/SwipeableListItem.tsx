'use client'

import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion'

interface SwipeableListItemProps {
  children: React.ReactNode
  onDelete: () => void
  disabled?: boolean
  className?: string
}

export default function SwipeableListItem({
  children,
  onDelete,
  disabled = false,
  className = ''
}: SwipeableListItemProps) {
  const x = useMotionValue(0)
  const opacity = useTransform(x, [-150, 0], [1, 0])
  const iconScale = useTransform(x, [-150, 0], [1.1, 1])
  const iconX = useTransform(x, (value) => Math.min(value * 0.2, 0))

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = -150 // Threshold in pixels to trigger delete
    
    if (info.offset.x < threshold) {
      // Trigger haptic feedback if supported
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
      
      // Trigger delete confirmation
      onDelete()
    }
  }

  if (disabled) {
    return <div className={className}>{children}</div>
  }

  return (
    <div className={`relative ${className}`}>
      {/* Background Layer - Delete Action Zone */}
      <motion.div 
        className="absolute inset-0 bg-red-500 rounded-xl flex items-center justify-end pr-6 overflow-hidden"
        style={{ opacity }}
      >
        <motion.div
          style={{
            scale: iconScale,
            x: iconX
          }}
        >
          <span className="material-symbols-outlined text-white text-[28px]">
            delete
          </span>
        </motion.div>
      </motion.div>

      {/* Foreground Layer - The Card */}
      <motion.div
        drag="x"
        dragDirectionLock
        dragSnapToOrigin
        dragConstraints={{ left: -300, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ 
          x,
          position: 'relative',
          zIndex: 10
        }}
        dragTransition={{
          bounceStiffness: 600,
          bounceDamping: 40
        }}
        className="touch-pan-y" // Allow vertical scrolling
      >
        {children}
      </motion.div>
    </div>
  )
}
