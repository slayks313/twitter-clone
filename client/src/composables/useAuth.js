import { ref } from "vue"
import { supabase } from "../lib/supabase"

const user = ref(null)
const ready = ref(false)

export async function initAuth() {
  const { data } = await supabase.auth.getSession()
  user.value = data.session?.user || null
  ready.value = true

  // Слушаем изменения auth state в realtime
  supabase.auth.onAuthStateChange((event, session) => {
    user.value = session?.user || null
  })
}

export function useAuth() {
  return { user, ready }
}