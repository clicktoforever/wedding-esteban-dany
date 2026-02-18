'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/browser'

interface Guest {
  id: string
  name: string
  email: string | null
  phone: string | null
  hasConfirmedPasses: boolean
}

interface AssignGuestModalProps {
  isOpen: boolean
  onClose: () => void
  tableId: string
  tableName: string
  onSuccess: () => void
}

export default function AssignGuestModal({ isOpen, onClose, tableId, tableName, onSuccess }: AssignGuestModalProps) {
  const [guests, setGuests] = useState<Guest[]>([])
  const [filteredGuests, setFilteredGuests] = useState<Guest[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGuests, setSelectedGuests] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadAvailableGuests()
    }
  }, [isOpen])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredGuests(guests)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredGuests(
        guests.filter(guest =>
          guest.name.toLowerCase().includes(query) ||
          guest.email?.toLowerCase().includes(query) ||
          guest.phone?.includes(query)
        )
      )
    }
  }, [searchQuery, guests])

  const loadAvailableGuests = async () => {
    try {
      const supabase = createClient()

      // Get all guests without a table
      const { data: guestsData, error: guestsError } = await supabase
        .from('guests')
        .select('*')
        .is('table_id', null)
        .order('name', { ascending: true })

      if (guestsError) throw guestsError

      // For each guest, check if they have at least one confirmed pass
      const guestsWithConfirmation = await Promise.all(
        (guestsData || []).map(async (guest: any) => {
          const { data: passes } = await supabase
            .from('passes')
            .select('confirmation_status')
            .eq('guest_id', guest.id)
            .eq('confirmation_status', 'confirmed')
            .limit(1)

          return {
            ...guest,
            hasConfirmedPasses: (passes?.length || 0) > 0
          }
        })
      )

      // Only show guests with at least one confirmed pass
      const confirmedGuests = guestsWithConfirmation.filter(g => g.hasConfirmedPasses)
      setGuests(confirmedGuests)
      setFilteredGuests(confirmedGuests)
    } catch (error) {
      console.error('Error loading guests:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleGuest = (guestId: string) => {
    const newSelected = new Set(selectedGuests)
    if (newSelected.has(guestId)) {
      newSelected.delete(guestId)
    } else {
      newSelected.add(guestId)
    }
    setSelectedGuests(newSelected)
  }

  const handleAssign = async () => {
    if (selectedGuests.size === 0) return

    setIsSaving(true)
    try {
      const supabase = createClient()

      // Update all selected guests
      const updates = Array.from(selectedGuests).map(guestId =>
        (supabase
          .from('guests')
          .update as any)({ table_id: tableId })
          .eq('id', guestId)
      )

      await Promise.all(updates)

      onSuccess()
      setSelectedGuests(new Set())
      setSearchQuery('')
    } catch (error) {
      console.error('Error assigning guests:', error)
      alert('Error al asignar invitados')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-[#131514]/30 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
        <div
          className="w-full max-w-md bg-[#fbf8f0] rounded-t-2xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >

          {/* Header */}
          <div className="flex-none px-6 pb-2 pt-2 flex items-center justify-between">
            <h2 className="text-[#495a51] text-xl font-bold leading-tight tracking-tight flex-1">
              Asignar a {tableName}
            </h2>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-black/5 transition-colors"
            >
              <span className="material-symbols-outlined text-[#6b7566] text-[24px]">close</span>
            </button>
          </div>

          {/* Search */}
          <div className="flex-none px-6 py-4">
            <label className="relative flex w-full items-center">
              <span className="absolute left-4 flex items-center justify-center text-[#495a51] pointer-events-none">
                <span className="material-symbols-outlined text-[22px]">search</span>
              </span>
              <input
                className="w-full bg-white border-none rounded-xl py-3.5 pl-11 pr-4 text-base text-[#131514] placeholder:text-gray-400 focus:ring-2 focus:ring-[#495a51]/20 shadow-sm transition-shadow"
                placeholder="Buscar invitado sin mesa..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </label>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto bg-[#fbf8f0] relative">
            {/* Section Header */}
            <div className="sticky top-0 z-10 bg-[#fbf8f0]/95 backdrop-blur-sm px-6 py-3 border-b border-black/5">
              <h3 className="text-[#495a51] text-sm font-bold uppercase tracking-wider">
                Invitados sin asignar ({filteredGuests.length})
              </h3>
            </div>

            {/* List */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <span className="material-symbols-outlined text-[#495a51] text-4xl animate-spin">
                  progress_activity
                </span>
              </div>
            ) : filteredGuests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <span className="material-symbols-outlined text-[#6b7566] text-5xl mb-3">
                  person_off
                </span>
                <p className="text-[#6b7566] font-medium">
                  {searchQuery ? 'No se encontraron invitados' : 'No hay invitados confirmados sin mesa'}
                </p>
              </div>
            ) : (
              <div className="px-6 py-4 space-y-3">
                {filteredGuests.map((guest) => {
                  const isSelected = selectedGuests.has(guest.id)

                  return (
                    <button
                      key={guest.id}
                      onClick={() => toggleGuest(guest.id)}
                      className={`w-full flex items-center justify-between gap-4 p-3 rounded-xl border-2 transition-all ${isSelected
                          ? 'bg-[#495a51]/5 border-[#495a51]'
                          : 'bg-white border-transparent hover:border-[#d3c3db]'
                        }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`size-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${isSelected
                            ? 'bg-[#495a51] text-white'
                            : 'bg-[#d3c3db]/20 text-[#495a51]'
                          }`}>
                          {guest.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col items-start text-left truncate">
                          <p className="text-[#131514] text-base font-bold leading-tight truncate w-full">
                            {guest.name}
                          </p>
                          <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            <span className="text-[#6b7566] text-xs font-medium">Confirmado</span>
                          </div>
                        </div>
                      </div>
                      <div className={`shrink-0 size-8 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                          ? 'bg-[#495a51] border-[#495a51]'
                          : 'bg-white border-gray-300'
                        }`}>
                        {isSelected && (
                          <span className="material-symbols-outlined text-white text-[18px]">check</span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {selectedGuests.size > 0 && (
            <div className="flex-none px-6 py-4 bg-[#fbf8f0] border-t border-[#ece8de]">
              <button
                onClick={handleAssign}
                disabled={isSaving}
                className="w-full bg-[#495a51] hover:bg-[#3d4b43] text-white h-14 rounded-xl text-base font-bold shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    Asignando...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">check</span>
                    Asignar {selectedGuests.size} {selectedGuests.size === 1 ? 'Invitado' : 'Invitados'}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
