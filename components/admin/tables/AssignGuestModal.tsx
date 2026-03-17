'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/browser'

interface AssignablePass {
  id: string
  attendee_name: string
  guest_id: string
  guest_name: string
}

interface AssignGuestModalProps {
  isOpen: boolean
  onClose: () => void
  tableId: string
  tableName: string
  onSuccess: () => void
}

export default function AssignGuestModal({ isOpen, onClose, tableId, tableName, onSuccess }: AssignGuestModalProps) {
  const [passes, setPasses] = useState<AssignablePass[]>([])
  const [filteredPasses, setFilteredPasses] = useState<AssignablePass[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPasses, setSelectedPasses] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadAvailablePasses()
    }
  }, [isOpen])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPasses(passes)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredPasses(
        passes.filter(pass =>
          pass.attendee_name.toLowerCase().includes(query) ||
          pass.guest_name.toLowerCase().includes(query)
        )
      )
    }
  }, [searchQuery, passes])

  const loadAvailablePasses = async () => {
    try {
      const supabase = createClient()

      // Get all confirmed passes without a table
      const { data: passesData, error: passesError } = await (supabase
        .from('passes')
        .select(`
          id,
          attendee_name,
          guest_id,
          guests!inner (
            name
          )
        `)
        .eq('confirmation_status', 'confirmed')
        .is('table_id', null)
        .order('attendee_name', { ascending: true }) as any)

      if (passesError) throw passesError

      const formattedPasses: AssignablePass[] = (passesData || []).map((pass: any) => ({
        id: pass.id,
        attendee_name: pass.attendee_name,
        guest_id: pass.guest_id,
        guest_name: pass.guests?.name || 'Invitación'
      }))

      setPasses(formattedPasses)
      setFilteredPasses(formattedPasses)
    } catch (error) {
      console.error('Error loading passes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const togglePass = (passId: string) => {
    const newSelected = new Set(selectedPasses)
    if (newSelected.has(passId)) {
      newSelected.delete(passId)
    } else {
      newSelected.add(passId)
    }
    setSelectedPasses(newSelected)
  }

  const handleAssign = async () => {
    if (selectedPasses.size === 0) return

    setIsSaving(true)
    try {
      const supabase = createClient()

      // Update all selected passes
      const updates = Array.from(selectedPasses).map(passId =>
        (supabase
          .from('passes')
          .update as any)({ table_id: tableId })
          .eq('id', passId)
      )

      await Promise.all(updates)

      onSuccess()
      setSelectedPasses(new Set())
      setSearchQuery('')
    } catch (error) {
      console.error('Error assigning passes:', error)
      alert('Error al asignar personas')
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
                placeholder="Buscar persona sin mesa..."
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
                Personas sin asignar ({filteredPasses.length})
              </h3>
            </div>

            {/* List */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <span className="material-symbols-outlined text-[#495a51] text-4xl animate-spin">
                  progress_activity
                </span>
              </div>
            ) : filteredPasses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <span className="material-symbols-outlined text-[#6b7566] text-5xl mb-3">
                  person_off
                </span>
                <p className="text-[#6b7566] font-medium">
                  {searchQuery ? 'No se encontraron personas' : 'No hay personas confirmadas sin mesa'}
                </p>
              </div>
            ) : (
              <div className="px-6 py-4 space-y-3">
                {filteredPasses.map((pass) => {
                  const isSelected = selectedPasses.has(pass.id)

                  return (
                    <button
                      key={pass.id}
                      onClick={() => togglePass(pass.id)}
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
                          {pass.attendee_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col items-start text-left truncate">
                          <p className="text-[#131514] text-base font-bold leading-tight truncate w-full">
                            {pass.attendee_name}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-[#6b7566] text-xs font-medium truncate">
                              De: {pass.guest_name}
                            </span>
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
          {selectedPasses.size > 0 && (
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
                    Asignar {selectedPasses.size} {selectedPasses.size === 1 ? 'Persona' : 'Personas'}
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
