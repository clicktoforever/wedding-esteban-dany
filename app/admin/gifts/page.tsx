'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/browser'
import Image from 'next/image'
import NewGiftModal from '@/components/admin/gifts/NewGiftModal'
import EditGiftModal from '@/components/admin/gifts/EditGiftModal'
import BottomNav from '@/components/admin/BottomNav'

interface Gift {
  id: string
  name: string
  description: string | null
  image_url: string | null
  category: string | null
  price: number | null
  total_amount: number
  collected_amount: number
  status: 'AVAILABLE' | 'COMPLETED'
  is_crowdfunding: boolean
}

const CATEGORIES = [
  { id: 'all', label: 'Todo' },
  { id: 'luna-de-miel', label: 'Luna de Miel' },
  { id: 'hogar', label: 'Hogar' },
  { id: 'cocina', label: 'Cocina' },
  { id: 'experiencias', label: 'Experiencias' },
]

export default function GiftsAdminPage() {
  const [gifts, setGifts] = useState<Gift[]>([])
  const [filteredGifts, setFilteredGifts] = useState<Gift[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('active')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showNewModal, setShowNewModal] = useState(false)
  const [editingGift, setEditingGift] = useState<Gift | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadGifts()
  }, [])

  useEffect(() => {
    filterGifts()
  }, [gifts, searchQuery, activeTab, selectedCategory])

  const loadGifts = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('gifts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setGifts(data || [])
    } catch (error) {
      console.error('Error loading gifts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterGifts = () => {
    let filtered = [...gifts]

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(gift =>
        gift.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gift.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by tab (all/active/completed)
    if (activeTab === 'active') {
      filtered = filtered.filter(gift => gift.status === 'AVAILABLE')
    } else if (activeTab === 'completed') {
      filtered = filtered.filter(gift => gift.status === 'COMPLETED')
    }

    // Filter by category
    if (selectedCategory !== 'all' && selectedCategory) {
      filtered = filtered.filter(gift => gift.category === selectedCategory)
    }

    setFilteredGifts(filtered)
  }

  const getProgressPercentage = (collected: number, total: number) => {
    if (total === 0) return 0
    return Math.min((collected / total) * 100, 100)
  }

  return (
    <div className="min-h-screen bg-[#fbf8f0] pb-24">
      {/* Header */}
      <header className="px-6 pt-12 pb-4 flex flex-col gap-1">
        <div className="flex justify-between items-start">
          <div className="flex flex-col w-full">
            <p className="text-[#4a5951] text-xs font-bold tracking-[0.15em] uppercase mb-1">
              Esteban &amp; Dany
            </p>
            <h1 className="text-[32px] leading-tight font-serif font-bold text-[#131514] mb-4">
              Gestión de Regalos
            </h1>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4a5951]/40 material-symbols-outlined">
            search
          </span>
          <input
            className="w-full bg-white border-none rounded-xl py-3.5 pl-11 pr-4 text-sm shadow-sm placeholder:text-[#807d7c]/60 focus:ring-2 focus:ring-[#4a5951]/20 outline-none text-[#131514] transition-shadow"
            placeholder="Buscar regalo por nombre..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      {/* Filters */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Tabs */}
        <div className="px-6">
          <div className="flex bg-[#edece6] p-1 rounded-xl relative">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'all'
                  ? 'bg-white text-[#4a5951] shadow-sm'
                  : 'text-[#807d7c] hover:text-[#4a5951]'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'active'
                  ? 'bg-white text-[#4a5951] shadow-sm'
                  : 'text-[#807d7c] hover:text-[#4a5951]'
              }`}
            >
              Activos
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'completed'
                  ? 'bg-white text-[#4a5951] shadow-sm'
                  : 'text-[#807d7c] hover:text-[#4a5951]'
              }`}
            >
              Completados
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="overflow-x-auto no-scrollbar pl-6 pr-2">
          <div className="flex gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-[#4a5951] text-white shadow-soft'
                    : 'bg-white border border-[#4a5951]/10 text-[#807d7c] hover:bg-[#4a5951]/5'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gifts Grid */}
      <main className="px-6">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse"
              >
                <div className="h-32 w-full bg-gray-100" />
                <div className="p-3 flex flex-col gap-2">
                  <div className="h-4 bg-gray-100 rounded mb-2" />
                  <div className="h-1.5 bg-gray-100 rounded" />
                  <div className="h-3 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredGifts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="material-symbols-outlined text-[#807d7c] text-5xl mb-4">
              card_giftcard
            </span>
            <p className="text-[#807d7c] text-sm">No se encontraron regalos</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filteredGifts.map((gift) => {
              const progress = getProgressPercentage(gift.collected_amount, gift.total_amount)
              const isCompleted = gift.status === 'COMPLETED'

              return (
                <div
                  key={gift.id}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden relative"
                >
                  {/* Image */}
                  <div className="h-32 w-full bg-gray-100 relative overflow-hidden">
                    {gift.image_url ? (
                      <Image
                        src={gift.image_url}
                        alt={gift.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-gray-300 text-4xl">
                          card_giftcard
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="p-3 flex flex-col flex-1">
                    <h3 className="font-bold text-sm text-[#131514] leading-tight mb-2 line-clamp-2">
                      {gift.name}
                    </h3>

                    <div className="mt-auto flex flex-col gap-2">
                      {/* Progress Bar */}
                      <div className="h-1.5 w-full bg-[#f0eee6] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${
                            isCompleted ? 'bg-[#4a5951]' : 'bg-[#d3c3db]'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      {/* Amounts */}
                      <div className="flex flex-col text-[10px] leading-tight">
                        <p className="text-[#807d7c]">
                          Recaudado:{' '}
                          <span className="font-bold text-[#4a5951]">
                            ${gift.collected_amount.toLocaleString()}
                          </span>
                        </p>
                        <p className="text-[#807d7c]/70">
                          Meta: ${gift.total_amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Edit Button */}
                  <button
                    onClick={() => setEditingGift(gift)}
                    className="absolute bottom-2 right-2 w-7 h-7 bg-white shadow-sm rounded-full flex items-center justify-center text-[#4a5951] hover:bg-gray-50 transition-colors z-10"
                  >
                    <span className="material-symbols-outlined text-[14px]">edit</span>
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* FAB */}
      <button
        onClick={() => setShowNewModal(true)}
        className="fixed bottom-24 right-6 z-30 w-14 h-14 rounded-full bg-[#4a5951] text-white shadow-lg hover:bg-[#3d4b43] active:scale-95 transition-all flex items-center justify-center"
      >
        <span className="material-symbols-outlined text-[28px]">add</span>
      </button>

      {/* Modals */}
      <NewGiftModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSuccess={loadGifts}
      />

      {editingGift && (
        <EditGiftModal
          isOpen={!!editingGift}
          gift={editingGift}
          onClose={() => setEditingGift(null)}
          onSuccess={loadGifts}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
