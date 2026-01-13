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
  const progressPercentage = isCrowdfunding && gift.total_amount > 0
    ? (gift.collected_amount / gift.total_amount) * 100
    : 0
  const remainingAmount = gift.total_amount - gift.collected_amount

  return (
    <div
      className={`card-elegant ${
        isCompleted ? 'opacity-50' : ''
      }`}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-wedding-beige/30 overflow-hidden group">
        {gift.image_url ? (
          <Image
            src={gift.image_url}
            alt={gift.name}
            fill
            className={`object-cover transition-transform duration-500 ${
              isCompleted ? '' : 'group-hover:scale-110'
            }`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-wedding-sage/30">
            <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.5 3.8 10.7 10 12 6.2-1.3 10-6.5 10-12V7l-10-5zm0 18.5c-4.8-1.1-8-5.3-8-9.5V8.2l8-4.7 8 4.7V11c0 4.2-3.2 8.4-8 9.5z"/>
            </svg>
          </div>
        )}
        
        {isCompleted && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white px-6 py-3 text-sm tracking-wider uppercase font-semibold text-gray-700">
              ✓ Completado
            </div>
          </div>
        )}

        {gift.category && !isCompleted && (
          <div className="absolute top-4 left-4">
            <span className="bg-wedding-lavender/90 backdrop-blur-sm px-4 py-1 text-xs tracking-wider uppercase font-medium text-wedding-forest">
              {gift.category}
            </span>
          </div>
        )}

        {/* Crowdfunding Badge */}
        {isCrowdfunding && !isCompleted && (
          <div className="absolute top-4 right-4">
            <span className="bg-wedding-rose/90 backdrop-blur-sm px-3 py-1 text-xs tracking-wider uppercase font-medium text-white flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
              </svg>
              Contribución
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-serif text-wedding-forest mb-3">
          {gift.name}
        </h3>
        
        {gift.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
            {gift.description}
          </p>
        )}

        {/* Crowdfunding Progress */}
        {isCrowdfunding ? (
          <div className="mb-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Progreso</span>
              <span className="text-sm font-bold text-wedding-forest">
                {progressPercentage.toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-wedding-sage to-wedding-forest h-full transition-all duration-500"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {formatCurrency(gift.collected_amount)}
              </span>
              <span className="font-bold text-wedding-purple">
                {formatCurrency(gift.total_amount)}
              </span>
            </div>
            {!isCompleted && remainingAmount > 0 && (
              <div className="bg-wedding-beige/30 px-4 py-2 text-center">
                <p className="text-xs text-gray-600">
                  Faltan <span className="font-semibold text-wedding-rose">{formatCurrency(remainingAmount)}</span>
                </p>
              </div>
            )}
          </div>
        ) : (
          gift.price && (
            <p className="text-2xl font-serif text-wedding-purple mb-6">
              ${gift.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </p>
          )
        )}

        <div className="space-y-2">
          {gift.store_url && !isCompleted && (
            <a
              href={gift.store_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center border-2 border-gray-300 text-gray-600 py-3 px-4 text-sm tracking-wider uppercase font-medium transition-all duration-300 hover:bg-gray-50"
            >
              Ver en Tienda
            </a>
          )}
          
          {/* Contribution Button */}
          <button
            onClick={() => onContribute?.(gift)}
            disabled={isCompleted}
            className={`w-full py-3 px-4 text-sm tracking-wider uppercase font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
              isCompleted
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'btn-primary'
            }`}
          >
            {isCompleted ? (
              '✓ Completado'
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                </svg>
                Aportar
              </>
            )}
          </button>

        </div>
      </div>
    </div>
  )
}
