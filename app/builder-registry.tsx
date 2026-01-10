'use client'

import { Builder } from '@builder.io/react'
import WeddingCountdown from '@/components/builder/WeddingCountdown'
import GalleryGrid from '@/components/builder/GalleryGrid'
import ConfirmationCTA from '@/components/builder/ConfirmationCTA'

// Register custom Builder.io components
Builder.registerComponent(WeddingCountdown, {
  name: 'WeddingCountdown',
  inputs: [
    {
      name: 'targetDate',
      type: 'string',
      defaultValue: '2026-06-15T18:00:00',
      helperText: 'Fecha y hora de la boda (formato: YYYY-MM-DDTHH:mm:ss)',
    },
    {
      name: 'title',
      type: 'string',
      defaultValue: 'Faltan',
      helperText: 'Título del contador',
    },
  ],
})

Builder.registerComponent(GalleryGrid, {
  name: 'GalleryGrid',
  inputs: [
    {
      name: 'images',
      type: 'list',
      subFields: [
        {
          name: 'url',
          type: 'file',
          allowedFileTypes: ['jpeg', 'jpg', 'png', 'webp'],
          required: true,
        },
        {
          name: 'alt',
          type: 'string',
          defaultValue: 'Imagen de galería',
        },
      ],
      defaultValue: [],
    },
    {
      name: 'columns',
      type: 'number',
      defaultValue: 3,
      helperText: 'Número de columnas en desktop',
    },
  ],
})

Builder.registerComponent(ConfirmationCTA, {
  name: 'ConfirmationCTA',
  inputs: [
    {
      name: 'title',
      type: 'string',
      defaultValue: '¿Nos acompañas?',
    },
    {
      name: 'description',
      type: 'string',
      defaultValue: 'Por favor confirma tu asistencia',
    },
    {
      name: 'whatsappNumber',
      type: 'string',
      defaultValue: '+52XXXXXXXXXX',
      helperText: 'Número de WhatsApp con código de país',
    },
  ],
})
