import { ref } from "vue"
import { supabase } from "../lib/supabase"

const onlineUsers = ref(new Set())
let channel = null
let started = false

export async function startPresence(){

  if(started) return
  started = true

  const { data } = await supabase.auth.getUser()
  const uid = data.user?.id
  if(!uid) return

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

export function getOnlineUsers(){
  return onlineUsers
}
