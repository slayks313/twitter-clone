import { ref } from "vue"
import { supabase } from "../lib/supabase"

const onlineUsers = ref(new Set())
let channel = null
let started = false

async function start(uid){

  if(channel) return

  channel = supabase.channel("global-online", {
    config: { presence: { key: uid } }
  })

  channel
    .on("presence", { event: "sync" }, () => {
      const state = channel.presenceState() || {}
      onlineUsers.value = new Set(Object.keys(state))
    })
    .subscribe(async (status) => {
      if(status === "SUBSCRIBED"){
        await channel.track({ online: true })
      }
    })
}

export async function initPresence(){

  if(started) return
  started = true

  // 🔥 ВАЖНО: проверяем текущую сессию
  const { data } = await supabase.auth.getSession()
  if(data.session?.user){
    start(data.session.user.id)
  }

  // слушаем логин/логаут
  supabase.auth.onAuthStateChange(async (event, session) => {

    if(event === "SIGNED_IN" && session?.user){
      start(session.user.id)
    }

    if(event === "SIGNED_OUT"){
      if(channel){
        await channel.untrack()
        await supabase.removeChannel(channel)
        channel = null
        onlineUsers.value = new Set()
      }
    }
  })
}

export function getOnlineUsers(){
  return onlineUsers
}
