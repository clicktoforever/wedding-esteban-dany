'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/browser'
import Image from 'next/image'

interface NewGiftModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const CATEGORIES = [
  { value: '', label: 'Selecciona una categoría' },
  { value: 'luna-de-miel', label: 'Luna de Miel' },
  { value: 'hogar', label: 'Hogar' },
  { value: 'cocina', label: 'Cocina' },
  { value: 'experiencias', label: 'Experiencias' },
  { value: 'efectivo', label: 'Fondo de efectivo' },
  { value: 'otros', label: 'Otros' },
]

export default function NewGiftModal({ isOpen, onClose, onSuccess }: NewGiftModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    category: '',
    total_amount: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

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
      
      const { error } = await (supabase.from('gifts') as any).insert({
        name: formData.name,
        description: formData.description || null,
        image_url: formData.image_url || null,
        category: formData.category || null,
        total_amount: formData.total_amount ? parseFloat(formData.total_amount) : 0,
        collected_amount: 0,
        status: 'AVAILABLE',
        is_crowdfunding: true,
      })

      if (error) throw error

      // Reset form
      setFormData({
        name: '',
        description: '',
        image_url: '',
        category: '',
        total_amount: '',
      })
      setImagePreview(null)
      
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error creating gift:', error)
      alert('Error al crear el regalo')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-900/10 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md transform overflow-hidden rounded-[2rem] bg-[#fbf8f0] shadow-soft transition-all max-h-[90dvh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2 shrink-0">
          <h2 className="text-xl font-bold tracking-tight text-[#131514]">Nuevo Regalo</h2>
          <button
            onClick={onClose}
            className="group flex h-8 w-8 items-center justify-center rounded-full bg-transparent transition-colors hover:bg-black/5 active:bg-black/10 focus:outline-none"
          >
            <span className="material-symbols-outlined text-[#131514]/60 group-hover:text-[#131514]">
              close
            </span>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Image Upload */}
          <div className="w-full">
            <div className="group relative flex aspect-[16/10] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#E9E1D2] bg-white transition-all hover:border-[#4a5951]/40 hover:bg-[#4a5951]/5 active:scale-[0.99] overflow-hidden">
              {imagePreview ? (
                <div className="relative w-full h-full">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, image_url: '' }))
                      setImagePreview(null)
                    }}
                    className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-[#996678] text-[20px]">close</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-[#807d7c]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fbf8f0] text-[#4a5951] shadow-sm ring-1 ring-black/5 group-hover:scale-110 transition-transform duration-300">
                    <span className="material-symbols-outlined text-2xl">add_a_photo</span>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-[#131514]">Subir imagen</p>
                    <p className="text-xs text-[#807d7c] mt-0.5">PNG, JPG hasta 5MB</p>
                  </div>
                </div>
              )}
            </div>
            <input
              type="text"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="O pega una URL de imagen"
              className="mt-2 w-full rounded-xl border-[#E9E1D2] bg-white px-4 py-2.5 text-sm text-[#131514] placeholder:text-[#807d7c]/50 focus:border-[#4a5951] focus:ring-1 focus:ring-[#4a5951] focus:outline-none transition-shadow shadow-sm hover:border-[#4a5951]/30"
            />
          </div>

          <div className="space-y-5 pb-6">
            {/* Gift Name */}
            <div className="group">
              <label
                className="block text-sm font-medium text-[#131514] mb-2 ml-1"
                htmlFor="gift-name"
              >
                Nombre del Regalo
              </label>
              <input
                className="block w-full rounded-xl border-[#E9E1D2] bg-white px-4 py-3.5 text-base text-[#131514] placeholder:text-[#807d7c]/50 focus:border-[#4a5951] focus:ring-1 focus:ring-[#4a5951] focus:outline-none transition-shadow shadow-sm hover:border-[#4a5951]/30"
                id="gift-name"
                name="name"
                placeholder="Ej. Luna de Miel en Bali"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            {/* Category */}
            <div className="group">
              <label
                className="block text-sm font-medium text-[#131514] mb-2 ml-1"
                htmlFor="gift-category"
              >
                Categoría
              </label>
              <div className="relative">
                <select
                  className="appearance-none block w-full rounded-xl border-[#E9E1D2] bg-white px-4 py-3.5 text-base text-[#131514] focus:border-[#4a5951] focus:ring-1 focus:ring-[#4a5951] focus:outline-none transition-shadow shadow-sm hover:border-[#4a5951]/30"
                  id="gift-category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value} disabled={!cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#807d7c]">
                  <span className="material-symbols-outlined">expand_more</span>
                </div>
              </div>
            </div>

            {/* Total Amount */}
            <div className="group">
              <label
                className="block text-sm font-medium text-[#131514] mb-2 ml-1"
                htmlFor="gift-amount"
              >
                Monto Meta ($)
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <span className="text-[#807d7c] font-medium">$</span>
                </div>
                <input
                  className="block w-full rounded-xl border-[#E9E1D2] bg-white pl-8 pr-4 py-3.5 text-base text-[#131514] placeholder:text-[#807d7c]/50 focus:border-[#4a5951] focus:ring-1 focus:ring-[#4a5951] focus:outline-none transition-shadow shadow-sm hover:border-[#4a5951]/30 font-medium"
                  id="gift-amount"
                  name="total_amount"
                  placeholder="0.00"
                  step="0.01"
                  type="number"
                  required
                  value={formData.total_amount}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Description */}
            <div className="group">
              <label
                className="block text-sm font-medium text-[#131514] mb-2 ml-1"
                htmlFor="gift-description"
              >
                Descripción
              </label>
              <textarea
                className="block w-full rounded-xl border-[#E9E1D2] bg-white px-4 py-3.5 text-base text-[#131514] placeholder:text-[#807d7c]/50 focus:border-[#4a5951] focus:ring-1 focus:ring-[#4a5951] focus:outline-none transition-shadow shadow-sm hover:border-[#4a5951]/30 min-h-[120px] resize-none"
                id="gift-description"
                name="description"
                placeholder="Describe los detalles de este regalo para tus invitados..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="shrink-0 px-6 py-6 bg-[#fbf8f0] border-t border-[#E9E1D2]/30">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className="relative w-full overflow-hidden rounded-xl bg-[#4a5951] px-4 py-3.5 text-base font-bold text-white shadow-lg shadow-[#4a5951]/20 transition-all hover:bg-[#3d4b43] hover:shadow-[#4a5951]/30 active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}
