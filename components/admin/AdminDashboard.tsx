'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/browser'
import type { Database } from '@/lib/database.types'
import AdminStats from '@/components/admin/AdminStats'
import GiftProgressCard from '@/components/admin/GiftProgressCard'

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

// Mock data for UI prototyping; real data from props overrides it
const GUESTS: GuestWithPasses[] = [
  {
    id: 'g1',
    name: 'María Fernanda López',
    email: 'maria.lopez@example.com',
    phone: '+593987654321',
    access_token: 'token-maria',
    created_at: '',
    updated_at: '',
    passes: [
      { id: 'p1', guest_id: 'g1', attendee_name: 'María Fernanda López', confirmation_status: 'confirmed', dietary_restrictions: 'Vegetariana', notes: null, updated_at: '' },
      { id: 'p2', guest_id: 'g1', attendee_name: 'Carlos Díaz', confirmation_status: 'pending', dietary_restrictions: null, notes: null, updated_at: '' },
    ],
  },
  {
    id: 'g2',
    name: 'Juan Pérez',
    email: null,
    phone: '+529991112233',
    access_token: 'token-juan',
    created_at: '',
    updated_at: '',
    passes: [
      { id: 'p3', guest_id: 'g2', attendee_name: 'Juan Pérez', confirmation_status: 'pending', dietary_restrictions: null, notes: null, updated_at: '' },
    ],
  },
  {
    id: 'g3',
    name: 'Ana Lucía Torres',
    email: 'ana.torres@example.com',
    phone: '+573145556677',
    access_token: 'token-ana',
    created_at: '',
    updated_at: '',
    passes: [
      { id: 'p4', guest_id: 'g3', attendee_name: 'Ana Lucía Torres', confirmation_status: 'declined', dietary_restrictions: null, notes: 'No puede asistir', updated_at: '' },
      { id: 'p5', guest_id: 'g3', attendee_name: 'Marco Ruiz', confirmation_status: 'declined', dietary_restrictions: null, notes: null, updated_at: '' },
    ],
  },
  {
    id: 'g4',
    name: 'Sofía Martínez',
    email: 'sofia.mtz@example.com',
    phone: '+593998887766',
    access_token: 'token-sofia',
    created_at: '',
    updated_at: '',
    passes: [
      { id: 'p6', guest_id: 'g4', attendee_name: 'Sofía Martínez', confirmation_status: 'confirmed', dietary_restrictions: 'Sin gluten', notes: null, updated_at: '' },
      { id: 'p7', guest_id: 'g4', attendee_name: 'Laura Chávez', confirmation_status: 'confirmed', dietary_restrictions: null, notes: null, updated_at: '' },
      { id: 'p8', guest_id: 'g4', attendee_name: 'Pedro Álvarez', confirmation_status: 'pending', dietary_restrictions: null, notes: null, updated_at: '' },
    ],
  },
  {
    id: 'g5',
    name: 'Luis Ramírez',
    email: 'lramirez@example.com',
    phone: '+529998887755',
    access_token: 'token-luis',
    created_at: '',
    updated_at: '',
    passes: [
      { id: 'p9', guest_id: 'g5', attendee_name: 'Luis Ramírez', confirmation_status: 'confirmed', dietary_restrictions: null, notes: null, updated_at: '' },
    ],
  },
]

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
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'pending' | 'declined'>('all')
  const [sentMessages, setSentMessages] = useState<Set<string>>(new Set())
  const [guestList, setGuestList] = useState<GuestWithPasses[]>(guests.length ? guests : GUESTS)
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null)
  const [giftsTab, setGiftsTab] = useState<'pending' | 'completed'>('pending')

  // New components
  // Lazy imports at top of file

  // Mantener la lista en sync con datos reales si llegan desde servidor
  useEffect(() => {
    if (guests.length) {
      setGuestList(guests)
    }
  }, [guests])

  const validateEmail = (email: string): boolean => {
    if (!email) return true // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const getOverallStatus = (guest: GuestWithPasses): 'confirmed' | 'pending' | 'declined' => {
    const statuses = guest.passes.map(p => p.confirmation_status)
    if (statuses.every(s => s === 'confirmed')) return 'confirmed'
    if (statuses.every(s => s === 'declined')) return 'declined'
    return 'pending'
  }

  const statusStyles: Record<'confirmed' | 'pending' | 'declined', { label: string; classes: string }> = {
    confirmed: { label: 'Confirmado', classes: 'bg-emerald-100 text-emerald-800 border border-emerald-200' },
    pending: { label: 'Pendiente', classes: 'bg-amber-100 text-amber-800 border border-amber-200' },
    declined: { label: 'Declinado', classes: 'bg-rose-100 text-rose-800 border border-rose-200' },
  }

  const getCompanionBadge = (guest: GuestWithPasses) => {
    const count = Math.max(guest.passes.length - 1, 0)
    if (count === 0) return null
    const names = guest.passes.slice(1).map(c => c.attendee_name).join(', ')
    return { count, tooltip: names }
  }

  // Función para generar el mensaje de WhatsApp inicial
  const generateWhatsAppMessage = (guest: GuestWithPasses) => {
    const passCount = guest.passes.length
    const passText = passCount === 1 ? '1 pase' : `${passCount} pases`
    const confirmationUrl = `https://estebanydany.clicktoforever.com/?token=${guest.access_token}`
    
    return `¡Hola ${guest.name}! 💐✨

Es un honor invitarte a nuestra boda. Tienes asignado${passCount > 1 ? 's' : ''} *${passText}* para este día tan especial.

🎊 Por favor, confirma tu asistencia y compártenos los detalles a través de este enlace personalizado:

${confirmationUrl}

¡Esperamos contar con tu presencia! 💕`
  }

  // Función para generar el mensaje de recordatorio
  const generateReminderMessage = (guest: GuestWithPasses) => {
    const passCount = guest.passes.length
    const passText = passCount === 1 ? 'tu pase' : `tus ${passCount} pases`
    const confirmationUrl = `https://estebanydany.clicktoforever.com/?token=${guest.access_token}`
    
    return `¡Hola ${guest.name}! 💌

Te recordamos que la fecha límite para confirmar tu asistencia es el *10 de marzo*. 📅

Si aún no lo has hecho, por favor confirma ${passText} a través de este enlace:

${confirmationUrl}

¡Tu presencia es muy importante para nosotros! 💕✨`
  }

  const getWhatsAppLink = (guest: GuestWithPasses, type: 'invite' | 'reminder') => {
    if (!guest.phone) return '#'
    const phoneNumber = guest.phone.replace(/[^0-9]/g, '')
    const message = type === 'reminder' ? generateReminderMessage(guest) : generateWhatsAppMessage(guest)
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
  }

  // Filtrar invitados según búsqueda y estado
  const filteredGuests = guestList.filter(guest => {
    // Filtro por búsqueda
    const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guest.passes.some(pass => pass.attendee_name.toLowerCase().includes(searchTerm.toLowerCase()))
    
    if (!matchesSearch) return false

    // Filtro por estado
    if (statusFilter === 'all') return true
    
    return guest.passes.some(pass => pass.confirmation_status === statusFilter)
  })


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

      setGuestList(prev => prev.filter(g => g.id !== guestToDelete))
      setMessage({ type: 'success', text: 'Invitado eliminado exitosamente' })
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
      {/* Safelist Tailwind colors for status dots to ensure rendering */}
      <div className="hidden">
        <span className="bg-emerald-500"></span>
        <span className="bg-amber-400"></span>
        <span className="bg-gray-400"></span>
      </div>
      {/* Admin Stats Panel */}
      <div className="bg-white border border-gray-200 p-5 md:p-8">
        <AdminStats
          totalGuests={stats.total_guests}
          confirmedPasses={stats.confirmed_passes}
          totalPasses={stats.total_passes}
          gifts={gifts.map(g => ({ collected_amount: g.collected_amount }))}
        />
      </div>

      {/* Guests List */}
      <div className="bg-white border border-gray-200 overflow-hidden flex flex-col">
        <div className="sticky top-0 z-20 bg-white/85 backdrop-blur border-b border-gray-200">
          <div className="p-6 pb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-serif text-wedding-forest">Lista de Invitados</h2>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-wedding-rose text-white tracking-wider uppercase text-xs font-medium hover:bg-wedding-rose/90 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
                </svg>
                <span>Agregar</span>
              </button>
              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 px-4 py-2 bg-wedding-forest text-white tracking-wider uppercase text-xs font-medium hover:bg-wedding-forest/90 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Excel</span>
              </button>
            </div>
          </div>

          {/* Barra sticky de búsqueda y filtros */}
            <div className="px-6 pb-4 flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Buscar por nombre o acompañante"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 focus:border-wedding-forest focus:ring-2 focus:ring-wedding-forest/20 outline-none transition-all text-sm"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {/* Mobile: Combobox */}
            <div className="md:hidden">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'confirmed' | 'pending' | 'declined')}
                className="w-full px-3 py-2 border border-gray-300 bg-white text-sm focus:border-wedding-forest focus:ring-2 focus:ring-wedding-forest/20"
              >
                <option value="all">Todos</option>
                <option value="confirmed">Confirmados</option>
                <option value="pending">Pendientes</option>
                <option value="declined">Declinados</option>
              </select>
            </div>
            <div></div>
            {/* Desktop: Tabs */}
            <div className="hidden md:flex gap-2 text-xs font-medium">
              {[
                { key: 'all', label: 'Todos' },
                { key: 'confirmed', label: 'Confirmados' },
                { key: 'pending', label: 'Pendientes' },
                { key: 'declined', label: 'Declinados' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key as 'all' | 'confirmed' | 'pending' | 'declined')}
                  className={`px-3 py-2 rounded-full border transition-colors ${statusFilter === tab.key ? 'bg-wedding-forest text-white border-wedding-forest' : 'bg-white text-gray-700 border-gray-200 hover:border-wedding-forest/60'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Resumen removido por solicitud */}
        </div>

        <div className="p-4 pt-2 flex-1">
          <div className="text-sm text-gray-600 mb-3">Mostrando {filteredGuests.length} de {guestList.length} invitados</div>

          {/* Desktop Table */}
          <div className="hidden md:block border border-gray-200">
            <div className="overflow-auto max-h-[640px]">
              <table className="min-w-full text-sm">
                <thead className="bg-white sticky top-0 z-10 backdrop-blur border-b">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Invitado</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Acompañantes</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Contacto</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Estado</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">WhatsApp</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGuests.map((guest, idx) => {
                    const badge = getCompanionBadge(guest)
                    const statusKey = getOverallStatus(guest)
                    const { classes, label } = statusStyles[statusKey]
                    const hasPhone = Boolean(guest.phone)
                    const isSent = sentMessages.has(guest.id)
                    const inviteHref = getWhatsAppLink(guest, 'invite')
                    const reminderHref = getWhatsAppLink(guest, 'reminder')
                    return (
                      <tr key={guest.id} className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-wedding-beige/30 transition-colors`}>
                        <td className="px-4 py-3 align-top">
                          <div className="font-serif text-wedding-forest text-sm">{guest.name}</div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                            <span>{guest.passes.length} pase{guest.passes.length === 1 ? '' : 's'}</span>
                            {badge && (
                              <span
                                className="inline-flex items-center px-2 py-0.5 text-[11px] rounded-full bg-wedding-sage/20 text-wedding-forest border border-wedding-sage/30"
                                title={badge.tooltip}
                              >
                                +{badge.count}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="space-y-1 text-xs text-gray-700">
                            {guest.passes.slice(1).map(pass => (
                              <div key={pass.id} className="flex items-center gap-2">
                                <span
                                  className={`inline-block h-3 w-3 rounded-full flex-shrink-0 ${
                                    pass.confirmation_status === 'confirmed'
                                      ? 'bg-emerald-500'
                                      : pass.confirmation_status === 'pending'
                                      ? 'bg-amber-400'
                                      : 'bg-gray-400'
                                  }`}
                                ></span>
                                <span>{pass.attendee_name}</span>
                              </div>
                            ))}
                            {guest.passes.length <= 1 && (
                              <span className="text-gray-400">Sin acompañantes</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top text-gray-600">
                          <div className="space-y-1 text-xs">
                            {guest.email && <div className="truncate max-w-xs">{guest.email}</div>}
                            {guest.phone && <div>{guest.phone}</div>}
                            {!guest.email && !guest.phone && <span className="text-gray-400">Sin contacto</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold ${classes}`}>
                            {label}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top">
                          {hasPhone ? (
                            <div className="flex items-center justify-center gap-3 text-gray-600">
                              <label className="flex items-center gap-2 text-xs">
                                <input
                                  type="checkbox"
                                  checked={isSent}
                                  onChange={(e) => {
                                    const next = new Set(sentMessages)
                                    if (e.target.checked) next.add(guest.id)
                                    else next.delete(guest.id)
                                    setSentMessages(next)
                                  }}
                                  className="w-4 h-4 accent-wedding-forest"
                                />
                                <span>Enviado</span>
                              </label>
                              <div className="flex items-center gap-2">
                                <a
                                  href={inviteHref}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => {
                                    if (isSent) {
                                      e.preventDefault()
                                      return
                                    }
                                    setSentMessages(prev => new Set([...prev, guest.id]))
                                  }}
                                  className={`p-2 rounded hover:bg-wedding-sage/20 transition ${isSent ? 'opacity-50 pointer-events-none cursor-not-allowed' : ''}`}
                                  title="Enviar invitación"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 2 11 13" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 2 15 22 11 13 2 9z" />
                                  </svg>
                                </a>
                                <a
                                  href={reminderHref}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-2 rounded hover:bg-wedding-sage/20 transition"
                                  title="Enviar recordatorio"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.4-1.4A3.8 3.8 0 0118 13V9c0-3.1-1.6-5.3-4-5.9V2a2 2 0 10-4 0v1.1C7.6 3.7 6 5.9 6 9v4c0 1-.4 2-1.6 2.6L3 17h5" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 21a2 2 0 004 0" />
                                  </svg>
                                </a>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">Sin teléfono</span>
                          )}
                        </td>
                        <td className="px-4 py-3 align-top text-right">
                          <div className="flex justify-end gap-2 text-gray-600">
                            <button
                              onClick={() => openEditModal(guest)}
                              className="p-2 rounded hover:bg-wedding-sage/20 transition"
                              title="Editar invitado"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M15.5 3.5l5 5" />
                              </svg>
                            </button>
                            <button
                              onClick={() => {
                                setGuestToDelete(guest.id)
                                setShowDeleteConfirm(true)
                              }}
                              className="p-2 rounded hover:bg-red-50 text-red-600 transition"
                              title="Eliminar invitado"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-1 12a2 2 0 01-2 2H8a2 2 0 01-2-2L5 7m5 4v6m4-6v6M9 7h6m-7 0V5a1 1 0 011-1h6a1 1 0 011 1v2" />
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
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredGuests.map(guest => {
              const statusKey = getOverallStatus(guest)
              const { classes, label } = statusStyles[statusKey]
              const badge = getCompanionBadge(guest)
              const hasPhone = Boolean(guest.phone)
              const isSent = sentMessages.has(guest.id)
              const isOpen = expandedCardId === guest.id
              const inviteHref = getWhatsAppLink(guest, 'invite')
              const reminderHref = getWhatsAppLink(guest, 'reminder')
              return (
                <div key={guest.id} className="border border-gray-200 bg-white shadow-sm">
                  <button
                    onClick={() => setExpandedCardId(isOpen ? null : guest.id)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3"
                  >
                    <div className="text-left flex-1 min-w-0">
                      <div className="font-serif text-wedding-forest truncate">{guest.name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                        <span>{guest.passes.length} pase{guest.passes.length === 1 ? '' : 's'}</span>
                        {badge && (
                          <span
                            className="inline-flex items-center px-2 py-0.5 text-[11px] rounded-full bg-wedding-sage/20 text-wedding-forest border border-wedding-sage/30"
                            title={badge.tooltip}
                          >
                            +{badge.count}
                          </span>
                        )}
                      </div>
                    </div>
                    <span 
                      className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold flex-shrink-0"
                      style={{
                        backgroundColor: statusKey === 'confirmed' ? '#d1fae5' : statusKey === 'pending' ? '#fef3c7' : '#fee2e2',
                        color: statusKey === 'confirmed' ? '#065f46' : statusKey === 'pending' ? '#92400e' : '#991b1b',
                        border: statusKey === 'confirmed' ? '1px solid #a7f3d0' : statusKey === 'pending' ? '1px solid #fde68a' : '1px solid #fecaca'
                      }}
                    >
                      {label}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="border-t border-gray-100 px-4 py-3 space-y-3">
                      <div className="text-xs text-gray-600 space-y-1">
                        {guest.email && <div className="truncate">{guest.email}</div>}
                        {guest.phone && <div>{guest.phone}</div>}
                        {!guest.email && !guest.phone && <span className="text-gray-400">Sin contacto</span>}
                      </div>

                      <div className="text-xs text-gray-700">
                        <div className="font-semibold mb-1">Acompañantes</div>
                        <div className="space-y-1">
                          {guest.passes.slice(1).map(pass => {
                            const dotColor = pass.confirmation_status === 'confirmed'
                              ? '#10b981'
                              : pass.confirmation_status === 'pending'
                              ? '#f59e0b'
                              : '#6b7280'
                            return (
                              <div key={pass.id} className="flex items-center gap-2">
                                <span 
                                  className="inline-block h-3 w-3 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: dotColor }}
                                ></span>
                                <span>{pass.attendee_name}</span>
                              </div>
                            )
                          })}
                          {guest.passes.length <= 1 && (
                            <span className="text-xs text-gray-400">Sin acompañantes</span>
                          )}
                        </div>
                      </div>

                      {hasPhone ? (
                        <div className="flex items-center gap-2 text-xs">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSent}
                              onChange={(e) => {
                                const next = new Set(sentMessages)
                                if (e.target.checked) next.add(guest.id)
                                else next.delete(guest.id)
                                setSentMessages(next)
                              }}
                              className="w-4 h-4 accent-wedding-forest"
                            />
                            <span>Enviado</span>
                          </label>
                          <div className="flex-1 flex justify-end gap-2">
                            <a
                              href={inviteHref}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => {
                                if (isSent) {
                                  e.preventDefault()
                                  return
                                }
                                setSentMessages(prev => new Set([...prev, guest.id]))
                              }}
                              className={`h-10 w-10 inline-flex items-center justify-center rounded-md border border-gray-200 hover:bg-wedding-sage/20 transition ${isSent ? 'opacity-50 pointer-events-none cursor-not-allowed' : ''}`}
                              title="Enviar invitación"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 2 11 13" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 2 15 22 11 13 2 9z" />
                              </svg>
                            </a>
                            <a
                              href={reminderHref}
                              target="_blank"
                              rel="noreferrer"
                              className="h-10 w-10 inline-flex items-center justify-center rounded-md border border-gray-200 hover:bg-wedding-sage/20 transition"
                              title="Enviar recordatorio"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.4-1.4A3.8 3.8 0 0118 13V9c0-3.1-1.6-5.3-4-5.9V2a2 2 0 10-4 0v1.1C7.6 3.7 6 5.9 6 9v4c0 1-.4 2-1.6 2.6L3 17h5" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 21a2 2 0 004 0" />
                              </svg>
                            </a>
                            <button
                              onClick={() => openEditModal(guest)}
                              className="h-10 w-10 inline-flex items-center justify-center rounded-md border border-gray-200 hover:bg-wedding-sage/20 transition"
                              title="Editar"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M15.5 3.5l5 5" />
                              </svg>
                            </button>
                            <button
                              onClick={() => {
                                setGuestToDelete(guest.id)
                                setShowDeleteConfirm(true)
                              }}
                              className="h-10 w-10 inline-flex items-center justify-center rounded-md border border-gray-200 hover:bg-red-50 text-red-600 transition"
                              title="Eliminar"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-1 12a2 2 0 01-2 2H8a2 2 0 01-2-2L5 7m5 4v6m4-6v6M9 7h6m-7 0V5a1 1 0 011-1h6a1 1 0 011 1v2" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Sin teléfono</span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {filteredGuests.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              {guestList.length === 0 ? (
                <p className="text-lg font-serif">No hay invitados registrados aún</p>
              ) : (
                <div>
                  <p className="text-lg font-serif">No se encontraron invitados</p>
                  <p className="text-sm mt-2">Ajusta la búsqueda o el filtro de estado</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Gift Tracker with Tabs */}
      <div className="bg-white border border-gray-200">
        <div className="px-4 md:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-xl font-serif text-wedding-forest">Gestión de Regalos</h3>
          <div className="flex gap-2 text-xs font-medium">
            <button
              onClick={() => setGiftsTab('pending')}
              className={`px-3 py-1.5 rounded-full border ${giftsTab === 'pending' ? 'bg-wedding-forest text-white border-wedding-forest' : 'bg-white text-gray-700 border-gray-200 hover:border-wedding-forest/60'}`}
            >Pendientes</button>
            <button
              onClick={() => setGiftsTab('completed')}
              className={`px-3 py-1.5 rounded-full border ${giftsTab === 'completed' ? 'bg-wedding-forest text-white border-wedding-forest' : 'bg-white text-gray-700 border-gray-200 hover:border-wedding-forest/60'}`}
            >Completados</button>
          </div>
        </div>
        <div className="px-4 md:px-6 py-4 max-h-[28rem] overflow-y-auto">
          <div className="space-y-3">
            {(giftsTab === 'pending' ? gifts.filter(g => g.status !== 'COMPLETED') : gifts.filter(g => g.status === 'COMPLETED')).map(gift => (
              <GiftProgressCard
                key={gift.id}
                id={gift.id}
                name={gift.name}
                category={gift.category}
                target_amount={Number(gift.total_amount ?? gift.price ?? 0)}
                current_amount={Number(gift.collected_amount ?? 0)}
                onEdit={(id) => {
                  // Placeholder: open edit flow for gift
                  console.log('Editar regalo', id)
                }}
                onViewContributions={(id) => {
                  console.log('Ver aportaciones', id)
                }}
              />
            ))}
            {(giftsTab === 'pending' ? gifts.filter(g => g.status !== 'COMPLETED').length === 0 : gifts.filter(g => g.status === 'COMPLETED').length === 0) && (
              <p className="text-sm text-gray-400 text-center py-8">{giftsTab === 'pending' ? 'Todos los regalos han sido completados' : 'Aún no hay regalos completados'}</p>
            )}
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
