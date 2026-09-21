'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createTask(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const title = formData.get('title') as string
  const points = parseInt(formData.get('points') as string) || 10
  const assignedTo = formData.get('assigned_to') as string
  const dueDate = formData.get('due_date') as string

  if (!title || !assignedTo) return { error: 'Missing required fields' }

  const { error } = await supabase
    .from('tasks')
    .insert({
      title,
      points,
      assigned_to: assignedTo,
      due_date: dueDate || null
    })

  if (error) return { error: error.message }

  revalidatePath('/tasks')
  revalidatePath('/')
  return { success: true }
}

export async function completeTask(taskId: string, points: number, assignedTo: string) {
  const supabase = await createClient()

  // 1. Mark task as completed
  const { error: taskError } = await supabase
    .from('tasks')
    .update({ is_completed: true })
    .eq('id', taskId)

  if (taskError) return { error: taskError.message }

  // 2. Fetch current points and update
  const { data: profile } = await supabase
    .from('profiles')
    .select('total_points')
    .eq('id', assignedTo)
    .single()

  if (profile) {
    await supabase
      .from('profiles')
      .update({ total_points: profile.total_points + points })
      .eq('id', assignedTo)
  }

  revalidatePath('/tasks')
  revalidatePath('/')
  return { success: true }
}
