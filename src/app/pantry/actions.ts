'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addPantryItem(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const name = formData.get('name') as string
  const category = formData.get('category') as string

  if (!name) return { error: 'Name is required' }

  const { error } = await supabase
    .from('pantry_items')
    .insert({
      name,
      category: category || 'General',
      added_by: user.id
    })

  if (error) return { error: error.message }

  revalidatePath('/pantry')
  return { success: true }
}

export async function toggleLowStock(itemId: string, currentStatus: boolean) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('pantry_items')
    .update({ is_low_stock: !currentStatus })
    .eq('id', itemId)

  if (error) return { error: error.message }

  revalidatePath('/pantry')
  return { success: true }
}

export async function deletePantryItem(itemId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('pantry_items')
    .delete()
    .eq('id', itemId)

  if (error) return { error: error.message }

  revalidatePath('/pantry')
  return { success: true }
}
