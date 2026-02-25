'use client'

import { useState, useEffect } from 'react'
import GiftCard from './GiftCard'
import WelcomeModal from './WelcomeModal'
import UnifiedContributionModal from './UnifiedContributionModal'
import type { Database } from '@/lib/database.types'

type Gift = Database['public']['Tables']['gifts']['Row']

interface GiftRegistryProps {
  initialGifts: Gift[]
}

export default function GiftRegistry({ initialGifts }: GiftRegistryProps) {
  const [gifts, setGifts] = useState<Gift[]>(initialGifts)
  const [selectedCategory, setSelectedCategory] = useState<string | null>('all')
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null)

  // Modal states
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)
  const [showContributionModal, setShowContributionModal] = useState(false)

  // Always show welcome modal on page load
  useEffect(() => {
    setShowWelcomeModal(true)
  }, [])

  // Extract unique categories
  const categories = ['all', ...Array.from(new Set(gifts.map(gift => gift.category).filter(Boolean)))]

  // Filter gifts by category
  const filteredGifts = selectedCategory === 'all'
    ? gifts
    : gifts.filter(gift => gift.category === selectedCategory)

  const handleContribute = (gift: Gift) => {
    setSelectedGift(gift)
    setShowContributionModal(true)
  }

  const handleCloseContribution = () => {
    setShowContributionModal(false)
    setSelectedGift(null)
  }

  const handleContributionSuccess = () => {
    // Refresh gifts data
    globalThis.location.reload()
  }

  return (
    <div>
      {/* Category Filter - Horizontal Scroll */}
      <div className="w-full overflow-x-auto no-scrollbar py-6 px-4 lg:px-8 mb-2">
        <div className="flex gap-2 min-w-max mx-auto justify-start md:justify-center">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap font-sans ${selectedCategory === category
                ? 'bg-primary text-white shadow-md'
                : 'bg-[#eaefe8] text-[#666666] hover:bg-[#dce3da]'
                }`}
            >
              {category === 'all' ? 'Todos' : category}
            </button>
          ))}
        </div>
      </div>

      {/* Gifts Masonry Grid */}
      {filteredGifts.length === 0 ? (
        <div className="text-center py-20 px-4 text-gray-500">
          <p className="text-xl font-serif">No hay regalos en esta categoría</p>
        </div>
      ) : (
        <div className="px-4 lg:px-8 pb-12">
          <div className="columns-1 sm:columns-2 gap-6 space-y-6">
            {filteredGifts.map(gift => (
              <div key={gift.id} className="break-inside-avoid">
                <GiftCard
                  gift={gift}
                  onContribute={handleContribute}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Welcome Modal */}
      {showWelcomeModal && (
        <WelcomeModal onClose={() => setShowWelcomeModal(false)} />
      )}

      {/* Unified Contribution Modal */}
      {selectedGift && (
        <UnifiedContributionModal
          gift={selectedGift}
          isOpen={showContributionModal}
          onClose={handleCloseContribution}
          onSuccess={handleContributionSuccess}
        />
      )}
    </div>
  )
}
