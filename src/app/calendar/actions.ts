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

  // Parse local time to Costa Rica timezone
  const startDateTime = `${date}T${startTime}:00-06:00`
  const endDateTime = `${date}T${endTime}:00-06:00`

  const { data: dbEvent, error } = await supabase
    .from('events')
    .insert({
      title,
      description,
      start_time: startDateTime,
      end_time: endDateTime,
      assigned_to: assignedTo === 'family' ? null : assignedTo,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Sync to Google Calendar if provider token is available
  const { data: { session } } = await supabase.auth.getSession()
  const providerToken = session?.provider_token
  
  if (providerToken) {
    try {
      const { createGoogleCalendarEvent } = await import('@/lib/google-calendar')
      const gEvent = await createGoogleCalendarEvent(providerToken, {
        title,
        description,
        startTime: startDateTime,
        endTime: endDateTime
      })

      if (gEvent && gEvent.id) {
        await supabase.from('events').update({ google_event_id: gEvent.id }).eq('id', dbEvent.id)
      }
    } catch (err) {
      console.error('Failed to sync event to Google Calendar', err)
    }
  }

  revalidatePath('/calendar')
  revalidatePath('/')
  return { success: true }
}

export async function updateEvent(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const date = formData.get('date') as string
  const startTime = formData.get('start_time') as string
  const endTime = formData.get('end_time') as string
  const assignedTo = formData.get('assigned_to') as string // UUID or 'family'

  if (!id || !title || !date || !startTime || !endTime) {
    return { error: 'Missing required fields' }
  }

  const startDateTime = `${date}T${startTime}:00-06:00`
  const endDateTime = `${date}T${endTime}:00-06:00`

  const { data: currentEvent } = await supabase.from('events').select('google_event_id').eq('id', id).single()

  const { error } = await supabase
    .from('events')
    .update({
      title,
      description,
      start_time: startDateTime,
      end_time: endDateTime,
      assigned_to: assignedTo === 'family' ? null : assignedTo,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  const { data: { session } } = await supabase.auth.getSession()
  const providerToken = session?.provider_token
  
  if (providerToken && currentEvent?.google_event_id) {
    try {
      const { updateGoogleCalendarEvent } = await import('@/lib/google-calendar')
      await updateGoogleCalendarEvent(providerToken, currentEvent.google_event_id, {
        title,
        description,
        startTime: startDateTime,
        endTime: endDateTime
      })
    } catch (err) {
      console.error('Failed to sync updated event to Google Calendar', err)
    }
  }

  revalidatePath('/calendar')
  revalidatePath('/')
  return { success: true }
}
