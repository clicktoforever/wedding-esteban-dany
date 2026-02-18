'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/browser'
import DeleteConfirmationModal from '../DeleteConfirmationModal'

interface EditTableModalProps {
  isOpen: boolean
  onClose: () => void
  table: {
    id: string
    name: string
    capacity: number
  }
  onSuccess: () => void
  onDelete: () => void
}

export default function EditTableModal({ isOpen, onClose, table, onSuccess, onDelete }: EditTableModalProps) {
  const [name, setName] = useState(table.name)
  const [capacity, setCapacity] = useState(table.capacity)
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await (supabase
        .from('tables') as any)
        .update({ name: name.trim(), capacity })
        .eq('id', table.id)

      if (error) throw error

      onSuccess()
    } catch (error) {
      console.error('Error updating table:', error)
      alert('Error al actualizar la mesa')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      const supabase = createClient()

      // First, unassign all guests from this table
      await (supabase
        .from('guests')
        .update as any)({ table_id: null })
        .eq('table_id', table.id)

      // Then delete the table
      const { error } = await (supabase
        .from('tables') as any)
        .delete()
        .eq('id', table.id)

      if (error) throw error

      onDelete()
    } catch (error) {
      console.error('Error deleting table:', error)
      alert('Error al eliminar la mesa')
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:items-center sm:justify-center pointer-events-none">
        <div
          className="w-full max-w-md bg-[#fbf8f0] rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden flex flex-col relative animate-in slide-in-from-bottom duration-300 pointer-events-auto max-h-[85vh]"
          onClick={(e) => e.stopPropagation()}
        >

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-4 pb-2">
            <h2 className="text-[#495a51] text-2xl font-bold leading-tight tracking-tight">
              Editar Mesa
            </h2>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 transition-colors text-[#6b7566]"
            >
              <span className="material-symbols-outlined text-[28px]">close</span>
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-8">
            {/* Name Input */}
            <div className="space-y-2">
              <label className="block text-[#6b7566] text-sm font-semibold uppercase tracking-wider">
                Nombre de la Mesa
              </label>
              <div className="relative group">
                <input
                  className="w-full bg-white border border-[#d6d3cb] text-[#131514] rounded-xl px-4 py-4 text-lg font-medium shadow-sm focus:border-[#495a51] focus:ring-1 focus:ring-[#495a51] focus:outline-none transition-all placeholder:text-stone-400"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#495a51] pointer-events-none">
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                </div>
              </div>
            </div>

            {/* Stepper */}
            <div className="space-y-4">
              <p className="text-[#6b7566] text-sm font-semibold uppercase tracking-wider text-center">
                Cantidad de Sillas
              </p>
              <div className="flex items-center justify-center gap-6">
                {/* Minus */}
                <button
                  type="button"
                  onClick={() => setCapacity(Math.max(2, capacity - 1))}
                  disabled={capacity <= 2}
                  className="w-14 h-14 rounded-full border border-[#d6d3cb] bg-white text-[#6b7566] flex items-center justify-center hover:bg-stone-50 hover:border-[#495a51] transition-all active:scale-95 shadow-sm disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[28px]">remove</span>
                </button>

                {/* Value */}
                <div className="w-20 text-center">
                  <span className="text-4xl font-bold text-[#131514] tabular-nums">{capacity}</span>
                </div>

                {/* Plus */}
                <button
                  type="button"
                  onClick={() => setCapacity(Math.min(12, capacity + 1))}
                  disabled={capacity >= 12}
                  className="w-14 h-14 rounded-full bg-[#495a51] text-white flex items-center justify-center hover:bg-[#3d4b43] transition-all active:scale-95 shadow-md disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[28px]">add</span>
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-[#eaddcf] w-full my-2" />
          </form>

          {/* Actions */}
          <div className="px-6 pb-8 pt-2 flex flex-col gap-3">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-[#495a51] hover:bg-[#3d4b43] text-white h-14 rounded-xl text-lg font-bold shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  Guardando...
                </>
              ) : (
                <span>Guardar Cambios</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="w-full bg-transparent hover:bg-[#996678]/5 text-[#996678] h-12 rounded-xl text-base font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
            >
              <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">
                delete
              </span>
              <span>Eliminar Mesa</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full text-stone-400 hover:text-stone-600 text-sm font-medium py-2 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="¿Eliminar mesa?"
        message={`Se eliminará "${table.name}" y todos sus invitados serán desasignados.`}
        confirmText="Sí, Eliminar"
        cancelText="Cancelar"
      />
    </>
  )
}
