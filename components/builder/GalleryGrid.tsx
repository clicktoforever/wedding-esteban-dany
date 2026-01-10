'use client'

import Image from 'next/image'

interface GalleryImage {
  url: string
  alt: string
}

interface GalleryGridProps {
  images: GalleryImage[]
  columns?: number
}

export default function GalleryGrid({ images = [], columns = 3 }: GalleryGridProps) {
  if (!images.length) {
    return (
      <div className="py-12 px-4 text-center text-gray-500">
        No hay imágenes para mostrar
      </div>
    )
  }

  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
  }[columns] || 'md:grid-cols-3'

  return (
    <div className={`grid grid-cols-1 ${gridCols} gap-4 p-4`}>
      {images.map((image, index) => (
        <div
          key={index}
          className="relative aspect-square overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow"
        >
          <Image
            src={image.url}
            alt={image.alt || `Imagen ${index + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      ))}
    </div>
  )
}
