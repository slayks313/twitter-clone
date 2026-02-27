import { ref } from "vue"
import { supabase } from "../lib/supabase"

const user = ref(null)
const ready = ref(false)

export async function initAuth() {
  const { data } = await supabase.auth.getSession()
  user.value = data.session?.user || null
  ready.value = true
}

export function useAuth() {
  return { user, ready }
}