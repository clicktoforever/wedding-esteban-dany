import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { name, email, phone, passes } = await request.json()

    // Validación básica
    if (!name || !passes || passes.length === 0) {
      return NextResponse.json(
        { error: 'Nombre y al menos un pase son requeridos' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Crear el invitado
    const { data: guestData, error: guestError } = await supabase
      .from('guests')
      .insert({
        name,
        email: email || null,
        phone: phone || null,
      } as any)
      .select()
      .single()

    if (guestError) {
      console.error('Error creating guest:', guestError)
      return NextResponse.json(
        { error: 'Error al crear el invitado' },
        { status: 500 }
      )
    }

    // Crear los pases
    const passesToInsert = passes
      .filter((pass: { attendee_name: string }) => pass.attendee_name.trim())
      .map((pass: { attendee_name: string }) => ({
        guest_id: (guestData as any).id,
        attendee_name: pass.attendee_name.trim(),
        confirmation_status: 'pending',
      }))

    if (passesToInsert.length > 0) {
      const { error: passesError } = await supabase
        .from('passes')
        .insert(passesToInsert as any)

      if (passesError) {
        console.error('Error creating passes:', passesError)
        // Intentar limpiar el invitado creado
        await supabase.from('guests').delete().eq('id', (guestData as any).id)
        return NextResponse.json(
          { error: 'Error al crear los pases' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      { success: true, guest: guestData },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in POST /api/guests:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
