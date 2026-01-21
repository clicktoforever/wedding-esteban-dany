'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/browser'
import Image from 'next/image'
import DeleteConfirmationModal from './DeleteConfirmationModal'

interface Gift {
  id: string
  name: string
  description: string | null
  image_url: string | null
  category: string | null
  total_amount: number
  collected_amount: number
  status: 'AVAILABLE' | 'COMPLETED'
  is_crowdfunding: boolean
}

interface EditGiftModalProps {
  isOpen: boolean
  gift: Gift
  onClose: () => void
  onSuccess: () => void
}

const CATEGORIES = [
  { value: 'luna-de-miel', label: 'Luna de Miel' },
  { value: 'hogar', label: 'Hogar y Decoración' },
  { value: 'cocina', label: 'Cocina' },
  { value: 'experiencias', label: 'Experiencias' },
  { value: 'efectivo', label: 'Fondo de efectivo' },
  { value: 'otros', label: 'Otros' },
]

export default function EditGiftModal({ isOpen, gift, onClose, onSuccess }: EditGiftModalProps) {
  const [formData, setFormData] = useState({
    name: gift.name,
    description: gift.description || '',
    image_url: gift.image_url || '',
    category: gift.category || '',
    total_amount: gift.total_amount.toString(),
  })
  const [isLoading, setIsLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(gift.image_url)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Update image preview
    if (name === 'image_url' && value) {
      setImagePreview(value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('gifts')
        .update({
          name: formData.name,
          description: formData.description || null,
          image_url: formData.image_url || null,
          category: formData.category || null,
          total_amount: parseFloat(formData.total_amount),
        })
        .eq('id', gift.id)

      if (error) throw error

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error updating gift:', error)
      alert('Error al actualizar el regalo')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('gifts')
        .delete()
        .eq('id', gift.id)

      if (error) throw error

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error deleting gift:', error)
      alert('Error al eliminar el regalo')
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-stone-900/10 backdrop-blur-md transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-[480px] bg-[#fbf8f0] flex flex-col rounded-[2rem] overflow-hidden shadow-2xl max-h-[90dvh]">
          {/* Header */}
          <header className="flex items-center justify-between px-6 pt-8 pb-4 shrink-0 z-20">
            <div className="size-8"></div>
            <h1 className="text-[#4a5951] text-xl font-serif font-bold tracking-tight text-center">
              Editar Regalo
            </h1>
            <button
              onClick={onClose}
              className="text-[#4a5951] flex size-10 items-center justify-center rounded-full hover:bg-[#4a5951]/5 transition-colors cursor-pointer active:scale-90"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
                close
              </span>
            </button>
          </header>

          {/* Scrollable Content */}
          <main className="flex-1 overflow-y-auto no-scrollbar px-6 pb-6">
            {/* Image Card */}
            <div className="mt-2 mb-8 relative group w-full aspect-[4/3] rounded-xl overflow-hidden shadow-soft bg-[#eceae5]">
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt={formData.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-gray-300 text-6xl">
                    card_giftcard
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#4a5951]/30 via-transparent to-transparent opacity-60"></div>
              
              {/* Change Photo Button */}
              <div className="absolute bottom-4 right-4 z-10">
                <label className="flex items-center gap-2 bg-[#d3c3db]/95 hover:bg-[#d3c3db] backdrop-blur-sm text-[#4a5951] font-bold text-sm px-5 py-2.5 rounded-xl shadow-lg transition-all active:scale-95 border border-white/20 cursor-pointer">
                  <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                  <span>Cambiar Foto</span>
                  <input
                    type="text"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleChange}
                    placeholder="URL de imagen"
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* URL Input (visible) */}
            <div className="mb-6">
              <input
                type="text"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                placeholder="O pega una URL de imagen"
                className="w-full rounded-xl border-[#e6e4dc] bg-white px-4 py-2.5 text-sm text-[#131514] placeholder:text-[#807d7c]/50 focus:border-[#4a5951] focus:ring-1 focus:ring-[#4a5951] focus:outline-none transition-shadow shadow-sm"
              />
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="flex flex-col gap-2 group">
                <label className="text-[#4a5951] text-sm font-bold ml-1 tracking-wide">
                  Nombre del Regalo
                </label>
                <input
                  className="w-full h-14 bg-white border border-[#e6e4dc] rounded-xl px-4 text-base font-medium text-[#4a5951] focus:outline-none focus:ring-2 focus:ring-[#4a5951]/20 focus:border-[#4a5951] placeholder:text-gray-400 transition-all shadow-sm"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Category */}
              <div className="flex flex-col gap-2 relative group">
                <label className="text-[#4a5951] text-sm font-bold ml-1 tracking-wide">
                  Categoría
                </label>
                <div className="relative">
                  <select
                    className="w-full h-14 appearance-none bg-white border border-[#e6e4dc] rounded-xl px-4 text-base font-medium text-[#4a5951] focus:outline-none focus:ring-2 focus:ring-[#4a5951]/20 focus:border-[#4a5951] cursor-pointer shadow-sm"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#4a5951]">
                    <span className="material-symbols-outlined">expand_more</span>
                  </div>
                </div>
              </div>

              {/* Total Amount */}
              <div className="flex flex-col gap-2">
                <label className="text-[#4a5951] text-sm font-bold ml-1 tracking-wide">
                  Monto Meta ($)
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[#4a5951]/60 font-bold text-lg">
                    $
                  </div>
                  <input
                    className="w-full h-14 bg-white border border-[#e6e4dc] rounded-xl pl-9 pr-4 text-base font-medium text-[#4a5951] focus:outline-none focus:ring-2 focus:ring-[#4a5951]/20 focus:border-[#4a5951] placeholder:text-gray-400 transition-all shadow-sm"
                    type="number"
                    name="total_amount"
                    step="0.01"
                    value={formData.total_amount}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2">
                <label className="text-[#4a5951] text-sm font-bold ml-1 tracking-wide">
                  Descripción (Opcional)
                </label>
                <textarea
                  className="w-full bg-white border border-[#e6e4dc] rounded-xl px-4 py-3 text-base text-[#4a5951] focus:outline-none focus:ring-2 focus:ring-[#4a5951]/20 focus:border-[#4a5951] placeholder:text-gray-400 transition-all shadow-sm min-h-[120px] resize-none"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe los detalles de este regalo..."
                />
              </div>
            </form>
          </main>

          {/* Footer Actions */}
          <footer className="shrink-0 px-6 py-6 bg-[#fbf8f0] border-t border-[#4a5951]/5 z-20 flex flex-col gap-3">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full h-14 bg-[#4a5951] hover:bg-[#3d4b43] text-white text-base font-bold tracking-wide rounded-xl shadow-[0_8px_20px_-4px_rgba(74,89,81,0.4)] flex items-center justify-center transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full flex flex-col items-center justify-center gap-1 text-[#996678] hover:text-[#7a4e5c] group transition-colors"
            >
              <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform duration-300">
                delete
              </span>
              <span className="text-xs font-bold uppercase tracking-wider">Eliminar Regalo</span>
            </button>
          </footer>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="¿Eliminar este regalo?"
        message="Esta acción no se puede deshacer. El regalo se eliminará permanentemente."
      />
    </>
  )
}
