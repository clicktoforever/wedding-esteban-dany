"use client"
import { motion } from "framer-motion"
import { formatCurrency } from "@/lib/currency"

type GiftProgressCardProps = {
  id?: string
  name: string
  category?: string | null
  target_amount: number
  current_amount: number
  onEdit?: (id?: string) => void
  onViewContributions?: (id?: string) => void
}

export default function GiftProgressCard({ id, name, category, target_amount, current_amount, onEdit, onViewContributions }: GiftProgressCardProps) {
  const percent = target_amount > 0 ? Math.min(100, Math.round((current_amount / target_amount) * 100)) : 0
  const remaining = Math.max(0, target_amount - current_amount)

  return (
    <motion.div
      className="border border-gray-200 rounded-xl p-5 bg-white"
      initial={{ x: 0 }}
      drag="x"
      dragConstraints={{ left: -120, right: 120 }}
      onDragEnd={(e, info) => {
        if (info.offset.x <= -80) {
          onEdit?.(id)
        } else if (info.offset.x >= 80) {
          onViewContributions?.(id)
        }
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{name}</p>
          {category && <p className="text-xs text-gray-500 mt-1 truncate">{category}</p>}
        </div>
        <div className="text-right flex-shrink-0">
          <span className="text-sm font-serif text-wedding-forest">{formatCurrency(current_amount, "USD")}</span>
        </div>
      </div>

      <div className="mt-3">
        <div className="h-2 w-full bg-gray-200 rounded-lg overflow-hidden">
          <div
            className="h-full"
            style={{ width: `${percent}%`, backgroundColor: "#D4AF37" }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-gray-600">{percent}%</span>
          <span className="font-semibold text-gray-900">Faltan: ${remaining.toLocaleString("en-US", { maximumFractionDigits: 2 })} USD</span>
        </div>
      </div>

      {/* Swipe affordances (mobile) */}
      <div className="mt-3 flex items-center justify-between text-xs md:hidden">
        <span className="text-gray-400">Swipe ◀ Editar</span>
        <span className="text-gray-400">Ver aportaciones ▶</span>
      </div>
    </motion.div>
  )
}
