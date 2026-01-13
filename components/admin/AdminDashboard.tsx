'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/browser'
import { formatCurrency } from '@/lib/payphone'
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
  completed_gifts: number
  total_contributions?: number
  approved_contributions?: number
}

interface AdminDashboardProps {
  readonly stats: Stats
  readonly guests: GuestWithPasses[]
  readonly gifts: Gift[]
}

export default function AdminDashboard({ stats, guests, gifts }: AdminDashboardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingGuestId, setEditingGuestId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [guestToDelete, setGuestToDelete] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [countryCode, setCountryCode] = useState('+52') // Default México
  const [guestPhone, setGuestPhone] = useState('')
  const [passes, setPasses] = useState<Array<{ id?: string, attendee_name: string }>>([{ attendee_name: '' }])
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [emailError, setEmailError] = useState<string>('')

  const validateEmail = (email: string): boolean => {
    if (!email) return true // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const confirmationRate = stats.total_passes > 0 
    ? ((stats.confirmed_passes / stats.total_passes) * 100).toFixed(1)
    : '0.0'

  const giftsCompletedRate = stats.total_gifts > 0
    ? ((stats.completed_gifts / stats.total_gifts) * 100).toFixed(1)
    : '0.0'

  const addPass = () => {
    setPasses([...passes, { attendee_name: '' }])
  }

  const removePass = (index: number) => {
    if (index > 0) { // No permitir eliminar el pase principal (índice 0)
      setPasses(passes.filter((_, i) => i !== index))
    }
  }

  const updatePass = (index: number, value: string) => {
    const newPasses = [...passes]
    newPasses[index].attendee_name = value
    setPasses(newPasses)
  }

  // Actualizar automáticamente el primer pase con el nombre del invitado
  const handleGuestNameChange = (value: string) => {
    setGuestName(value)
    // Actualizar el primer pase automáticamente
    const newPasses = [...passes]
    newPasses[0].attendee_name = value
    setPasses(newPasses)
  }

  const openEditModal = (guest: GuestWithPasses) => {
    setIsEditMode(true)
    setEditingGuestId(guest.id)
    setGuestName(guest.name)
    setGuestEmail(guest.email || '')
    
    // Parsear teléfono para separar código de país
    const phone = guest.phone || ''
    // Buscar códigos de país conocidos primero
    const knownCodes = ['+593', '+52', '+57']
    const foundCode = knownCodes.find(code => phone.startsWith(code))
    
    if (foundCode) {
      setCountryCode(foundCode)
      setGuestPhone(phone.substring(foundCode.length))
    } else if (phone.startsWith('+')) {
      // Si empieza con + pero no es un código conocido, extraer hasta 3 dígitos
      const regex = /^\+(\d{1,3})/
      const match = regex.exec(phone)
      if (match) {
        const code = match[0]
        setCountryCode(code)
        setGuestPhone(phone.substring(code.length))
      } else {
        setCountryCode('+')
        setGuestPhone(phone.substring(1))
      }
    } else {
      setCountryCode('+52')
      setGuestPhone(phone)
    }
    
    setPasses(guest.passes.map(p => ({ id: p.id, attendee_name: p.attendee_name })))
    setIsModalOpen(true)
  }

  const openAddModal = () => {
    setIsEditMode(false)
    setEditingGuestId(null)
    setGuestName('')
    setGuestEmail('')
    setCountryCode('+52')
    setGuestPhone('')
    setPasses([{ attendee_name: '' }])
    setIsModalOpen(true)
  }

  const handleDeleteGuest = async () => {
    if (!guestToDelete) return

    try {
      const response = await fetch(`/api/guests/${guestToDelete}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Error al eliminar invitado')
      }

      setMessage({ type: 'success', text: 'Invitado eliminado exitosamente' })
      setTimeout(() => {
        globalThis.location.reload()
      }, 1500)
    } catch (error) {
      console.error('Error al eliminar invitado:', error)
      setMessage({ type: 'error', text: 'Error al eliminar invitado. Intenta nuevamente.' })
    } finally {
      setShowDeleteConfirm(false)
      setGuestToDelete(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)
    setEmailError('')

    // Validar email si está presente
    if (guestEmail && !validateEmail(guestEmail)) {
      setEmailError('Por favor ingresa un correo electrónico válido')
      setIsSubmitting(false)
      return
    }

    try {
      const supabase = createClient()
      const fullPhone = countryCode + guestPhone

      if (isEditMode && editingGuestId) {
        // Actualizar invitado existente
        const { error: guestError } = await supabase
          .from('guests')
          // @ts-ignore - Supabase types inference issue
          .update({
            name: guestName,
            email: guestEmail || null,
            phone: fullPhone,
          })
          .eq('id', editingGuestId)

        if (guestError) throw guestError

        // Obtener pases existentes
        const existingPassIds = passes.filter(p => p.id).map(p => p.id!)
        const newPasses = passes.filter(p => !p.id && p.attendee_name.trim())

        // Eliminar pases que ya no están (excepto el principal)
        const { data: allPasses } = await supabase
          .from('passes')
          .select('id')
          .eq('guest_id', editingGuestId)

        if (allPasses && allPasses.length > 0) {
          const passesToDelete = allPasses
            .filter((p: { id: string }, index: number) => index > 0) // No eliminar el primer pase (principal)
            .filter((p: { id: string }) => !existingPassIds.includes(p.id))

          if (passesToDelete.length > 0) {
            const { error: deleteError } = await supabase
              .from('passes')
              .delete()
              .in('id', passesToDelete.map((p: { id: string }) => p.id))

            if (deleteError) throw deleteError
          }
        }

        // Actualizar pases existentes
        for (const pass of passes.filter(p => p.id)) {
          const { error: updateError } = await supabase
            .from('passes')
            // @ts-ignore - Supabase types inference issue
            .update({ attendee_name: pass.attendee_name.trim() })
            .eq('id', pass.id!)

          if (updateError) throw updateError
        }

        // Insertar nuevos pases
        if (newPasses.length > 0) {
          const { error: insertError } = await supabase
            .from('passes')
            .insert(
              newPasses.map(p => ({
                guest_id: editingGuestId,
                attendee_name: p.attendee_name.trim(),
                confirmation_status: 'pending' as const,
              })) as any
            )

          if (insertError) throw insertError
        }

        setMessage({ type: 'success', text: 'Invitado actualizado exitosamente' })
      } else {
        // Crear nuevo invitado
        const { data: guestData, error: guestError } = await supabase
          .from('guests')
          // @ts-ignore - Supabase types inference issue
          .insert({
            name: guestName,
            email: guestEmail || null,
            phone: fullPhone,
          })
          .select()
          .single()

        if (guestError || !guestData) throw guestError || new Error('No se pudo crear el invitado')

        const passesToInsert = passes
          .filter(pass => pass.attendee_name.trim())
          .map(pass => ({
            // @ts-ignore - Supabase types inference issue
            guest_id: guestData.id,
            attendee_name: pass.attendee_name.trim(),
            confirmation_status: 'pending' as const,
          }))

        if (passesToInsert.length > 0) {
          const { error: passesError } = await supabase
            .from('passes')
            // @ts-ignore - Supabase types inference issue
            .insert(passesToInsert)

          if (passesError) throw passesError
        }

        setMessage({ type: 'success', text: 'Invitado agregado exitosamente' })
      }
      
      // Resetear formulario
      setGuestName('')
      setGuestEmail('')
      setCountryCode('+52')
      setGuestPhone('')
      setPasses([{ attendee_name: '' }])
      
      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        setIsModalOpen(false)
        setIsEditMode(false)
        setEditingGuestId(null)
        setMessage(null)
        globalThis.location.reload()
      }, 2000)

    } catch (error) {
      console.error('Error al guardar invitado:', error)
      setMessage({ type: 'error', text: 'Error al guardar invitado. Intenta nuevamente.' })
    } finally {
      setIsSubmitting(false)
    }
  }

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
        const cellStr = String(cell).replaceAll('"', '""')
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
    link.remove()
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
        <div className="p-6 border-b border-gray-200 bg-wedding-beige/30 flex justify-between items-center flex-wrap gap-4">
          <h2 className="text-2xl font-serif text-wedding-forest">
            Lista de Invitados
          </h2>
          <div className="flex gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-wedding-rose text-white tracking-wider uppercase text-sm font-medium hover:bg-wedding-rose/90 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Agregar Invitado</span>
            </button>
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
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Acciones
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
                        {guest.passes.length} pase{guest.passes.length === 1 ? '' : 's'}
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
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(guest)}
                          className="p-2 text-wedding-forest hover:bg-wedding-forest/10 transition-colors rounded"
                          title="Editar invitado"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            setGuestToDelete(guest.id)
                            setShowDeleteConfirm(true)
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 transition-colors rounded"
                          title="Eliminar invitado"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
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
              {gifts.filter(g => g.status !== 'COMPLETED').length} artículos
            </p>
          </div>
          <div className="p-6 max-h-96 overflow-y-auto">
            <div className="space-y-3">
              {gifts.filter(g => g.status !== 'COMPLETED').map(gift => (
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
              {gifts.filter(g => g.status !== 'COMPLETED').length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">
                  Todos los regalos han sido completados
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Completed Gifts */}
        <div className="bg-white border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-wedding-sage/10">
            <h3 className="text-xl font-serif text-wedding-forest">
              Regalos Completados
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {gifts.filter(g => g.status === 'COMPLETED').length} artículos
            </p>
          </div>
          <div className="p-6 max-h-96 overflow-y-auto">
            <div className="space-y-3">
              {gifts.filter(g => g.status === 'COMPLETED').map(gift => (
                <div key={gift.id} className="pb-3 border-b border-gray-100 last:border-0">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-medium text-gray-800">{gift.name}</p>
                    <p className="text-sm font-serif text-wedding-sage ml-4">
                      {formatCurrency(gift.total_amount || gift.price || 0)}
                    </p>
                  </div>
                  {gift.is_crowdfunding && (
                    <p className="text-xs text-gray-500">
                      Recaudado: {formatCurrency(gift.collected_amount)}
                    </p>
                  )}
                </div>
              ))}
              {gifts.filter(g => g.status === 'COMPLETED').length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">
                  Aún no hay regalos completados
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal para agregar invitado */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start md:items-center justify-center overflow-y-auto">
          <div className="bg-white w-full md:max-w-2xl md:m-4 min-h-screen md:min-h-0 md:max-h-[90vh] md:shadow-2xl md:border-2 border-wedding-sage/20 flex flex-col">
            {/* Header del Modal */}
            <div className="bg-gradient-to-br from-wedding-sage/10 via-wedding-rose/10 to-wedding-purple/10 p-4 md:p-6 border-b border-wedding-sage/20 flex-shrink-0">
              <div className="flex items-start md:items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl md:text-2xl font-serif text-wedding-forest tracking-wide">
                    {isEditMode ? 'Editar Invitado' : 'Agregar Nuevo Invitado'}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600 mt-1 tracking-wide">
                    {isEditMode ? 'Modifica la información del invitado y sus pases' : 'Completa la información del invitado y sus pases'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsModalOpen(false)
                    setMessage(null)
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Decorative divider */}
              <div className="flex items-center justify-center mt-4">
                <div className="h-px bg-wedding-forest/20 w-12"></div>
                <svg className="w-4 h-4 mx-3 text-wedding-rose" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L14 8L20 10L14 12L12 18L10 12L4 10L10 8Z"/>
                </svg>
                <div className="h-px bg-wedding-forest/20 w-12"></div>
              </div>
            </div>

            {/* Mensaje de éxito/error */}
            {message && (
              <div className={`mx-4 md:mx-6 mt-4 md:mt-6 p-4 border-l-4 ${
                message.type === 'success' 
                  ? 'bg-wedding-sage/10 border-wedding-forest text-wedding-forest' 
                  : 'bg-red-50 border-red-500 text-red-700'
              }`}>
                <p className="text-sm font-medium tracking-wide">{message.text}</p>
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6 flex-1 overflow-y-auto">
              {/* Información del Invitado */}
              <div className="space-y-4">
                <h4 className="text-base md:text-lg font-serif text-wedding-forest tracking-wide border-b border-gray-200 pb-2">
                  Información del Invitado
                </h4>

                <div>
                  <label htmlFor="guestName" className="block text-xs md:text-sm font-medium text-gray-700 mb-2 tracking-wider uppercase">
                    Nombre Completo *
                  </label>
                  <input
                    id="guestName"
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => handleGuestNameChange(e.target.value)}
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 focus:border-wedding-forest focus:ring-2 focus:ring-wedding-forest/20 outline-none transition-all text-sm md:text-base"
                    placeholder="Ej: María García López"
                  />
                  <p className="text-xs text-gray-500 mt-1 italic">
                    Se creará un pase automático con este nombre
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="guestEmail" className="block text-xs md:text-sm font-medium text-gray-700 mb-2 tracking-wider uppercase">
                      Email
                    </label>
                    <input
                      id="guestEmail"
                      type="email"
                      value={guestEmail}
                      onChange={(e) => {
                        setGuestEmail(e.target.value)
                        setEmailError('')
                      }}
                      className={`w-full px-3 md:px-4 py-2 md:py-3 border ${
                        emailError ? 'border-red-500' : 'border-gray-300'
                      } focus:border-wedding-forest focus:ring-2 focus:ring-wedding-forest/20 outline-none transition-all text-sm md:text-base`}
                      placeholder="correo@ejemplo.com"
                    />
                    {emailError && (
                      <p className="text-xs text-red-600 mt-1">{emailError}</p>
                    )}
                  </div>

                  <div className="w-full">
                    <label htmlFor="guestPhone" className="block text-xs md:text-sm font-medium text-gray-700 mb-2 tracking-wider uppercase break-words">
                      Teléfono *
                    </label>
                    <div className="flex gap-2 w-full">
                      <select
                        id="countryCode"
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="w-20 md:w-28 flex-shrink-0 px-2 md:px-3 py-2 md:py-3 border border-gray-300 focus:border-wedding-forest focus:ring-2 focus:ring-wedding-forest/20 outline-none transition-all bg-white text-xs md:text-sm"
                      >
                        <option value="+593">🇪🇨 +593</option>
                        <option value="+52">🇲🇽 +52</option>
                        <option value="+57">🇨🇴 +57</option>
                        <option value="+">🌍 +</option>
                      </select>
                      <input
                        id="guestPhone"
                        type="tel"
                        required
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        className="flex-1 min-w-0 px-3 md:px-4 py-2 md:py-3 border border-gray-300 focus:border-wedding-forest focus:ring-2 focus:ring-wedding-forest/20 outline-none transition-all text-sm md:text-base"
                        placeholder="1234567890"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1 italic break-words">
                      Número sin espacios ni guiones
                    </p>
                  </div>
                </div>
              </div>

              {/* Pases */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <h4 className="text-base md:text-lg font-serif text-wedding-forest tracking-wide">
                    Pases de Entrada
                  </h4>
                  <button
                    type="button"
                    onClick={addPass}
                    className="flex items-center gap-1 px-2 md:px-3 py-1 text-xs md:text-sm text-wedding-rose hover:bg-wedding-rose/10 transition-colors tracking-wider uppercase font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="hidden sm:inline">Agregar Acompañante</span>
                    <span className="sm:hidden">Agregar</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {passes.map((pass, index) => (
                    <div key={pass.id || `pass-${index}`} className="flex gap-2 md:gap-3 items-start bg-wedding-beige/20 p-3 md:p-4 border border-wedding-sage/10">
                      <div className="flex-1 min-w-0">
                        <label className="block text-xs font-medium text-gray-600 mb-2 tracking-wider uppercase">
                          {index === 0 ? 'Invitado Principal *' : `Acompañante ${index} *`}
                        </label>
                        <input
                          type="text"
                          required
                          value={pass.attendee_name}
                          onChange={(e) => updatePass(index, e.target.value)}
                          className="w-full px-3 md:px-4 py-2 border border-gray-300 focus:border-wedding-forest focus:ring-2 focus:ring-wedding-forest/20 outline-none transition-all bg-white text-sm md:text-base"
                          placeholder={index === 0 ? "Se completa automáticamente" : "Ej: Juan Pérez"}
                          disabled={index === 0}
                        />
                      </div>
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removePass(index)}
                          className="mt-7 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <p className="text-xs text-gray-500 italic">
                  * Los pases se crearán con estado "Pendiente" por defecto
                </p>
              </div>

              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    setMessage(null)
                  }}
                  className="w-full sm:flex-1 px-4 md:px-6 py-2 md:py-3 border-2 border-gray-300 text-gray-700 tracking-wider uppercase text-xs md:text-sm font-medium hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:flex-1 px-4 md:px-6 py-2 md:py-3 bg-wedding-forest text-white tracking-wider uppercase text-xs md:text-sm font-medium hover:bg-wedding-forest/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {isEditMode ? 'Actualizar Invitado' : 'Agregar Invitado'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 shadow-2xl border-2 border-red-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-serif text-gray-900">
                  Eliminar Invitado
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Esta acción no se puede deshacer
                </p>
              </div>
            </div>

            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500">
              <p className="text-sm text-red-800">
                <strong>Advertencia:</strong> Se eliminará el invitado y todos sus pases asociados. Esta acción es permanente y no se puede revertir.
              </p>
            </div>

            {message?.type === 'error' && (
              <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500">
                <p className="text-sm text-red-700">{message.text}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setGuestToDelete(null)
                }}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 tracking-wider uppercase text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteGuest}
                className="flex-1 px-4 py-2 bg-red-600 text-white tracking-wider uppercase text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
