<template>
<div class="chat-layout full-height" :class="{ 'conversation-open': activeUser && isMobile }">

    <!-- LEFT -->
<div 
v-if="!activeUser || !isMobile"
  class="chat-list glass"
>

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
<div class="chat-window">

<div 
  v-if="activeUser"
  :key="conversationId"
  class="glass flex-1 flex flex-col h-full chat-window-mobile"
>

  


<!-- header -->
<div class="p-4 border-b border-white/10 flex items-center justify-between">

  <div class="font-semibold text-lg">
   <div class="flex items-center gap-3">
    <button
  class="back-btn"
  @click="activeUser = null"
>
  ←
</button>

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
      <div 
  ref="messagesBox" 
  class="flex-1 overflow-y-auto p-6 space-y-4 messages-scroll"
>

<div
  v-for="msg in messages"
  :key="msg?.id" 
  class="flex mb-2"
  :class="msg?.sender_id === userId ? 'justify-end' : 'justify-start'"
>
  <div
    class="relative px-3 py-1.5 rounded-2xl max-w-[85%] text-[14px] leading-snug flow-root"
    :class="msg?.sender_id === userId
      ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-br-md'
      : 'bg-white/10 text-white rounded-bl-md'"
  >
    <span class="break-words [overflow-wrap:anywhere] whitespace-pre-wrap">
      {{ msg?.content }}
    </span>

    <div class="float-right mt-1.5 ml-2 -mb-0.5 flex items-center space-x-1 h-3 text-[10px] opacity-70 select-none">
      <span>{{ formatTime(msg?.created_at) }}</span>
      
   
    </div>
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
<div 
  v-else-if="!isMobile"
  class="h-full flex items-center justify-center opacity-40 text-lg"
>
  Выбери диалог
</div>
</div>

  </div>
</template>


<script setup>
import { ref, nextTick, computed } from "vue"
import { supabase } from "../lib/supabase"
import { onMounted, onUnmounted } from "vue"
import { getOnlineUsers } from "../composables/usePresence"
import { useAuth } from "../composables/useAuth"
import { watch } from "vue"




const { user } = useAuth()
const userId = computed(() => user.value?.id)

const users = ref([])
const messages = ref([])
const newMessage = ref("")
const activeUser = ref(null)
const searchQuery = ref("")
const messagesBox = ref(null)

let channel = null
const conversationId = ref(null)
const conversations = ref([])
const menuOpen = ref(false)
const searchResults = ref([])

const onlineUsers = getOnlineUsers()
const isMobile = ref(false)

const emit = defineEmits(["toggleMobileNav"])

watch(activeUser, (val) => {
  emit("toggleMobileNav", !!val)
})

const checkScreen = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  checkScreen()
  window.addEventListener("resize", checkScreen)
})

onUnmounted(() => {
  window.removeEventListener("resize", checkScreen)
})


function formatTime(dateString){
  const date = new Date(dateString)

  return date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit"
  })
}



function handleClickOutside(e){
  if(!e.target.closest(".relative")){
    menuOpen.value = false
  }
}

onMounted(() => window.addEventListener("click", handleClickOutside))
onUnmounted(() => window.removeEventListener("click", handleClickOutside))



let conversationsChannel = null

watch(userId, async (id) => {
  if (!id) return
  await loadConversations()
  setupConversationsListener()
}, { immediate: true })

function setupConversationsListener(){
  if(!userId.value) return
  
  if(conversationsChannel){
    supabase.removeChannel(conversationsChannel)
  }
  
  conversationsChannel = supabase
    .channel("conversations-" + userId.value)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "conversations",
        filter: `or(user1.eq.${userId.value},user2.eq.${userId.value})`
      },
      (payload) => {
        loadConversations()
      }
    )
    .subscribe()
}




async function searchUsers(){

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
    .neq("id", userId.value)
    .limit(10)

  if(error){
    console.error(error)
    return
  }

  searchResults.value = data || []
}



async function clearHistory(){
  menuOpen.value = false

if(!conversationId.value) return

  await supabase
    .from("messages")
    .delete()
    .eq("conversation_id", conversationId.value)

  messages.value = []
}

async function deleteChat(){
  menuOpen.value = false

  if(!conversationId.value) return

  const convIdToDelete = conversationId.value

  if(channel){
    await supabase.removeChannel(channel)
    channel = null
  }

  messages.value = []
  activeUser.value = null
  conversationId.value = null

  await supabase
    .from("conversations")
    .delete()
    .eq("id", convIdToDelete)

  await loadConversations()
}



async function openChat(user){

  messages.value = []
  activeUser.value = user

  // Удаляем старый channel перед открытием нового
  if(channel){
    await supabase.removeChannel(channel)
    channel = null
  }

  // если уже есть conversationId в conversations — не делай запрос
  const existingLocal = conversations.value.find(c => c.id === user.id)

  if(existingLocal){
    conversationId.value = existingLocal.conversationId
  } else {
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .or(
        `and(user1.eq.${userId.value},user2.eq.${user.id}),and(user1.eq.${user.id},user2.eq.${userId.value})`
      )
      .maybeSingle()

    if(existing){
      conversationId.value = existing.id
    } else {
      // Создаём новую conversation если её нет
      const { data: newConv, error } = await supabase
        .from("conversations")
        .insert({
          user1: userId.value,
          user2: user.id
        })
        .select("id")
        .single()
      
      if(!error && newConv){
        conversationId.value = newConv.id
        await loadConversations()
      }
    }
  }

  await loadMessages()
  setupRealtime()
}
function setupRealtime(){

  if(!conversationId.value) return

  if(channel){
    supabase.removeChannel(channel)
  }

  channel = supabase
    .channel("messages-" + conversationId.value)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId.value}`
      },
      (payload) => {

        if(!messages.value.find(m => m.id === payload.new.id)){
          messages.value.push(payload.new)
        }

        nextTick(() => {
          messagesBox.value?.scrollTo({
            top: messagesBox.value.scrollHeight
          })
        })
      }
    )
    .subscribe()
}



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

  if(!conversationId.value) return

  const { data } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId.value)
    .order("created_at", { ascending: true })

  messages.value = data || []

  await nextTick()
  messagesBox.value?.scrollTo({
    top: messagesBox.value.scrollHeight,
    behavior: "smooth"
  })
}


async function sendMessage(){

  if(!newMessage.value.trim() || !conversationId.value) return

  const text = newMessage.value
  const sender = user.value?.id

  newMessage.value = ""

  const { error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId.value,
      sender_id: sender,
      content: text
    })

  if(error){
    console.error(error)
  } else {
    await loadConversations()
  }
}
</script>

<style scoped>
.full-height {
  height: 100vh;
}
/* убрать scrollbar */
.messages-scroll::-webkit-scrollbar {
  width: 0px;
  height: 0px;
}

.messages-scroll {
  -ms-overflow-style: none;  /* IE */
  scrollbar-width: none;     /* Firefox */
}
.chat-layout {
  display: flex;
  gap: 24px;
  height: 85vh;
}

/* список */
.chat-list {
  width: 33%;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

/* окно */
.chat-window {
  flex: 1;
  display: flex;
}

/* кнопка назад */
.back-btn {
  display: none;
  margin-right: 12px;
  font-size: 18px;
  opacity: 0.7;
}

/* ========================= */
/* 📱 МОБИЛЬНАЯ ВЕРСИЯ */
/* ========================= */

@media (max-width: 768px) {

  .chat-layout {
    flex-direction: column;
    height: 100vh;
    min-height: 100dvh;
  }

  .chat-list {
    width: 100%;
    height: 100%;
  }

  .chat-window {
    width: 100%;
    height: 100%;
  }

  /* когда открыт диалог — скрываем список (fallback: Safari не всегда поддерживает :has) */
  .chat-layout.conversation-open .chat-list {
    display: none;
  }

  .back-btn {
    display: block;
  }

}
</style>

