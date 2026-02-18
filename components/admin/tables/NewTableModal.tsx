'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/browser'

interface NewTableModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function NewTableModal({ isOpen, onClose, onSuccess }: NewTableModalProps) {
  const [name, setName] = useState('')
  const [capacity, setCapacity] = useState(8)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await (supabase
        .from('tables') as any)
        .insert({ name: name.trim(), capacity })

      if (error) throw error

      onSuccess()
      onClose()
      setName('')
      setCapacity(8)
    } catch (error) {
      console.error('Error creating table:', error)
      alert('Error al crear la mesa')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-[#131514]/30 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="w-full max-w-[360px] bg-[#fbf8f0] rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >

          {/* Header */}
          <div className="px-6 pt-2 pb-4 text-center">
            <h2 className="text-[#495a51] text-xl font-bold tracking-tight">Nueva Mesa</h2>
            <p className="text-xs text-[#6b7566] mt-1">Organiza a tus invitados</p>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="px-6 space-y-6 pb-2">
            {/* Table Name Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#131514]">
                Nombre de la Mesa
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#495a51]">
                  <span className="material-symbols-outlined text-[20px]">table_restaurant</span>
                </span>
                <input
                  className="w-full bg-white text-[#131514] border border-[#e6e8e6] rounded-xl py-3 pl-10 pr-4 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#495a51] focus:border-[#495a51] transition-all shadow-sm text-base"
                  placeholder="Ej. Familia del Novio"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Capacity Stepper */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-[#131514]">
                  Capacidad / Sillas
                </label>
                <span className="text-xs font-medium text-[#495a51] bg-[#495a51]/10 px-2 py-0.5 rounded-full">
                  Max 12
                </span>
              </div>
              <div className="flex items-center justify-between bg-white rounded-xl p-2 border border-[#e6e8e6] shadow-sm">
                {/* Minus Button */}
                <button
                  type="button"
                  onClick={() => setCapacity(Math.max(2, capacity - 1))}
                  disabled={capacity <= 2}
                  className="w-12 h-12 flex items-center justify-center rounded-lg bg-[#f4f5f4] text-[#131514] hover:bg-[#e0e2e0] active:scale-95 transition-all disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[20px]">remove</span>
                </button>

                {/* Number Display */}
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-[#131514] tabular-nums leading-none">
                    {capacity}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-[#6b7566] font-bold mt-1">
                    Personas
                  </span>
                </div>

                {/* Plus Button */}
                <button
                  type="button"
                  onClick={() => setCapacity(Math.min(12, capacity + 1))}
                  disabled={capacity >= 12}
                  className="w-12 h-12 flex items-center justify-center rounded-lg bg-[#495a51] text-white shadow-md hover:bg-[#3d4b43] active:scale-95 transition-all disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[20px]">add</span>
                </button>
              </div>
            </div>
          </form>

          {/* Footer Actions */}
          <div className="px-6 pt-4 pb-8 space-y-3 mt-2">
            <button
              onClick={handleSubmit}
              disabled={isLoading || !name.trim()}
              className="w-full bg-[#495a51] hover:bg-[#3d4b43] text-white h-14 rounded-xl text-base font-bold shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  Guardando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">check</span>
                  Guardar Mesa
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full text-[#6b7566] hover:text-[#131514] text-sm font-medium py-2 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
