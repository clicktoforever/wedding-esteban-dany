'use client'

import Image from 'next/image'
import type { Database } from '@/lib/database.types'
import { formatCurrency } from '@/lib/payphone'

type Gift = Database['public']['Tables']['gifts']['Row']

interface GiftCardProps {
  gift: Gift
  onContribute?: (gift: Gift) => void
}

export default function GiftCard({ gift, onContribute }: GiftCardProps) {
  const isCrowdfunding = gift.is_crowdfunding
  const isCompleted = gift.status === 'COMPLETED'
  const totalAmount = gift.total_amount ?? 0
  const collectedAmount = gift.collected_amount ?? 0
  const progressPercentage = isCrowdfunding && totalAmount > 0
    ? (collectedAmount / totalAmount) * 100
    : 0
  const remainingAmount = totalAmount - collectedAmount
  const hasContributions = collectedAmount > 0
  
  // Use contributor_count if available, otherwise fallback to 0
  const contributorCount = gift.contributor_count || 0

  // Varied heights for masonry effect - use gift id to determine height
  const giftIdNumber = typeof gift.id === 'string' ? parseInt(gift.id, 10) : gift.id
  const heightIndex = giftIdNumber % 4

  return (
    <div
      className={`bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ${
        isCompleted ? 'opacity-90 grayscale' : ''
      }`}
    >
      {/* Image */}
      <div className={`relative bg-gray-100 overflow-hidden group ${
        heightIndex === 0 ? 'h-48 min-h-[12rem]' :
        heightIndex === 1 ? 'h-56 min-h-[14rem]' :
        heightIndex === 2 ? 'h-60 min-h-[15rem]' :
        'h-72 min-h-[18rem]'
      }`}>
        {gift.image_url ? (
          <Image
            src={gift.image_url}
            alt={gift.name}
            fill
            unoptimized
            className={`object-cover transition-transform duration-500 ${
              isCompleted ? '' : 'group-hover:scale-105'
            }`}
            sizes="(max-width: 640px) 100vw, 50vw"
            priority={giftIdNumber % 4 === 0}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
            </svg>
          </div>
        )}
        
        {/* Category Badge */}
        {gift.category && (
          <div className="absolute top-3 right-3">
            <span className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium text-primary shadow-sm">
              {gift.category}
            </span>
          </div>
        )}

        {/* Completed Badge */}
        {isCompleted && (
          <div className="absolute top-3 left-3">
            <span className="bg-[#E6B34A] text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              ¡Completado!
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Contributors Count */}
        {hasContributions && !isCompleted && contributorCount > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-3">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
            </svg>
            <span>
              {contributorCount} {contributorCount === 1 ? 'invitado ha' : 'invitados han'} colaborado
            </span>
          </div>
        )}

        {/* Title */}
        <h3 className="font-serif text-xl text-gray-900 mb-2 leading-snug">
          {gift.name}
        </h3>
        
        {/* Description */}
        {gift.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
            {gift.description}
          </p>
        )}

        {/* Progress Section */}
        {!isCompleted && isCrowdfunding && (
          <div className="mb-5 space-y-2.5">
            {/* Always show collected and remaining amounts */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Recaudado: <span className="font-semibold text-primary">{formatCurrency(collectedAmount)}</span>
              </span>
              <span className="text-gray-600">
                Faltan: <span className="font-semibold text-[#d3c3db]">{formatCurrency(remainingAmount)}</span>
              </span>
            </div>
            
            {/* Show "be the first" message only when there are no contributions */}
            {!hasContributions && (
              <div className="text-center">
                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                  </svg>
                  Sé el primero en colaborar
                </span>
              </div>
            )}
            
            {/* Show progress bar only when there are contributions */}
            {hasContributions && (
              <div className="w-full bg-[#d3c3db]/30 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#d3c3db] h-full transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                />
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={() => onContribute?.(gift)}
          disabled={isCompleted}
          className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
            isCompleted
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'border-2 border-primary text-primary hover:bg-primary hover:text-white'
          }`}
        >
          {isCompleted ? '✓ Completado' : 'Colaborar'}
        </button>
      </div>
    </div>
  )
}
