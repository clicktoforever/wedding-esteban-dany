'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/browser'
import { Database } from '@/lib/database.types'
import { useRouter } from 'next/navigation'
import EditTableModal from '@/components/admin/tables/EditTableModal'
import AssignGuestModal from '@/components/admin/tables/AssignGuestModal'

interface Guest {
  id: string
  name: string
  email: string | null
  phone: string | null
}

type TableDetail = Database['public']['Tables']['tables']['Row']

export default function TableDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [tableId, setTableId] = useState<string | null>(null)
  const [table, setTable] = useState<TableDetail | null>(null)
  const [guests, setGuests] = useState<Guest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)

  useEffect(() => {
    params.then(p => setTableId(p.id))
  }, [params])

  useEffect(() => {
    if (tableId) {
      loadTableDetail()
    }
  }, [tableId])

  const loadTableDetail = async () => {
    if (!tableId) return

    try {
      const supabase = createClient()

      // Get table info
      const { data: tableData, error: tableError } = await supabase
        .from('tables')
        .select('*')
        .eq('id', tableId)
        .single()

      if (tableError) throw tableError
      setTable(tableData)

      // Get guests assigned to this table
      const { data: guestsData, error: guestsError } = await supabase
        .from('guests')
        .select('*')
        .eq('table_id', tableId)
        .order('name', { ascending: true })

      if (guestsError) throw guestsError
      setGuests(guestsData || [])
    } catch (error) {
      console.error('Error loading table:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveGuest = async (guestId: string) => {
    if (!confirm('¿Remover este invitado de la mesa?')) return

    try {
      const supabase = createClient()
      const result = await (supabase
        .from('guests')
        .update as any)({ table_id: null })
        .eq('id', guestId)
      
      const { error } = result
      if (error) throw error
      loadTableDetail()
    } catch (error) {
      console.error('Error removing guest:', error)
      alert('Error al remover el invitado')
    }
  }

  const handleDeleteTable = () => {
    router.push('/admin/tables')
  }

  if (isLoading || !table) {
    return (
      <div className="min-h-screen bg-[#fbf8f0] flex items-center justify-center">
        <span className="material-symbols-outlined text-[#495a51] text-4xl animate-spin">
          progress_activity
        </span>
      </div>
    )
  }

  const occupancy = guests.length
  const percentage = (occupancy / table.capacity) * 100

  return (
    <div className="min-h-screen bg-[#fbf8f0] flex flex-col overflow-hidden pb-24">
      {/* Header */}
      <header className="flex items-center px-4 py-3 justify-between bg-[#fbf8f0] z-10">
        <button 
          onClick={() => router.back()}
          className="flex size-10 shrink-0 items-center justify-center rounded-full active:bg-black/5 text-[#131514] transition-colors"
        >
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
        <h2 className="text-[#495a51] text-xl font-bold leading-tight tracking-tight flex-1 text-center pr-10">
          {table.name}
        </h2>
      </header>

      {/* Hero: Table Visualizer */}
      <div className="flex flex-col items-center justify-center py-8">
        <div className="relative flex items-center justify-center">
          {/* Table Circle */}
          <div className="size-48 rounded-full border-[6px] border-[#e4e1d9] bg-white shadow-sm flex flex-col items-center justify-center z-10 relative overflow-hidden">
            {/* Subtle pattern */}
            <div 
              className="absolute inset-0 opacity-[0.03]" 
              style={{ 
                backgroundImage: 'radial-gradient(#495a51 1px, transparent 1px)', 
                backgroundSize: '12px 12px' 
              }}
            />
            <span className="text-[#495a51] text-4xl font-extrabold tracking-tight z-20">
              {occupancy}
              <span className="text-[#495a51]/40 text-2xl font-bold">/{table.capacity}</span>
            </span>
            <span className="text-[#6b7566] text-xs font-medium uppercase tracking-widest mt-1 z-20">
              Asientos
            </span>
          </div>
          
          {/* Decorative ring */}
          <div 
            className="absolute size-[13.5rem] rounded-full border border-dashed border-[#495a51]/20 animate-spin"
            style={{ animationDuration: '60s' }}
          />
        </div>
        
        <div className="mt-6 flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-[#495a51]" />
          <p className="text-[#6b7566] text-sm font-medium">{occupancy} Invitados Confirmados</p>
        </div>

        {/* Edit Button */}
        <button
          onClick={() => setShowEditModal(true)}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-[#e6e8e6] text-[#495a51] hover:bg-gray-50 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">edit</span>
          <span className="text-sm font-medium">Configurar capacidad</span>
        </button>
      </div>

      {/* Seat List */}
      <main className="flex-1 overflow-y-auto px-4 w-full max-w-md mx-auto">
        <div className="flex flex-col gap-3 mt-2">
          {guests.map((guest) => (
            <div 
              key={guest.id}
              className="group flex items-center justify-between gap-4 bg-white p-3 pr-4 rounded-xl shadow-sm border border-transparent hover:border-[#495a51]/10 transition-all"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="size-11 rounded-full bg-[#d3c3db]/20 flex items-center justify-center text-[#495a51] font-bold text-sm shrink-0">
                  {guest.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                <div className="flex flex-col truncate">
                  <p className="text-[#131514] text-base font-bold leading-tight truncate">
                    {guest.name}
                  </p>
                  <p className="text-[#6b7566] text-xs font-medium truncate">
                    {guest.email || guest.phone || 'Sin contacto'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => handleRemoveGuest(guest.id)}
                className="shrink-0 size-8 flex items-center justify-center rounded-full text-[#6b7566] hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
          ))}

          {/* Empty Seats */}
          {[...Array(Math.max(0, table.capacity - occupancy))].map((_, i) => (
            <button
              key={i}
              onClick={() => setShowAssignModal(true)}
              className="flex items-center justify-center gap-3 bg-white/50 border-2 border-dashed border-[#d3c3db] p-4 rounded-xl hover:bg-white hover:border-[#495a51] transition-all group"
            >
              <span className="material-symbols-outlined text-[#d3c3db] group-hover:text-[#495a51] transition-colors">
                add
              </span>
              <span className="text-[#6b7566] text-sm font-medium group-hover:text-[#495a51] transition-colors">
                Asignar Silla
              </span>
            </button>
          ))}
        </div>
      </main>

      {/* Modals */}
      <EditTableModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        table={table}
        onSuccess={() => {
          loadTableDetail()
          setShowEditModal(false)
        }}
        onDelete={handleDeleteTable}
      />

      <AssignGuestModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        tableId={tableId!}
        tableName={table.name}
        onSuccess={() => {
          loadTableDetail()
          setShowAssignModal(false)
        }}
      />
    </div>
  )
}
