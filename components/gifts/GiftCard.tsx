'use client'

import Image from 'next/image'
import type { Database } from '@/lib/database.types'

type Gift = Database['public']['Tables']['gifts']['Row']

interface GiftCardProps {
  gift: Gift
  onPurchase: (giftId: string) => Promise<void>
  disabled: boolean
}

export default function GiftCard({ gift, onPurchase, disabled }: GiftCardProps) {
  const isPurchased = gift.is_purchased

  return (
    <div
      className={`card-elegant ${
        isPurchased ? 'opacity-50' : ''
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
              isPurchased ? '' : 'group-hover:scale-110'
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
        
        {isPurchased && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white px-6 py-3 text-sm tracking-wider uppercase font-semibold text-gray-700">
              ✓ Apartado
            </div>
          </div>
        )}

        {gift.category && !isPurchased && (
          <div className="absolute top-4 left-4">
            <span className="bg-wedding-lavender/90 backdrop-blur-sm px-4 py-1 text-xs tracking-wider uppercase font-medium text-wedding-forest">
              {gift.category}
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

        {gift.price && (
          <p className="text-2xl font-serif text-wedding-purple mb-6">
            ${gift.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
        )}

        <div className="space-y-2">
          {gift.store_url && !isPurchased && (
            <a
              href={gift.store_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center border-2 border-gray-300 text-gray-600 py-3 px-4 text-sm tracking-wider uppercase font-medium transition-all duration-300 hover:bg-gray-50"
            >
              Ver en Tienda
            </a>
          )}
          
          <button
            onClick={() => onPurchase(gift.id)}
            disabled={disabled || isPurchased}
            className={`w-full py-3 px-4 text-sm tracking-wider uppercase font-medium transition-all duration-300 ${
              isPurchased
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'btn-primary'
            }`}
          >
            {isPurchased ? 'Ya Apartado' : 'Apartar Regalo'}
          </button>
        </div>
      </div>
    </div>
  )
}
