'use client'

import { useState } from 'react'
import GiftCard from './GiftCard'
import ContributionModal from './ContributionModal'
import type { Database } from '@/lib/database.types'

type Gift = Database['public']['Tables']['gifts']['Row']

interface GiftRegistryProps {
  initialGifts: Gift[]
}

export default function GiftRegistry({ initialGifts }: GiftRegistryProps) {
  const [gifts, setGifts] = useState<Gift[]>(initialGifts)
  const [selectedCategory, setSelectedCategory] = useState<string | null>('all')
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Extract unique categories
  const categories = ['all', ...Array.from(new Set(gifts.map(gift => gift.category).filter(Boolean)))]

  // Filter gifts by category
  const filteredGifts = selectedCategory === 'all' 
    ? gifts 
    : gifts.filter(gift => gift.category === selectedCategory)

  const handleContribute = (gift: Gift) => {
    setSelectedGift(gift)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedGift(null)
  }

  const availableCount = filteredGifts.filter(g => g.status !== 'COMPLETED').length
  const completedCount = filteredGifts.filter(g => g.status === 'COMPLETED').length

  return (
    <div className="space-y-12">
      {/* Stats Bar */}
      <div className="bg-white border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-3xl font-serif text-wedding-forest">{availableCount}</p>
              <p className="text-sm tracking-wider uppercase text-gray-500">Disponibles</p>
            </div>
            <div className="h-12 w-px bg-gray-200"></div>
            <div className="text-center">
              <p className="text-3xl font-serif text-gray-400">{completedCount}</p>
              <p className="text-sm tracking-wider uppercase text-gray-500">Completados</p>
            </div>
          </div>
          
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2 text-xs tracking-wider uppercase font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-wedding-purple text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category === 'all' ? 'Todos' : category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gifts Grid */}
      {filteredGifts.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-xl font-serif">No hay regalos en esta categoría</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredGifts.map(gift => (
            <GiftCard
              key={gift.id}
              gift={gift}
              onContribute={handleContribute}
            />
          ))}
        </div>
      )}

      {/* Contribution Modal */}
      {selectedGift && (
        <ContributionModal
          gift={selectedGift}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}
