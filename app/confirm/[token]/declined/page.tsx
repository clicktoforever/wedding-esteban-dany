import { createClient } from '@/lib/supabase/server'
import DeclinedContent from './DeclinedContent'

interface PageProps {
  params: Promise<{ token: string }>
}

export default async function DeclinedPage(props: PageProps) {
  const params = await props.params
  const { token } = params
  
  const supabase = await createClient()
  const { data: guest } = await supabase
    .from('guests')
    .select('guest_type')
    .eq('access_token', token)
    .single()

  const homeUrl = guest?.guest_type === 'party' ? '/party' : '/'

  return <DeclinedContent homeUrl={homeUrl} />
}
