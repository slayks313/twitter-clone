import { ref } from "vue"
import { supabase } from "../lib/supabase"
import { useAuth } from "./useAuth"

const onlineUsers = ref(new Set())
let channel = null
let started = false

async function start(uid){

  // если канал уже существует и активен — не создаём новый
  if(channel && channel.state === "joined") return

  // если канал есть но умер — удаляем
  if(channel){
    await supabase.removeChannel(channel)
    channel = null
  }

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

      if(status === "CLOSED" || status === "CHANNEL_ERROR"){
        channel = null
      }

    })

}

export async function initPresence(){

  if(started) return
  started = true

  const { user } = useAuth()

  // если пользователь уже залогинен
  if(user.value){
    start(user.value.id)
  }

  // слушаем логин / логаут
  supabase.auth.onAuthStateChange(async (event, session) => {

    if(event === "SIGNED_IN" && session?.user){
      start(session.user.id)
    }

    if(event === "SIGNED_OUT"){

      if(channel){
        await channel.untrack()
        await supabase.removeChannel(channel)
        channel = null
      }

      onlineUsers.value = new Set()

    }

  })

  // 🔥 фикс для возврата во вкладку
  document.addEventListener("visibilitychange", () => {

    if(document.visibilityState === "visible"){

      const { user } = useAuth()

      if(user.value){
        start(user.value.id)
      }

    }

  })

}

export function getOnlineUsers(){
  return onlineUsers
}