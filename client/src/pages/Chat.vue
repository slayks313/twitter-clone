<template>
  <div class="flex gap-6 h-[85vh]">

    <!-- LEFT -->
    <div class="glass w-1/3 p-4 flex flex-col">

      <h2 class="text-xl font-semibold mb-4 opacity-80">Messages</h2>

      <input
        v-model="searchQuery"
        @input="searchUsers"
        placeholder="Search username..."
        class="bg-white/5 rounded-xl px-4 py-3 outline-none focus:bg-white/10 transition mb-4"
      />

      <!-- users -->
   <div class="space-y-2 overflow-y-auto">

  <div
   v-for="user in (searchResults.length ? searchResults : conversations)"
    :key="user.id"
    @click="openChat(user)"
    class="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition border"
    :class="activeUser?.id === user.id
      ? 'bg-white/10 border-white/20'
      : 'border-transparent hover:border-white/10 hover:bg-white/5'"
  >

    <div class="relative">
      <img
        v-if="user.avatar_url"
        :src="user.avatar_url"
        class="w-11 h-11 rounded-full object-cover border border-white/20"
      />

      <div v-else class="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
        {{ user.name?.[0] }}
      </div>

      <div
       v-if="onlineUsers?.has?.(user.id)"
        class="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-[#0f172a] rounded-full"
      ></div>
    </div>

    <div class="flex-1 min-w-0">
      <div class="font-medium truncate">{{ user.name }}</div>
      <div class="text-xs opacity-50">
  @{{ user.username }}
</div>

    </div>

  </div>

  <div v-if="!(searchQuery ? searchResults.length : conversations.length)" class="opacity-40 text-sm text-center pt-6">
    Nothing found
  </div>

</div>


    </div>


    <!-- RIGHT -->
<div class="flex-1 flex">

<div v-if="activeUser" class="glass flex-1 flex flex-col h-full">

  


<!-- header -->
<div class="p-4 border-b border-white/10 flex items-center justify-between">

  <div class="font-semibold text-lg">
   <div class="flex items-center gap-3">

  <div class="relative">

    <img
      v-if="activeUser?.avatar_url"
      :src="activeUser.avatar_url"
      class="w-11 h-11 rounded-full object-cover border border-white/20"
    />

    <div v-else class="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
      {{ activeUser?.name?.[0] }}
    </div>

    <div
      v-if="onlineUsers.has(activeUser?.id)"
      class="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-[#0f172a] rounded-full"
    ></div>

  </div>

  <div>
    <div class="font-semibold">{{ activeUser?.name }}</div>
    <div class="text-xs opacity-60">
     {{ onlineUsers?.has?.(activeUser?.id) ? "в сети" : "не в сети" }}
    </div>
  </div>

</div>

  </div>

  <div class="relative" v-if="activeUser">
    <button
      @click="menuOpen = !menuOpen"
      class="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 transition text-xl"
    >
      ⋮
    </button>

    <div
      v-if="menuOpen"
      class="absolute right-0 top-12 w-48 glass rounded-xl p-2 shadow-2xl z-50"
    >
      <div
        class="px-3 py-2 rounded-lg hover:bg-white/10 cursor-pointer transition"
        @click="clearHistory"
      >
        Очистить историю
      </div>

      <div
        class="px-3 py-2 rounded-lg hover:bg-red-500/20 text-red-400 cursor-pointer transition"
        @click="deleteChat"
      >
        Удалить чат
      </div>
    </div>
  </div>

</div>


      <!-- messages -->
      <div ref="messagesBox" class="flex-1 overflow-y-auto p-6 space-y-4">

        <div
          v-for="msg in messages"
          :key="msg.id"
          class="flex"
          :class="msg.sender_id === userId ? 'justify-end' : 'justify-start'"
        >
          <div
            class="px-4 py-2 rounded-2xl max-w-[65%] text-sm leading-relaxed"
            :class="msg.sender_id === userId
              ? 'bg-gradient-to-br from-blue-500 to-indigo-600 rounded-br-none'
              : 'bg-white/10 rounded-bl-none'"
          >
            {{ msg.content }}
          </div>
        </div>

      </div>

      <!-- input -->
      <div class="p-4 border-t border-white/10 flex gap-3">
        <input
          v-model="newMessage"
          @keyup.enter="sendMessage"
          class="flex-1 bg-white/5 rounded-xl px-4 py-3 outline-none focus:bg-white/10 transition"
          placeholder="Write a message..."
        />

        <button
          @click="sendMessage"
          class="btn-glow px-6 py-2 rounded-xl"
        >
          Send
        </button>
      </div>

    </div>
     <div v-else class="h-full flex items-center justify-center opacity-40 text-lg">
    Выбери диалог
  </div>
</div>

  </div>
</template>



<script setup>
import { ref, nextTick } from "vue"
import { supabase } from "../lib/supabase"
import { onMounted, onUnmounted } from "vue"

const users = ref([])
const messages = ref([])
const newMessage = ref("")
const userId = ref(null)
const activeUser = ref(null)
const searchQuery = ref("")
const messagesBox = ref(null)

let channel = null
let conversationId = null
const conversations = ref([])
const menuOpen = ref(false)
const searchResults = ref([])
const onlineUsers = ref(new Set())
let presenceChannel = null





function handleClickOutside(e){
  if(!e.target.closest(".relative")){
    menuOpen.value = false
  }
}

onMounted(() => window.addEventListener("click", handleClickOutside))
onUnmounted(() => window.removeEventListener("click", handleClickOutside))

onMounted(async () => {

  const { data } = await supabase.auth.getUser()
  userId.value = data.user?.id

  // ---- ONLINE PRESENCE ----
  presenceChannel = supabase.channel("global-online", {
    config: { presence: { key: userId.value } }
  })

  presenceChannel
    .on("presence", { event: "sync" }, () => {
      const state = presenceChannel.presenceState() || {}
      onlineUsers.value = new Set(Object.keys(state))
    })
    .subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await presenceChannel.track({ online: true })
      }
    })

  await loadConversations()
})




async function searchUsers(){

  // пока юзер не загрузился — не ищем
  if(!userId.value) return

  const q = searchQuery.value.trim()

  if(!q){
    searchResults.value = []
    return
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, username, avatar_url")
    .ilike("username", `%${q}%`)
    .neq("id", userId.value)   // теперь не null
    .limit(10)

  if(error){
    console.error(error)
    return
  }

  searchResults.value = data || []
}



async function clearHistory(){
  menuOpen.value = false

  if(!conversationId) return

  await supabase
    .from("messages")
    .delete()
    .eq("conversation_id", conversationId)

  messages.value = []
}

async function deleteChat(){
  menuOpen.value = false


  if(!conversationId) return

  await supabase
    .from("conversations")
    .delete()
    .eq("id", conversationId)

  if(channel){
    await supabase.removeChannel(channel)
    channel = null
  }

  messages.value = []
  activeUser.value = null
  conversationId = null

  await loadConversations() // <--- ВОТ ГЛАВНОЕ
}



async function openChat(user){

  activeUser.value = user

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .or(
      `and(user1.eq.${userId.value},user2.eq.${user.id}),and(user1.eq.${user.id},user2.eq.${userId.value})`
    )
    .maybeSingle()

  if(existing){
    conversationId = existing.id
  } else {

    const { data: newConversation, error } = await supabase
      .from("conversations")
      .insert({
        user1: userId.value,
        user2: user.id
      })
      .select()
      .single()

    if(error){
      console.error(error)
      return
    }

    conversationId = newConversation.id
    await loadConversations()

  }

  if(conversationId){
    await loadMessages()

   if (channel) {
  await supabase.removeChannel(channel)
  channel = null
}


    channel = supabase
      .channel("messages-" + conversationId)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {

          // защита от дублей
          if(!messages.value.find(m => m.id === payload.new.id)){
            messages.value.push(payload.new)
          }

          nextTick(() => {
            messagesBox.value?.scrollTo({
              top: messagesBox.value.scrollHeight,
              behavior: "smooth"
            })
          })
        }
      )
      .subscribe()
  }
}


onUnmounted(async () => {
  if (presenceChannel) {
    await presenceChannel.untrack()
    await supabase.removeChannel(presenceChannel)
  }
})



async function loadConversations(){

  const { data } = await supabase
    .from("conversations")
    .select(`
  id,
  user1,
  user2,
  profiles_user1:profiles!conversations_user1_fkey(id,name,username,avatar_url),
  profiles_user2:profiles!conversations_user2_fkey(id,name,username,avatar_url)
`)
    .or(`user1.eq.${userId.value},user2.eq.${userId.value}`)

  if(!data) return

  conversations.value = data.map(c => {
  const other =
    c.user1 === userId.value
      ? c.profiles_user2
      : c.profiles_user1

  return {
    conversationId: c.id,
    ...other
  }
})

  

  users.value = conversations.value
}


async function loadMessages(){

  if(!conversationId) return

  const { data } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })

  messages.value = data || []

  await nextTick()
  messagesBox.value?.scrollTo({
    top: messagesBox.value.scrollHeight,
    behavior: "smooth"
  })
}


async function sendMessage(){

  if(!newMessage.value.trim() || !conversationId) return

  const text = newMessage.value
  newMessage.value = ""

  const { error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: userId.value,
      content: text
    })

  if(error){
    console.error(error)
  }
  await loadConversations()
}
</script>
