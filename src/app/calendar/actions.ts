'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createEvent(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const date = formData.get('date') as string
  const startTime = formData.get('start_time') as string
  const endTime = formData.get('end_time') as string
  const assignedTo = formData.get('assigned_to') as string // UUID or 'family'

  if (!title || !date || !startTime || !endTime) {
    return { error: 'Missing required fields' }
  }

  // Parse local time back to UTC based ISO
  const startDateTime = new Date(`${date}T${startTime}:00`).toISOString()
  const endDateTime = new Date(`${date}T${endTime}:00`).toISOString()

  const { error } = await supabase
    .from('events')
    .insert({
      title,
      description,
      start_time: startDateTime,
      end_time: endDateTime,
      assigned_to: assignedTo === 'family' ? null : assignedTo,
    })

  if (error) {
    return { error: error.message }
  }

  // Sync to Google Calendar if provider token is available
  const { data: { session } } = await supabase.auth.getSession()
  const providerToken = session?.provider_token
  
  if (providerToken) {
    try {
      const { createGoogleCalendarEvent } = await import('@/lib/google-calendar')
      await createGoogleCalendarEvent(providerToken, {
        title,
        description,
        startTime: startDateTime,
        endTime: endDateTime
      })
    } catch (err) {
      console.error('Failed to sync event to Google Calendar', err)
    }
  }

  revalidatePath('/calendar')
  revalidatePath('/')
  return { success: true }
}
