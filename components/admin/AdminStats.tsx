"use client"
import { useEffect, useMemo, useState } from "react"
import { DollarSign, Users, AlertTriangle, Coins } from "lucide-react"
import { createClient } from "@/lib/supabase/browser"

type StatsProps = {
  totalGuests: number
  confirmedPasses: number
  totalPasses: number
  gifts: Array<{
    collected_amount?: number | null
  }>
}

export default function AdminStats({ totalGuests, confirmedPasses, totalPasses, gifts }: StatsProps) {
  const [manualReviewCount, setManualReviewCount] = useState<number>(0)

  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      // Count transactions in MANUAL_REVIEW to surface IA alerts
      const { count } = await supabase
        .from("gift_transactions")
        .select("id", { count: "exact", head: true })
        .eq("status", "MANUAL_REVIEW")
      if (isMounted) setManualReviewCount(count ?? 0)
    })().catch(() => {})
    return () => {
      isMounted = false
    }
  }, [supabase])

  const totalUsd = useMemo(() => {
    return gifts.reduce((sum, g) => sum + (Number(g.collected_amount ?? 0) || 0), 0)
  }, [gifts])

  const totalMxn = useMemo(() => totalUsd * 20, [totalUsd])

  const confirmedRate = useMemo(() => {
    if (!totalPasses || totalPasses <= 0) return 0
    return Math.round((confirmedPasses / totalPasses) * 100)
  }, [confirmedPasses, totalPasses])

  // Progress circle geometry
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - confirmedRate / 100)

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 px-4 md:px-0">
      {/* Total USD */}
      <div className="border border-gray-200 rounded-xl p-5 flex items-center gap-4 bg-white">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-wedding-sage/20 text-wedding-forest">
          <DollarSign className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-500">Total Recaudado (USD)</div>
          <div className="text-2xl font-serif text-wedding-forest truncate">${totalUsd.toLocaleString("en-US", { maximumFractionDigits: 2 })}</div>
          <div className="text-xs text-gray-500 mt-1">Equivalente MXN: ${totalMxn.toLocaleString("es-MX", { maximumFractionDigits: 2 })}</div>
        </div>
      </div>

      {/* Total MXN (explicit card) */}
      <div className="border border-gray-200 rounded-xl p-5 flex items-center gap-4 bg-white">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-wedding-rose/20 text-wedding-rose">
          <Coins className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-500">Total en MXN (1:20)</div>
          <div className="text-2xl font-serif text-wedding-forest truncate">${totalMxn.toLocaleString("es-MX", { maximumFractionDigits: 2 })}</div>
          <div className="text-xs text-gray-500 mt-1">USD base: ${totalUsd.toLocaleString("en-US", { maximumFractionDigits: 2 })}</div>
        </div>
      </div>

      {/* % Invitados - Progress Circle */}
      <div className="border border-gray-200 rounded-xl p-5 bg-white flex items-center gap-4">
        <div className="relative h-16 w-16">
          <svg className="h-16 w-16" viewBox="0 0 72 72">
            <circle cx="36" cy="36" r={radius} stroke="#E5E7EB" strokeWidth={8} fill="none" />
            <circle
              cx="36"
              cy="36"
              r={radius}
              stroke="#6BA58F" /* wedding-sage */
              strokeWidth={8}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-semibold text-wedding-forest">{confirmedRate}%</span>
          </div>
        </div>
        <div className="flex-1">
          <div className="text-xs text-gray-500">Confirmación de asistencia</div>
          <div className="text-sm text-wedding-forest">{confirmedPasses} confirmados de {totalPasses}</div>
          <div className="text-xs text-gray-500">Total invitados: {totalGuests}</div>
        </div>
        <div className="hidden md:flex h-10 w-10 items-center justify-center rounded-lg bg-wedding-sage/20 text-wedding-forest">
          <Users className="h-5 w-5" />
        </div>
      </div>

      {/* Alertas IA */}
      <div className="border border-gray-200 rounded-xl p-5 bg-white flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-500">Validaciones Pendientes</div>
          <div className="text-2xl font-serif text-wedding-forest truncate">{manualReviewCount}</div>
          <div className="mt-1">
            {manualReviewCount > 0 ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-500 text-white animate-pulse">
                {manualReviewCount} en revisión manual
              </span>
            ) : (
              <span className="text-xs text-gray-500">Sin pendientes</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
