import { ref } from "vue"
import { supabase } from "../lib/supabase"

const user = ref(null)
const ready = ref(false)

let listener = null
let started = false

export async function initAuth() {

  if (started) return
  started = true
  

  const { data } = await supabase.auth.getSession()

  user.value = data.session?.user || null
  ready.value = true

  const { data: authListener } = supabase.auth.onAuthStateChange(
    (event, session) => {
      user.value = session?.user || null
    }
  )

  listener = authListener

}

export function useAuth() {
  return { user, ready }
}