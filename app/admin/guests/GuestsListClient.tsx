'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'
import * as XLSX from 'xlsx'
import type { Database } from '@/lib/database.types'
import BottomNav from '@/components/admin/BottomNav'
import GuestDetailModal from '@/components/admin/GuestDetailModal'
import NewGuestModal from '@/components/admin/NewGuestModal'
import EditGuestModal from '@/components/admin/EditGuestModal'
import GuestSwipeActionCard from '@/components/admin/GuestSwipeActionCard'

interface Pass {
  id: string
  attendee_name: string
  confirmation_status: 'pending' | 'confirmed' | 'declined'
}

interface Guest {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  access_token: string
  notified_whatsapp: boolean
  passes: Pass[]
}

interface GuestsListClientProps {
  initialGuests: Guest[]
}

export default function GuestsListClient({ initialGuests }: GuestsListClientProps) {
  const router = useRouter()
  const [guests, setGuests] = useState<Guest[]>(initialGuests)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'pending' | 'declined' | 'sent' | 'not-sent'>('all')
  
  // Modals state
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showNewModal, setShowNewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const refreshData = () => {
    router.refresh()
    // Re-fetch guests
    const supabase = createClient()
    supabase
      .from('guests')
      .select('*, passes (*)')
      .order('name', { ascending: true })
      .then(({ data }) => {
        if (data) setGuests(data)
      })
  }

  const handleGuestClick = (guest: Guest) => {
    setSelectedGuest(guest)
    setShowDetailModal(true)
  }

  const handleEditGuest = (guest: Guest) => {
    setSelectedGuest(guest)
    setShowDetailModal(false)
    setShowEditModal(true)
  }

  const handleDeleteGuest = async (guestId: string) => {
    try {
      const supabase = createClient()
      
      // Delete passes first (cascade should handle this, but being explicit)
      await supabase.from('passes').delete().eq('guest_id', guestId)
      
      // Delete guest
      const { error } = await supabase.from('guests').delete().eq('id', guestId)
      
      if (error) throw error
      
      refreshData()
    } catch (error) {
      console.error('Error deleting guest:', error)
      alert('Error al eliminar el invitado')
    }
  }

  // Filter and search guests
  const filteredGuests = useMemo(() => {
    let filtered = guests

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(guest =>
        guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guest.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guest.phone?.includes(searchQuery)
      )
    }

    // Apply filter
    if (filter === 'sent') {
      filtered = filtered.filter(guest => guest.notified_whatsapp === true)
    } else if (filter === 'not-sent') {
      filtered = filtered.filter(guest => guest.notified_whatsapp === false)
    } else if (filter !== 'all') {
      filtered = filtered.filter(guest =>
        guest.passes.some(pass => pass.confirmation_status === filter)
      )
    }

    return filtered
  }, [guests, searchQuery, filter])

  // Count by status
  const counts = useMemo(() => {
    const confirmed = guests.filter(g => g.passes.some(p => p.confirmation_status === 'confirmed')).length
    const pending = guests.filter(g => g.passes.every(p => p.confirmation_status === 'pending')).length
    const sent = guests.filter(g => g.notified_whatsapp === true).length
    const notSent = guests.filter(g => g.notified_whatsapp === false).length
    
    return { confirmed, pending, sent, notSent }
  }, [guests])

  const getGuestStatus = (guest: Guest) => {
    const hasConfirmed = guest.passes.some(p => p.confirmation_status === 'confirmed')
    const allDeclined = guest.passes.every(p => p.confirmation_status === 'declined')
    
    if (allDeclined) return 'declined'
    if (hasConfirmed) return 'confirmed'
    return 'pending'
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      confirmed: {
        class: 'bg-green-50 text-green-700 border-green-100',
        label: 'Confirmado'
      },
      pending: {
        class: 'bg-amber-50 text-amber-700 border-amber-100',
        label: 'Pendiente'
      },
      declined: {
        class: 'bg-stone-100 text-stone-500 border-stone-200',
        label: 'Declinado'
      }
    }
    return badges[status as keyof typeof badges] || badges.pending
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
  }

  const handleDownloadExcel = async () => {
    try {
      const supabase = createClient()
      
      // Get all guests with their passes and table assignments
      const { data: guestsData, error: guestsError } = await supabase
        .from('guests')
        .select(`
          *,
          passes (*),
          tables (name)
        `)
        .order('name', { ascending: true })

      if (guestsError) throw guestsError

      // Create Excel data
      const excelData: any[] = []

      // Header row
      excelData.push([
        'Invitado',
        'Email',
        'Teléfono',
        'Mesa',
        'Estado General',
        'Total Pases',
        'Pase #',
        'Nombre Asistente',
        'Estado Pase',
        'Invitación Enviada'
      ])

      // Add guest data
      guestsData?.forEach((guest: any) => {
        const status = getGuestStatus(guest)
        const statusLabel = getStatusBadge(status).label
        const totalPasses = guest.passes?.length || 0
        const tableName = guest.tables?.name || 'Sin asignar'
        const inviteSent = guest.notified_whatsapp ? 'Sí' : 'No'
        
        if (!guest.passes || guest.passes.length === 0) {
          // Guest with no passes
          excelData.push([
            guest.name,
            guest.email || '',
            guest.phone || '',
            tableName,
            statusLabel,
            totalPasses,
            '',
            '',
            '',
            inviteSent
          ])
        } else {
          // Guest with passes
          guest.passes.forEach((pass: any, index: number) => {
            const passStatusLabel = pass.confirmation_status === 'confirmed' ? 'Confirmado' :
                                    pass.confirmation_status === 'declined' ? 'Declinado' : 'Pendiente'
            
            excelData.push([
              guest.name,
              guest.email || '',
              guest.phone || '',
              tableName,
              statusLabel,
              totalPasses,
              index + 1,
              pass.attendee_name,
              passStatusLabel,
              inviteSent
            ])
          })
        }
      })

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.aoa_to_sheet(excelData)

      // Set column widths
      ws['!cols'] = [
        { wch: 30 }, // Invitado
        { wch: 30 }, // Email
        { wch: 15 }, // Teléfono
        { wch: 20 }, // Mesa
        { wch: 15 }, // Estado General
        { wch: 12 }, // Total Pases
        { wch: 8 },  // Pase #
        { wch: 30 }, // Nombre Asistente
        { wch: 15 }, // Estado Pase
        { wch: 18 }  // Invitación Enviada
      ]

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Lista de Invitados')

      // Generate file name with current date
      const date = new Date().toISOString().split('T')[0]
      const fileName = `Invitados_Boda_${date}.xlsx`

      // Download file
      XLSX.writeFile(wb, fileName)
    } catch (error) {
      console.error('Error generating Excel:', error)
      alert('Error al generar el archivo Excel')
    }
  }

  const handleSendWhatsApp = (guest: Guest) => {
    if (!guest.phone) {
      alert('Este invitado no tiene número de WhatsApp')
      return
    }

    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = guest.phone.replace(/[\s\-()]/g, '')
    
    // Count passes
    const totalPasses = guest.passes.length
    const pasesText = totalPasses === 1 ? 'pase' : 'pases'
    
    // Custom message for the guest
    const message = encodeURIComponent(
      `¡Hola ${guest.name}! 👋✨\n\n` +
      `Estamos muy emocionados porque cada vez falta menos para nuestro gran día y no nos imaginamos celebrarlo sin ti.\n\n` +
      `Hemos preparado una invitación muy especial para ti. En este enlace encontrarás tus pases asignados y todos los detalles de nuestra boda:\n\n` +
      `💌 https://estebanydany.clicktoforever.com/?token=${guest.access_token}\n\n` +
      `Por favor entra para confirmar tu asistencia, ¡nos haría muy felices contar contigo!\n\n` +
      `Con cariño, Esteban y Dany 💍`
    )
    
    // Open WhatsApp
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${message}`
    window.open(whatsappUrl, '_blank')
    
    // Mark as notified in database (run in background)
    void (async () => {
      try {
        const supabase = createClient()
        const { error } = await supabase
          .from('guests')
          .update({ notified_whatsapp: true })
          .eq('id', guest.id)
        if (error) {
          console.error('Error updating notified status:', error)
        } else {
          refreshData()
        }
      } catch (err) {
        console.error('Error in notified update:', err)
      }
    })()
  }

  const handleSendReminder = async (guest: Guest) => {
    try {
      if (!guest.phone) {
        alert('Este invitado no tiene número de WhatsApp')
        return
      }

      // Clean phone number
      const cleanPhone = guest.phone.replace(/[\s\-()]/g, '')
      
      // Reminder message
      const message = encodeURIComponent(
        `¡Hola ${guest.name}! 💌\n\n` +
        `Te recordamos que la fecha límite para confirmar tu asistencia es el 10 de marzo. 📅\n\n` +
        `Si aún no lo has hecho, por favor confirma tu pase a través de este enlace:\n\n` +
        `https://estebanydany.clicktoforever.com/?token=${guest.access_token}\n\n` +
        `¡Tu presencia es muy importante para nosotros! 💕✨`
      )
      
      // Open WhatsApp with reminder message
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${message}`
      window.open(whatsappUrl, '_blank')
    } catch (error) {
      console.error('Error sending reminder:', error)
      alert('Error al enviar el recordatorio')
    }
  }

  return (
    <div className="bg-[#F9F7F2] text-text-main-light font-sans transition-colors duration-300 antialiased pb-24 min-h-screen">
      {/* Header */}
      <header className="fixed top-0 w-full z-40 bg-[#F9F7F2] border-b border-stone-200/50 transition-colors duration-300">
        <div className="px-6 py-4 flex justify-between items-center max-w-md mx-auto md:max-w-4xl">
          <div className="flex flex-col">
            <p className="text-[#4a5951] text-xs font-bold tracking-[0.15em] uppercase mb-1">
              Esteban &amp; Dany
            </p>
            <h1 className="text-[32px] leading-tight font-serif font-bold text-[#131514]">
              Lista de Invitados
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleDownloadExcel}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-[#495a51] text-white hover:bg-[#3d4b43] active:scale-95 transition-all shadow-sm"
              title="Descargar Excel"
            >
              <span className="material-symbols-outlined text-[22px]">download</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 px-6 pb-32 max-w-md mx-auto md:max-w-4xl">
        {/* Search Bar */}
        <div className="relative mb-6">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="material-icons-round text-stone-400">search</span>
          </span>
          <input
            className="block w-full pl-11 pr-4 py-3.5 rounded-2xl border-none bg-white text-text-main-light placeholder-stone-400 shadow-sm focus:ring-2 focus:ring-primary transition-all"
            placeholder="Buscar invitado..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-5 py-2 rounded-full text-sm font-medium shadow-md transition-transform active:scale-95 whitespace-nowrap ${
              filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-white text-stone-600 border border-stone-100 hover:bg-stone-50'
            }`}
          >
            Todos ({guests.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-5 py-2 rounded-full text-sm font-medium shadow-md transition-transform active:scale-95 whitespace-nowrap ${
              filter === 'pending'
                ? 'bg-primary text-white'
                : 'bg-white text-stone-600 border border-stone-100 hover:bg-stone-50'
            }`}
          >
            Pendientes ({counts.pending})
          </button>
          <button
            onClick={() => setFilter('confirmed')}
            className={`px-5 py-2 rounded-full text-sm font-medium shadow-md transition-transform active:scale-95 whitespace-nowrap ${
              filter === 'confirmed'
                ? 'bg-primary text-white'
                : 'bg-white text-stone-600 border border-stone-100 hover:bg-stone-50'
            }`}
          >
            Confirmados ({counts.confirmed})
          </button>
          <button
            onClick={() => setFilter('sent')}
            className={`px-5 py-2 rounded-full text-sm font-medium shadow-md transition-transform active:scale-95 whitespace-nowrap ${
              filter === 'sent'
                ? 'bg-primary text-white'
                : 'bg-white text-stone-600 border border-stone-100 hover:bg-stone-50'
            }`}
          >
            Enviados ({counts.sent})
          </button>
          <button
            onClick={() => setFilter('not-sent')}
            className={`px-5 py-2 rounded-full text-sm font-medium shadow-md transition-transform active:scale-95 whitespace-nowrap ${
              filter === 'not-sent'
                ? 'bg-primary text-white'
                : 'bg-white text-stone-600 border border-stone-100 hover:bg-stone-50'
            }`}
          >
            No enviados ({counts.notSent})
          </button>
        </div>

        {/* Guests List */}
        <div className="space-y-4">
          {filteredGuests.map((guest) => {
            const status = getGuestStatus(guest)

            return (
              <GuestSwipeActionCard
                key={guest.id}
                guest={guest}
                status={status}
                onCardClick={() => handleGuestClick(guest)}
                onSendWhatsApp={() => handleSendWhatsApp(guest)}
                onSendReminder={() => handleSendReminder(guest)}
              />
            )
          })}

          {filteredGuests.length === 0 && (
            <div className="text-center py-16">
              <span className="material-icons-round text-6xl text-stone-300 mb-4">
                person_search
              </span>
              <p className="text-stone-500">
                No se encontraron invitados
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowNewModal(true)}
        className="fixed bottom-24 right-6 md:right-8 w-14 h-14 bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-30 active:scale-95"
      >
        <span className="material-icons-round text-2xl">add</span>
      </button>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Modals */}
      <GuestDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        guest={selectedGuest}
        onEdit={handleEditGuest}
        onDelete={handleDeleteGuest}
      />

      <NewGuestModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSuccess={refreshData}
      />

      <EditGuestModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        guest={selectedGuest}
        onSuccess={refreshData}
        onDelete={handleDeleteGuest}
      />
    </div>
  )
}
