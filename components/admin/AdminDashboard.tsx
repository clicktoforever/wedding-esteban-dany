'use client'

import type { Database } from '@/lib/database.types'

type Guest = Database['public']['Tables']['guests']['Row']
type Pass = Database['public']['Tables']['passes']['Row']
type Gift = Database['public']['Tables']['gifts']['Row']

interface GuestWithPasses extends Guest {
  passes: Pass[]
}

interface Stats {
  total_guests: number
  total_passes: number
  confirmed_passes: number
  declined_passes: number
  pending_passes: number
  total_gifts: number
  purchased_gifts: number
}

interface AdminDashboardProps {
  stats: Stats
  guests: GuestWithPasses[]
  gifts: Gift[]
}

export default function AdminDashboard({ stats, guests, gifts }: AdminDashboardProps) {
  const confirmationRate = stats.total_passes > 0 
    ? ((stats.confirmed_passes / stats.total_passes) * 100).toFixed(1)
    : '0.0'

  const giftsPurchasedRate = stats.total_gifts > 0
    ? ((stats.purchased_gifts / stats.total_gifts) * 100).toFixed(1)
    : '0.0'

  const exportToExcel = () => {
    // Preparar datos para exportar
    const rows: string[][] = []
    
    // Encabezados
    rows.push([
      'Invitado',
      'Email',
      'Tel\u00e9fono',
      'Nombre Asistente',
      'Estado',
      'Restricciones Diet\u00e9ticas',
      'Notas'
    ])

    // Datos de cada invitado y sus pases
    guests.forEach(guest => {
      guest.passes.forEach(pass => {
        const statusMap = {
          'confirmed': 'Confirmado',
          'declined': 'Declinado',
          'pending': 'Pendiente'
        }
        
        rows.push([
          guest.name,
          guest.email || '',
          guest.phone || '',
          pass.attendee_name,
          statusMap[pass.confirmation_status as keyof typeof statusMap] || pass.confirmation_status,
          pass.dietary_restrictions || '',
          pass.notes || ''
        ])
      })
    })

    // Convertir a CSV
    const csvContent = rows.map(row => 
      row.map(cell => {
        // Escapar comillas dobles y envolver en comillas si contiene comas o saltos de l\u00ednea
        const cellStr = String(cell).replace(/"/g, '""')
        return cellStr.includes(',') || cellStr.includes('\n') || cellStr.includes('"') 
          ? `"${cellStr}"` 
          : cellStr
      }).join(',')
    ).join('\n')

    // Agregar BOM para que Excel reconozca UTF-8
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `invitados_boda_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-8">
      {/* Progress Overview */}
      <div className="bg-white border border-gray-200 p-8">
        <h2 className="text-2xl font-serif text-wedding-forest mb-8">
          Estado de Confirmaciones
        </h2>
        
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm tracking-wider uppercase text-gray-600">Confirmados</span>
              <span className="text-sm font-medium text-wedding-forest">{stats.confirmed_passes} de {stats.total_passes}</span>
            </div>
            <div className="w-full h-3 bg-gray-100">
              <div 
                className="h-full bg-wedding-sage transition-all duration-500"
                style={{ width: `${confirmationRate}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm tracking-wider uppercase text-gray-600">Pendientes</span>
              <span className="text-sm font-medium text-amber-600">{stats.pending_passes} de {stats.total_passes}</span>
            </div>
            <div className="w-full h-3 bg-gray-100">
              <div 
                className="h-full bg-amber-400 transition-all duration-500"
                style={{ width: `${(stats.pending_passes / stats.total_passes * 100) || 0}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm tracking-wider uppercase text-gray-600">Declinados</span>
              <span className="text-sm font-medium text-gray-500">{stats.declined_passes} de {stats.total_passes}</span>
            </div>
            <div className="w-full h-3 bg-gray-100">
              <div 
                className="h-full bg-gray-400 transition-all duration-500"
                style={{ width: `${(stats.declined_passes / stats.total_passes * 100) || 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Guests Table */}
      <div className="bg-white border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-wedding-beige/30 flex justify-between items-center">
          <h2 className="text-2xl font-serif text-wedding-forest">
            Lista de Invitados
          </h2>
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-6 py-3 bg-wedding-forest text-white tracking-wider uppercase text-sm font-medium hover:bg-wedding-forest/90 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Descargar Excel</span>
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Invitado Principal
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Acompañantes
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Contacto
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {guests.map(guest => {
                const confirmedCount = guest.passes.filter(p => p.confirmation_status === 'confirmed').length
                const declinedCount = guest.passes.filter(p => p.confirmation_status === 'declined').length
                const pendingCount = guest.passes.filter(p => p.confirmation_status === 'pending').length

                return (
                  <tr key={guest.id} className="hover:bg-wedding-beige/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-serif text-wedding-forest">
                        {guest.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {guest.passes.length} pase{guest.passes.length !== 1 ? 's' : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {guest.passes.map(pass => (
                          <div key={pass.id} className="text-sm text-gray-600">
                            {pass.attendee_name}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        {confirmedCount > 0 && (
                          <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-wedding-sage/20 text-wedding-forest uppercase tracking-wider w-fit">
                            ✓ {confirmedCount} confirmado{confirmedCount > 1 ? 's' : ''}
                          </span>
                        )}
                        {pendingCount > 0 && (
                          <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-amber-100 text-amber-700 uppercase tracking-wider w-fit">
                            ⏳ {pendingCount} pendiente{pendingCount > 1 ? 's' : ''}
                          </span>
                        )}
                        {declinedCount > 0 && (
                          <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 uppercase tracking-wider w-fit">
                            ✗ {declinedCount} declinado{declinedCount > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 space-y-1">
                        {guest.email && <div className="truncate max-w-xs">{guest.email}</div>}
                        {guest.phone && <div>{guest.phone}</div>}
                        {!guest.email && !guest.phone && <span className="text-gray-400">-</span>}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        
        {guests.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg font-serif">No hay invitados registrados aún</p>
          </div>
        )}
      </div>

      {/* Gifts Tables */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Available Gifts */}
        <div className="bg-white border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-wedding-rose/20">
            <h3 className="text-xl font-serif text-wedding-forest">
              Regalos Disponibles
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {gifts.filter(g => !g.is_purchased).length} artículos
            </p>
          </div>
          <div className="p-6 max-h-96 overflow-y-auto">
            <div className="space-y-3">
              {gifts.filter(g => !g.is_purchased).map(gift => (
                <div key={gift.id} className="flex justify-between items-start pb-3 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{gift.name}</p>
                    {gift.category && (
                      <p className="text-xs text-gray-500 mt-1">{gift.category}</p>
                    )}
                  </div>
                  {gift.price && (
                    <p className="text-sm font-serif text-wedding-purple ml-4">
                      ${gift.price.toLocaleString('es-MX')}
                    </p>
                  )}
                </div>
              ))}
              {gifts.filter(g => !g.is_purchased).length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">
                  Todos los regalos han sido apartados
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Purchased Gifts */}
        <div className="bg-white border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-wedding-sage/10">
            <h3 className="text-xl font-serif text-wedding-forest">
              Regalos Apartados
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {gifts.filter(g => g.is_purchased).length} artículos
            </p>
          </div>
          <div className="p-6 max-h-96 overflow-y-auto">
            <div className="space-y-3">
              {gifts.filter(g => g.is_purchased).map(gift => (
                <div key={gift.id} className="pb-3 border-b border-gray-100 last:border-0">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-medium text-gray-800">{gift.name}</p>
                    {gift.price && (
                      <p className="text-sm font-serif text-wedding-purple ml-4">
                        ${gift.price.toLocaleString('es-MX')}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {gift.purchased_at && (() => {
                      const date = new Date(gift.purchased_at)
                      // Format using UTC to ensure consistency between server and client
                      return new Intl.DateTimeFormat('es-MX', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        timeZone: 'UTC'
                      }).format(date)
                    })()}
                  </p>
                </div>
              ))}
              {gifts.filter(g => g.is_purchased).length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">
                  Aún no hay regalos apartados
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
