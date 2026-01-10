import { createClient } from '@supabase/supabase-js'
import type { Database } from '../lib/database.types'

// Initialize Supabase with service role key (bypasses RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

interface AttendeeInput {
  name: string
  dietaryRestrictions?: string
}

interface GuestInput {
  mainGuestName: string
  email?: string
  phone?: string
  attendees: AttendeeInput[]
}

async function generateInvite(guestInput: GuestInput) {
  try {
    // Insert guest
    const { data: guest, error: guestError } = await supabase
      .from('guests')
      .insert({
        name: guestInput.mainGuestName,
        email: guestInput.email,
        phone: guestInput.phone,
      })
      .select()
      .single()

    if (guestError || !guest) {
      throw new Error(`Error creating guest: ${guestError?.message}`)
    }

    // Insert passes for each attendee
    const passesData = guestInput.attendees.map(attendee => ({
      guest_id: guest.id,
      attendee_name: attendee.name,
      dietary_restrictions: attendee.dietaryRestrictions,
    }))

    const { error: passesError } = await supabase
      .from('passes')
      .insert(passesData)

    if (passesError) {
      throw new Error(`Error creating passes: ${passesError.message}`)
    }

    // Generate URLs
    const confirmUrl = `https://yourdomain.com/confirm/${guest.access_token}`
    const message = encodeURIComponent(
      `¡Hola! Te invitamos a la boda de Esteban y Dany 💍\n\nConfirma tu asistencia aquí: ${confirmUrl}\n\n¡Esperamos contar con tu presencia!`
    )
    const whatsappUrl = `https://wa.me/${guestInput.phone?.replace(/[^0-9]/g, '')}?text=${message}`

    console.log('\n✅ Invitación generada exitosamente!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`👤 Invitado: ${guest.name}`)
    console.log(`📧 Email: ${guest.email || 'N/A'}`)
    console.log(`📱 Teléfono: ${guest.phone || 'N/A'}`)
    console.log(`👥 Pases: ${guestInput.attendees.length}`)
    console.log(`   ${guestInput.attendees.map(a => `• ${a.name}`).join('\n   ')}`)
    console.log('\n🔗 URL de Confirmación:')
    console.log(`   ${confirmUrl}`)
    console.log('\n💬 Link de WhatsApp:')
    console.log(`   ${whatsappUrl}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    return {
      guest,
      confirmUrl,
      whatsappUrl,
    }
  } catch (error) {
    console.error('❌ Error generando invitación:', error)
    throw error
  }
}

// Example usage - You can modify this array with your guest list
const guestsToInvite: GuestInput[] = [
  {
    mainGuestName: 'Carlos Maldonado',
    email: 'carlos@example.com',
    phone: '+521234567890',
    attendees: [
      { name: 'Carlos Maldonado' },
      { name: 'Daniela López' },
      { name: 'Lupita Maldonado' },
    ],
  },
  {
    mainGuestName: 'María García',
    email: 'maria@example.com',
    phone: '+521234567891',
    attendees: [
      { name: 'María García' },
      { name: 'Pedro García' },
    ],
  },
]

// Main execution
async function main() {
  console.log('🎉 Generador de Invitaciones - Boda Esteban & Dany')
  console.log('═══════════════════════════════════════════════\n')

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Error: Variables de entorno no configuradas')
    console.error('Por favor configura NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  console.log(`📝 Generando ${guestsToInvite.length} invitaciones...\n`)

  for (const guest of guestsToInvite) {
    await generateInvite(guest)
  }

  console.log('✨ Todas las invitaciones han sido generadas exitosamente!')
  console.log('\n💡 Próximos pasos:')
  console.log('   1. Copia los links de WhatsApp generados arriba')
  console.log('   2. Envíalos a cada invitado')
  console.log('   3. Monitorea las confirmaciones en /admin')
}

// Run the script
main().catch(console.error)
