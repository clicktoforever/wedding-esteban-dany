'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/browser'
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
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const supabase = createClient()

  // Extract unique categories
  const categories = ['all', ...Array.from(new Set(gifts.map(gift => gift.category).filter(Boolean)))]

  // Filter gifts by category
  const filteredGifts = selectedCategory === 'all' 
    ? gifts 
    : gifts.filter(gift => gift.category === selectedCategory)

  const purchaseGift = async (giftId: string) => {
    setMessage(null)

    // Find the gift to update
    const giftToPurchase = gifts.find(g => g.id === giftId)
    if (!giftToPurchase) return

    // Optimistic update
    setGifts(prev =>
      prev.map(gift =>
        gift.id === giftId
          ? { ...gift, is_purchased: true, purchased_at: new Date().toISOString() }
          : gift
      )
    )

    startTransition(async () => {
      const { error } = await supabase
        .from('gifts')
        // @ts-ignore - Supabase type inference issue
        .update({
          is_purchased: true,
          purchased_at: new Date().toISOString(),
        })
        .eq('id', giftId)
        .eq('is_purchased', false) // Prevent race condition

      if (error) {
        // Rollback on error
        setGifts(initialGifts)
        setMessage({
          type: 'error',
          text: 'Este regalo ya fue apartado por otra persona. Por favor elige otro.',
        })
        console.error('Error purchasing gift:', error)
        
        // Refetch to get latest state
        const { data } = await supabase
          .from('gifts')
          .select('*')
          .order('category', { ascending: true })
          .order('name', { ascending: true })
        
        if (data) {
          setGifts(data)
        }
      } else {
        setMessage({
          type: 'success',
          text: '¡Regalo apartado exitosamente! Gracias por tu generosidad 💝',
        })
        
        // Refetch to ensure consistency
        const { data } = await supabase
          .from('gifts')
          .select('*')
          .order('category', { ascending: true })
          .order('name', { ascending: true })
        
        if (data) {
          setGifts(data)
        }
      }
    })
  }

  const handleContribute = (gift: Gift) => {
    setSelectedGift(gift)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedGift(null)
  }

  const availableCount = filteredGifts.filter(g => !g.is_purchased && g.status !== 'COMPLETED').length
  const purchasedCount = filteredGifts.filter(g => g.is_purchased || g.status === 'COMPLETED').length

  return (
    <div className="space-y-12">
      {message && (
        <div
          className={`p-6 border text-center ${
            message.type === 'success'
              ? 'bg-wedding-beige text-wedding-forest border-wedding-sage'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
          role="alert"
        >
          <p className="font-medium">{message.text}</p>
        </div>
      )}

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
              <p className="text-3xl font-serif text-gray-400">{purchasedCount}</p>
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
              onPurchase={purchaseGift}
              onContribute={handleContribute}
              disabled={isPending}
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
