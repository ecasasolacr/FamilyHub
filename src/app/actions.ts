'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function createProfile(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return redirect('/login')
  }

  const firstName = formData.get('first_name') as string
  const role = formData.get('role') as string
  const avatarColor = formData.get('avatar_color') as string

  // Check if it's the first user to make them admin
  const { count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  const finalRole = count === 0 ? 'admin' : (role || 'member')

  const { error } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      first_name: firstName,
      role: finalRole,
      avatar_color: avatarColor,
    })

  if (error) {
    console.error('Error creating profile', error)
    return { error: error.message }
  }

  redirect('/')
}
