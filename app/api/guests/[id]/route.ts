import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: guestId } = await context.params

    // Primero eliminar los pases asociados
    const { error: passesError } = await supabase
      .from('passes')
      .delete()
      .eq('guest_id', guestId)

    if (passesError) {
      console.error('Error deleting passes:', passesError)
      return NextResponse.json(
        { error: 'Error al eliminar los pases del invitado' },
        { status: 500 }
      )
    }

    // Luego eliminar el invitado
    const { error: guestError } = await supabase
      .from('guests')
      .delete()
      .eq('id', guestId)

    if (guestError) {
      console.error('Error deleting guest:', guestError)
      return NextResponse.json(
        { error: 'Error al eliminar el invitado' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in DELETE /api/guests/[id]:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
