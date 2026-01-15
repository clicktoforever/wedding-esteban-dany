'use client'

import { useState, useEffect } from 'react'
import GiftCard from './GiftCard'
import ContributionModal from './ContributionModal'
import WelcomeModal from './WelcomeModal'
import PaymentMethodModal from './PaymentMethodModal'
import TransferModal from './TransferModal'
import type { Database } from '@/lib/database.types'

type Gift = Database['public']['Tables']['gifts']['Row']

interface GiftRegistryProps {
  initialGifts: Gift[]
}

type PaymentMethod = 'card' | 'transfer_ec' | 'transfer_mx' | null

export default function GiftRegistry({ initialGifts }: GiftRegistryProps) {
  const [gifts, setGifts] = useState<Gift[]>(initialGifts)
  const [selectedCategory, setSelectedCategory] = useState<string | null>('all')
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null)
  
  // Modal states
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [showCardModal, setShowCardModal] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(null)

  // Check if welcome modal should be shown
  useEffect(() => {
    const hideWelcome = localStorage.getItem('hideGiftsWelcome')
    if (hideWelcome !== 'true') {
      setShowWelcomeModal(true)
    }
  }, [])

  // Extract unique categories
  const categories = ['all', ...Array.from(new Set(gifts.map(gift => gift.category).filter(Boolean)))]

  // Filter gifts by category
  const filteredGifts = selectedCategory === 'all' 
    ? gifts 
    : gifts.filter(gift => gift.category === selectedCategory)

  const handleContribute = (gift: Gift) => {
    setSelectedGift(gift)
    setShowPaymentMethodModal(true)
  }

  const handleSelectPaymentMethod = (method: 'card' | 'transfer_ec' | 'transfer_mx') => {
    setSelectedPaymentMethod(method)
    setShowPaymentMethodModal(false)
    
    if (method === 'card') {
      setShowCardModal(true)
    } else {
      setShowTransferModal(true)
    }
  }

  const handleCloseAllModals = () => {
    setShowPaymentMethodModal(false)
    setShowCardModal(false)
    setShowTransferModal(false)
    setSelectedPaymentMethod(null)
  }

  const handleTransferSuccess = () => {
    // Refresh gifts data
    globalThis.location.reload()
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

      {/* Welcome Modal - Always available */}
      {showWelcomeModal && (
        <WelcomeModal onClose={() => setShowWelcomeModal(false)} />
      )}

      {/* Contribution Modal */}
      {selectedGift && (
        <>
          {/* Payment Method Selection */}
          <PaymentMethodModal
            gift={selectedGift}
            isOpen={showPaymentMethodModal}
            onClose={() => {
              setShowPaymentMethodModal(false)
              setSelectedGift(null)
            }}
            onSelectMethod={handleSelectPaymentMethod}
          />

          {/* Card Payment Modal (Payphone) */}
          {showCardModal && (
            <ContributionModal
              gift={selectedGift}
              isOpen={showCardModal}
              onClose={() => {
                handleCloseAllModals()
                setSelectedGift(null)
              }}
            />
          )}

          {/* Transfer Modal (EC or MX) */}
          {showTransferModal && selectedPaymentMethod && (
            <TransferModal
              gift={selectedGift}
              country={selectedPaymentMethod === 'transfer_ec' ? 'EC' : 'MX'}
              isOpen={showTransferModal}
              onClose={() => {
                handleCloseAllModals()
                setSelectedGift(null)
              }}
              onSuccess={handleTransferSuccess}
            />
          )}
        </>
      )}
    </div>
  )
}
