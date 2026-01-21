'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'
import BottomNav from '@/components/admin/BottomNav'
import GuestDetailModal from '@/components/admin/GuestDetailModal'
import NewGuestModal from '@/components/admin/NewGuestModal'
import EditGuestModal from '@/components/admin/EditGuestModal'

interface Pass {
  id: string
  attendee_name: string
  confirmation_status: 'pending' | 'confirmed' | 'declined'
  dietary_restrictions?: string | null
}

interface Guest {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  passes: Pass[]
}

interface GuestsListClientProps {
  initialGuests: Guest[]
}

export default function GuestsListClient({ initialGuests }: GuestsListClientProps) {
  const router = useRouter()
  const [guests, setGuests] = useState<Guest[]>(initialGuests)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'pending' | 'declined'>('all')
  
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
    if (filter !== 'all') {
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
    
    return { confirmed, pending }
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

  const hasWhatsApp = (guest: Guest) => {
    return guest.phone && guest.phone.trim() !== ''
  }

  return (
    <div className="bg-[#F9F7F2] text-text-main-light font-sans transition-colors duration-300 antialiased pb-24 min-h-screen">
      {/* Header */}
      <header className="fixed top-0 w-full z-40 bg-[#F9F7F2] border-b border-stone-200/50 transition-colors duration-300">
        <div className="px-6 py-4 flex justify-between items-center max-w-md mx-auto md:max-w-4xl">
          <div className="flex flex-col">
            <h1 className="font-display text-2xl font-bold text-primary tracking-tight">
              Lista de Invitados
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-full hover:bg-stone-100 transition-colors">
              <span className="material-icons-round text-stone-600">filter_list</span>
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
        </div>

        {/* Guests List */}
        <div className="space-y-4">
          {filteredGuests.map((guest) => {
            const status = getGuestStatus(guest)
            const badge = getStatusBadge(status)
            const totalPasses = guest.passes.length

            return (
              <div
                key={guest.id}
                onClick={() => handleGuestClick(guest)}
                className="bg-surface-light p-5 rounded-2xl shadow-card border border-stone-100/50 flex items-center justify-between transition-colors duration-300 cursor-pointer hover:shadow-lg active:scale-[0.99] min-h-[88px]"
              >
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <div className={`h-12 w-12 flex-shrink-0 rounded-full flex items-center justify-center font-display font-bold text-lg ${
                    status === 'confirmed'
                      ? 'bg-stone-100 text-primary'
                      : 'bg-stone-100 text-stone-600'
                  }`}>
                    {getInitials(guest.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-text-main-light text-base truncate">
                        {guest.name}
                      </h3>
                      {hasWhatsApp(guest) && (
                        <svg className="w-5 h-5 flex-shrink-0 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                      )}
                    </div>
                    <div className="flex items-center mt-1.5 space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${badge.class}`}>
                        {badge.label}
                      </span>
                      <span className="text-xs font-medium text-stone-500">
                        +{totalPasses} {totalPasses === 1 ? 'pase' : 'pases'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end flex-shrink-0 ml-3">
                  <button className="text-stone-300 hover:text-primary transition-colors">
                    <span className="material-icons-round">more_vert</span>
                  </button>
                </div>
              </div>
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
