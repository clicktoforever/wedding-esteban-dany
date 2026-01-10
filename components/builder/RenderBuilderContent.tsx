'use client'

import { BuilderComponent, useIsPreviewing } from '@builder.io/react'
import { builder } from '@builder.io/sdk'

// Initialize Builder.io
builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY!)

interface RenderBuilderContentProps {
  content: any
  model: string
}

export function RenderBuilderContent({ content, model }: RenderBuilderContentProps) {
  const isPreviewing = useIsPreviewing()

  if (!content && !isPreviewing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-serif text-primary-600 mb-4">
            Bienvenidos
          </h1>
          <p className="text-gray-600">
            La página está siendo configurada. Por favor vuelve pronto.
          </p>
        </div>
      </div>
    )
  }

  return <BuilderComponent model={model} content={content} />
}
