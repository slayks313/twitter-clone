<template>
<div class="chat-layout full-height" :class="{ 'conversation-open': !!activeChatKey && isMobile }">

    <!-- LEFT -->
<div 
v-if="!activeUser || !isMobile"
  class="chat-list glass"
>

      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold opacity-80">SchoolHubUz</h2>

        <button
          class="new-group-btn"
          @click="openCreateGroup()"
          title="Создать группу"
        >
          ＋
        </button>
      </div>

      <input
        v-model="searchQuery"
        @input="searchUsers"
        placeholder="Search username..."
        class="bg-white/5 rounded-xl px-4 py-3 outline-none focus:bg-white/10 transition mb-4"
      />

      <!-- users -->
   <div class="space-y-2 overflow-y-auto">

  <!-- groups -->
  <div v-if="!searchQuery && groups.length" class="pt-1 pb-2">
    <div class="text-xs opacity-50 px-2 pb-2">Группы</div>

    <div
      v-for="g in groups"
      :key="g.id"
      @click="openGroup(g)"
      class="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition border"
      :class="activeChatKey === `group:${g.id}`
        ? 'bg-white/10 border-white/20'
        : 'border-transparent hover:border-white/10 hover:bg-white/5'"
    >
      <div class="relative">
        <img
          v-if="g.avatar_url"
          :src="g.avatar_url"
          class="w-11 h-11 rounded-full object-cover border border-white/20"
        />
        <div v-else class="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center border border-white/20 font-semibold">
          {{ (g.title || "G")[0] }}
        </div>
      </div>

      <div class="flex-1 min-w-0">
        <div class="font-medium truncate">{{ g.title }}</div>
        <div class="text-xs opacity-50 truncate">
          {{ g.members_count }} участников
        </div>
      </div>

      <div v-if="unreadFor(`group:${g.id}`) > 0" class="badge">
        {{ unreadFor(`group:${g.id}`) > 99 ? "99+" : unreadFor(`group:${g.id}`) }}
      </div>
    </div>
  </div>

  <div v-if="!searchQuery && groups.length && conversations.length" class="divider"></div>

  <div v-if="!searchQuery && conversations.length" class="pt-1 pb-2">
    <div class="text-xs opacity-50 px-2 pb-2">Личные</div>
  </div>

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

    <div v-if="!searchResults.length && unreadFor(`direct:${user.conversationId}`) > 0" class="badge">
      {{ unreadFor(`direct:${user.conversationId}`) > 99 ? "99+" : unreadFor(`direct:${user.conversationId}`) }}
    </div>

  </div>

  <div v-if="!(searchQuery ? searchResults.length : (conversations.length + groups.length))" class="opacity-40 text-sm text-center pt-6">
    Nothing found
  </div>

</div>


    </div>


    <!-- RIGHT -->
<div class="chat-window">

<div 
  v-if="activeChatKey"
  :key="activeChatKey"
  class="glass flex-1 flex flex-col h-full chat-window-mobile"
>

  


<!-- header -->
<div class="p-4 border-b border-white/10 flex items-center justify-between">

  <div class="font-semibold text-lg">
   <div class="flex items-center gap-3">
    <button
  class="back-btn"
  @click="closeActive()"
>
  ←
</button>

  <div class="relative">

    <img
      v-if="activeHeaderAvatar"
      :src="activeHeaderAvatar"
      class="w-11 h-11 rounded-full object-cover border border-white/20"
    />

    <div v-else class="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
      {{ activeHeaderTitle?.[0] }}
    </div>

    <div
      v-if="activeType === 'direct' && onlineUsers.has(activeUser?.id)"
      class="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-[#0f172a] rounded-full"
    ></div>

  </div>

  <div>
    <div class="font-semibold">{{ activeHeaderTitle }}</div>
    <div class="text-xs opacity-60">
     <template v-if="activeType === 'direct'">
      {{ onlineUsers?.has?.(activeUser?.id) ? "в сети" : "не в сети" }}
     </template>
     <template v-else>
      {{ activeGroup?.members_count }} участников
     </template>
    </div>
  </div>

</div>

  </div>

  <div class="relative" v-if="activeChatKey">
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
      <template v-if="activeType === 'group'">
        <div
          class="px-3 py-2 rounded-lg hover:bg-white/10 cursor-pointer transition"
          @click="openInvite()"
        >
          Пригласить участников
        </div>

        <div
          class="px-3 py-2 rounded-lg hover:bg-white/10 cursor-pointer transition"
          @click="openRenameGroup()"
        >
          Изменить название
        </div>

        <div
          class="px-3 py-2 rounded-lg hover:bg-red-500/20 text-red-400 cursor-pointer transition"
          @click="leaveGroup()"
        >
          Выйти из группы
        </div>

        <div
          v-if="isGroupOwner"
          class="px-3 py-2 rounded-lg hover:bg-red-500/20 text-red-400 cursor-pointer transition"
          @click="deleteGroup()"
        >
          Удалить группу
        </div>

        <div class="divider my-1"></div>
      </template>

      <div
        class="px-3 py-2 rounded-lg hover:bg-white/10 cursor-pointer transition"
        @click="clearHistory"
      >
        Очистить историю
      </div>

      <div
        v-if="activeType === 'direct'"
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
  class="mb-2"
>
  <!-- system events (join/leave/invite etc) -->
  <div v-if="msg?.sender_id == null" class="flex justify-center my-2">
    <div class="system-chip">
      {{ msg?.content }}
    </div>
  </div>

  <!-- normal messages -->
  <div
    v-else
    class="flex"
    :class="msg?.sender_id === userId ? 'justify-end' : 'justify-start'"
  >
    <!-- avatar for other members in group -->
    <template v-if="activeType === 'group' && msg?.sender_id !== userId">
      <div class="mr-2 mt-4">
        <img
          v-if="memberAvatarById(msg?.sender_id)"
          :src="memberAvatarById(msg?.sender_id)"
          class="w-8 h-8 rounded-full object-cover border border-white/20"
        />
        <div
          v-else
          class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20 text-xs font-semibold"
        >
          {{ memberInitialById(msg?.sender_id) }}
        </div>
      </div>
    </template>

    <div
      class="message-bubble relative px-3 py-1.5 rounded-2xl text-[14px] leading-snug flow-root"
      :class="msg?.sender_id === userId
        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-br-md'
        : 'bg-white/10 text-white rounded-bl-md'"
    >
      <div v-if="activeType === 'group' && msg?.sender_id !== userId" class="text-xs opacity-60 mb-1 font-semibold">
        {{ memberNameById(msg?.sender_id) }}
      </div>
      <span class="message-text whitespace-pre-wrap">
        {{ msg?.content }}
      </span>

      <div class="float-right mt-1.5 ml-2 -mb-0.5 flex items-center space-x-1 h-3 text-[10px] opacity-70 select-none">
        <span>{{ formatTime(msg?.created_at) }}</span>
      </div>
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

  <!-- Create group modal -->
  <div v-if="createGroupOpen" class="modal-backdrop" @click.self="closeCreateGroup()">
    <div class="modal glass">
      <div class="modal-header">
        <div class="font-semibold">
          <span v-if="createStep === 1">Новая группа</span>
          <span v-else>Название группы</span>
        </div>
        <button class="icon-btn" @click="closeCreateGroup()">✕</button>
      </div>

      <div class="modal-body">
        <template v-if="createStep === 1">
          <div class="text-sm opacity-70 mb-3">Выбери участников</div>
          <input
            v-model="createSearch"
            @input="searchUsersForGroup"
            placeholder="Поиск по @username..."
            class="bg-white/5 rounded-xl px-4 py-3 outline-none focus:bg-white/10 transition mb-3 w-full"
          />

          <div v-if="selectedMembers.length" class="selected-row">
            <div
              v-for="m in selectedMembers"
              :key="m.id"
              class="chip"
              @click="toggleMember(m)"
              title="Убрать"
            >
              {{ m.name }}
              <span class="opacity-70">✕</span>
            </div>
          </div>

          <div class="space-y-2 overflow-y-auto max-h-[46vh] pr-1">
            <div
              v-for="u in groupSearchResults"
              :key="u.id"
              class="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition border"
              :class="isSelected(u) ? 'bg-white/10 border-white/20' : 'border-transparent hover:border-white/10 hover:bg-white/5'"
              @click="toggleMember(u)"
            >
              <div class="relative">
                <img
                  v-if="u.avatar_url"
                  :src="u.avatar_url"
                  class="w-10 h-10 rounded-full object-cover border border-white/20"
                />
                <div v-else class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                  {{ u.name?.[0] }}
                </div>
              </div>

              <div class="flex-1 min-w-0">
                <div class="font-medium truncate">{{ u.name }}</div>
                <div class="text-xs opacity-50 truncate">@{{ u.username }}</div>
              </div>

              <div v-if="isSelected(u)" class="text-sm opacity-80">✓</div>
            </div>

            <div v-if="!groupSearchResults.length" class="opacity-40 text-sm text-center pt-6">
              Начни вводить username
            </div>
          </div>
        </template>

        <template v-else>
          <div class="flex items-center gap-3 mb-3">
            <div class="avatar-pick">
              <img v-if="createAvatarUrl" :src="createAvatarUrl" class="w-14 h-14 rounded-full object-cover border border-white/20" />
              <div v-else class="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center border border-white/20 font-semibold">
                {{ (createTitle || "G")[0] }}
              </div>
            </div>

            <div class="flex-1">
              <input
                v-model="createTitle"
                placeholder="Название группы"
                class="bg-white/5 rounded-xl px-4 py-3 outline-none focus:bg-white/10 transition w-full"
              />
              <div class="text-xs opacity-50 mt-1">Участников: {{ selectedMembers.length + 1 }}</div>
            </div>
          </div>

          <input
            v-model="createAvatarUrl"
            placeholder="Ссылка на аватар (необязательно)"
            class="bg-white/5 rounded-xl px-4 py-3 outline-none focus:bg-white/10 transition w-full"
          />
        </template>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" v-if="createStep === 2" @click="createStep = 1">Назад</button>
        <button class="btn-secondary" v-if="createStep === 1" @click="closeCreateGroup()">Отмена</button>

        <button
          class="btn-glow px-5 py-2 rounded-xl"
          :disabled="createStep === 1 ? selectedMembers.length === 0 : !createTitle.trim() || creatingGroup"
          @click="createStep === 1 ? (createStep = 2) : createGroup()"
        >
          {{ createStep === 1 ? "Далее" : (creatingGroup ? "Создаю..." : "Создать") }}
        </button>
      </div>
    </div>
  </div>

  <!-- Invite modal -->
  <div v-if="inviteOpen" class="modal-backdrop" @click.self="closeInvite()">
    <div class="modal glass">
      <div class="modal-header">
        <div class="font-semibold">Пригласить в группу</div>
        <button class="icon-btn" @click="closeInvite()">✕</button>
      </div>

      <div class="modal-body">
        <input
          v-model="inviteSearch"
          @input="searchUsersForInvite"
          placeholder="Поиск по @username..."
          class="bg-white/5 rounded-xl px-4 py-3 outline-none focus:bg-white/10 transition mb-3 w-full"
        />

        <div class="space-y-2 overflow-y-auto max-h-[46vh] pr-1">
          <div
            v-for="u in inviteResults"
            :key="u.id"
            class="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition border border-transparent hover:border-white/10 hover:bg-white/5"
            @click="inviteUser(u)"
          >
            <div class="relative">
              <img
                v-if="u.avatar_url"
                :src="u.avatar_url"
                class="w-10 h-10 rounded-full object-cover border border-white/20"
              />
              <div v-else class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                {{ u.name?.[0] }}
              </div>
            </div>

            <div class="flex-1 min-w-0">
              <div class="font-medium truncate">{{ u.name }}</div>
              <div class="text-xs opacity-50 truncate">@{{ u.username }}</div>
            </div>
          </div>

          <div v-if="!inviteResults.length" class="opacity-40 text-sm text-center pt-6">
            Начни вводить username
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" @click="closeInvite()">Закрыть</button>
      </div>
    </div>
  </div>

  <!-- Rename modal -->
  <div v-if="renameOpen" class="modal-backdrop" @click.self="closeRename()">
    <div class="modal glass">
      <div class="modal-header">
        <div class="font-semibold">Изменить название</div>
        <button class="icon-btn" @click="closeRename()">✕</button>
      </div>

      <div class="modal-body">
        <input
          v-model="renameTitle"
          placeholder="Новое название"
          class="bg-white/5 rounded-xl px-4 py-3 outline-none focus:bg-white/10 transition w-full"
        />
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" @click="closeRename()">Отмена</button>
        <button class="btn-glow px-5 py-2 rounded-xl" :disabled="!renameTitle.trim() || renaming" @click="renameGroup()">
          {{ renaming ? "Сохраняю..." : "Сохранить" }}
        </button>
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
import { useUnreadMessages } from "../composables/useUnreadMessages"
import { watch } from "vue"




const { user } = useAuth()
const userId = computed(() => user.value?.id)
const { getUnreadCount, updateLastRead, reloadUnreadCounts } = useUnreadMessages()

const users = ref([])
const myProfile = ref(null)
const messages = ref([])
const newMessage = ref("")
const activeUser = ref(null)
const activeGroup = ref(null)
const activeType = ref(null) // 'direct' | 'group' | null
const activeChatKey = ref(null) // direct:<conversationId> | group:<groupId>
const searchQuery = ref("")
const messagesBox = ref(null)

let channel = null
const conversationId = ref(null) // only for direct
const conversations = ref([])
const groups = ref([])
const menuOpen = ref(false)
const searchResults = ref([])

const onlineUsers = getOnlineUsers()
const isMobile = ref(false)

const emit = defineEmits(["toggleMobileNav"])

// для мобильного: скрывать нижний navbar, когда открыт ЛЮБОЙ чат (личный или групповой)
watch(activeChatKey, (val) => {
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

// загружаем мой профиль для красивых системных сообщений
onMounted(async () => {
  if(!userId.value) return
  const { data, error } = await supabase
    .from("profiles")
    .select("id,name,username")
    .eq("id", userId.value)
    .single()
  if(!error){
    myProfile.value = data
  }
})



let conversationsChannel = null

watch(userId, async (id) => {
  if (!id) return
  await loadConversations()
  await loadGroups()
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
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "group_members",
        filter: `user_id=eq.${userId.value}`
      },
      () => {
        loadGroups()
      }
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "groups"
      },
      () => {
        loadGroups()
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

  if(activeType.value === "direct"){
    if(!conversationId.value) return

    await supabase
      .from("messages")
      .delete()
      .eq("conversation_id", conversationId.value)
  } else if(activeType.value === "group"){
    if(!activeGroup.value?.id) return
    await supabase
      .from("messages")
      .delete()
      .eq("group_id", activeGroup.value.id)
  } else {
    return
  }

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
  activeGroup.value = null
  activeType.value = "direct"
  activeChatKey.value = `direct:${user.conversationId || ""}`

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

  activeChatKey.value = `direct:${conversationId.value}`
  await loadMessages()
  setupRealtime()
  updateLastRead(activeChatKey.value)
  reloadUnreadCounts()
}

async function openGroup(group){
  messages.value = []
  activeGroup.value = group
  activeUser.value = null
  activeType.value = "group"
  conversationId.value = null
  activeChatKey.value = `group:${group.id}`

  if(channel){
    await supabase.removeChannel(channel)
    channel = null
  }

  await loadGroupMembers(group.id)
  await loadMessages()
  setupRealtime()
  updateLastRead(activeChatKey.value)
  reloadUnreadCounts()
}

function setupRealtime(){

  if(!activeChatKey.value) return

  if(channel){
    supabase.removeChannel(channel)
  }

  channel = supabase
    .channel("messages-" + activeChatKey.value)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: activeType.value === "direct"
          ? `conversation_id=eq.${conversationId.value}`
          : `group_id=eq.${activeGroup.value?.id}`
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

async function loadGroups(){
  if(!userId.value) return

  const { data: memberships, error } = await supabase
    .from("group_members")
    .select("group_id, role, groups:groups(id,title,avatar_url,created_by,created_at)")
    .eq("user_id", userId.value)

  if(error){
    console.error(error)
    return
  }

  const base = (memberships || []).map((m) => ({
    ...m.groups,
    myRole: m.role
  })).filter(Boolean)

  // members count
  const ids = base.map((g) => g.id).filter(Boolean)
  if(!ids.length){
    groups.value = []
    return
  }

  const { data: counts } = await supabase
    .from("group_members")
    .select("group_id")
    .in("group_id", ids)

  const map = new Map()
  ;(counts || []).forEach((r) => {
    map.set(r.group_id, (map.get(r.group_id) || 0) + 1)
  })

  groups.value = base.map((g) => ({
    ...g,
    members_count: map.get(g.id) || 1
  }))
}

async function loadMessages(){

  if(activeType.value === "direct"){
    if(!conversationId.value) return

    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId.value)
      .order("created_at", { ascending: true })

    messages.value = data || []
  } else if(activeType.value === "group"){
    if(!activeGroup.value?.id) return

    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("group_id", activeGroup.value.id)
      .order("created_at", { ascending: true })

    messages.value = data || []
  } else {
    return
  }

  await nextTick()
  messagesBox.value?.scrollTo({
    top: messagesBox.value.scrollHeight,
    behavior: "smooth"
  })
}


async function sendMessage(){

  if(!newMessage.value.trim() || !activeChatKey.value) return
  if(activeType.value === "direct" && !conversationId.value) return
  if(activeType.value === "group" && !activeGroup.value?.id) return

  const text = newMessage.value
  const sender = user.value?.id

  newMessage.value = ""

  const payload = {
    sender_id: sender,
    content: text
  }

  if(activeType.value === "direct"){
    payload.conversation_id = conversationId.value
  } else if(activeType.value === "group"){
    payload.group_id = activeGroup.value?.id
  } else {
    return
  }

  // safety: не даём отправить, если целевой чат определён криво
  const hasConv = !!payload.conversation_id
  const hasGroup = !!payload.group_id
  if((hasConv && hasGroup) || (!hasConv && !hasGroup)){
    console.error("Invalid chat target for message", {
      activeType: activeType.value,
      conversationId: conversationId.value,
      groupId: activeGroup.value?.id,
      payload
    })
    return
  }

  const { error } = await supabase
    .from("messages")
    .insert(payload)

  if(error){
    console.error(error)
  } else {
    await loadConversations()
    await loadGroups()
  }
}

// ===== Group creation / management =====
const createGroupOpen = ref(false)
const createStep = ref(1)
const createSearch = ref("")
const groupSearchResults = ref([])
const selectedMembers = ref([])
const createTitle = ref("")
const createAvatarUrl = ref("")
const creatingGroup = ref(false)

function openCreateGroup(){
  createGroupOpen.value = true
  createStep.value = 1
  createSearch.value = ""
  groupSearchResults.value = []
  selectedMembers.value = []
  createTitle.value = ""
  createAvatarUrl.value = ""
}

function closeCreateGroup(){
  createGroupOpen.value = false
  creatingGroup.value = false
}

async function searchUsersForGroup(){
  if(!userId.value) return
  const q = createSearch.value.trim()
  if(!q){
    groupSearchResults.value = []
    return
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, username, avatar_url")
    .ilike("username", `%${q}%`)
    .neq("id", userId.value)
    .limit(20)

  if(error){
    console.error(error)
    return
  }

  groupSearchResults.value = data || []
}

function isSelected(u){
  return !!selectedMembers.value.find((m) => m.id === u.id)
}

function toggleMember(u){
  const idx = selectedMembers.value.findIndex((m) => m.id === u.id)
  if(idx >= 0) selectedMembers.value.splice(idx, 1)
  else selectedMembers.value.push(u)
}

async function createGroup(){
  if(creatingGroup.value) return
  if(!userId.value) return
  if(!createTitle.value.trim()) return
  if(selectedMembers.value.length === 0) return

  creatingGroup.value = true
  try{
    const { data: g, error: gErr } = await supabase
      .from("groups")
      .insert({
        title: createTitle.value.trim(),
        avatar_url: createAvatarUrl.value.trim() || null,
        created_by: userId.value
      })
      .select("id,title,avatar_url,created_by,created_at")
      .single()

    if(gErr) throw gErr

    const memberRows = [
      { group_id: g.id, user_id: userId.value, role: "owner", added_by: userId.value },
      ...selectedMembers.value.map((m) => ({
        group_id: g.id,
        user_id: m.id,
        role: "member",
        added_by: userId.value
      }))
    ]

    const { error: mErr } = await supabase
      .from("group_members")
      .insert(memberRows)

    if(mErr) throw mErr

    // системное сообщение о создании группы и приглашённых
    const invitedNames = selectedMembers.value.map((m) => m.name || (m.username ? `@${m.username}` : "")).filter(Boolean)
    const baseText = invitedNames.length
      ? `${myDisplayName.value} создал(а) группу и пригласил(а): ${invitedNames.join(", ")}`
      : `${myDisplayName.value} создал(а) группу`

    await supabase
      .from("messages")
      .insert({
        group_id: g.id,
        sender_id: null,
        content: baseText
      })

    await loadGroups()
    closeCreateGroup()

    const opened = groups.value.find((x) => x.id === g.id) || { ...g, members_count: selectedMembers.value.length + 1 }
    await openGroup(opened)
  } catch(e){
    console.error(e)
  } finally {
    creatingGroup.value = false
  }
}

// invite
const inviteOpen = ref(false)
const inviteSearch = ref("")
const inviteResults = ref([])

function openInvite(){
  menuOpen.value = false
  inviteOpen.value = true
  inviteSearch.value = ""
  inviteResults.value = []
}
function closeInvite(){
  inviteOpen.value = false
}
async function searchUsersForInvite(){
  if(!userId.value) return
  const q = inviteSearch.value.trim()
  if(!q){
    inviteResults.value = []
    return
  }
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, username, avatar_url")
    .ilike("username", `%${q}%`)
    .neq("id", userId.value)
    .limit(20)
  if(error){
    console.error(error)
    return
  }
  inviteResults.value = data || []
}

async function inviteUser(u){
  if(!activeGroup.value?.id) return
  try{
    // require owner/admin to invite
    if(!(activeGroupRole.value === "owner" || activeGroupRole.value === "admin")){
      return
    }

    await supabase
      .from("group_members")
      .insert({
        group_id: activeGroup.value.id,
        user_id: u.id,
        role: "member",
        added_by: userId.value
      })

    // системное сообщение "X пригласил Y"
    const targetName = u.name || (u.username ? `@${u.username}` : "")
    const text = targetName
      ? `${myDisplayName.value} пригласил(а) ${targetName} в группу`
      : `${myDisplayName.value} пригласил(а) нового участника в группу`

    await supabase
      .from("messages")
      .insert({
        group_id: activeGroup.value.id,
        sender_id: null,
        content: text
      })

    await loadGroups()
    await loadGroupMembers(activeGroup.value.id)
    closeInvite()
  } catch(e){
    console.error(e)
  }
}

// rename
const renameOpen = ref(false)
const renameTitle = ref("")
const renaming = ref(false)
function openRenameGroup(){
  menuOpen.value = false
  renameTitle.value = activeGroup.value?.title || ""
  renameOpen.value = true
}
function closeRename(){
  renameOpen.value = false
  renaming.value = false
}
async function renameGroup(){
  if(renaming.value) return
  if(!activeGroup.value?.id) return
  if(!(activeGroupRole.value === "owner" || activeGroupRole.value === "admin")) return
  renaming.value = true
  try{
    const { error } = await supabase
      .from("groups")
      .update({ title: renameTitle.value.trim() })
      .eq("id", activeGroup.value.id)
    if(error) throw error

    await loadGroups()
    activeGroup.value = (groups.value.find((g) => g.id === activeGroup.value.id)) || { ...activeGroup.value, title: renameTitle.value.trim() }
    closeRename()
  } catch(e){
    console.error(e)
  } finally {
    renaming.value = false
  }
}

async function leaveGroup(){
  menuOpen.value = false
  if(!activeGroup.value?.id || !userId.value) return
  try{
    // системное сообщение "X вышел из группы"
    await supabase
      .from("messages")
      .insert({
        group_id: activeGroup.value.id,
        sender_id: null,
        content: `${myDisplayName.value} вышел(а) из группы`
      })

    await supabase
      .from("group_members")
      .delete()
      .eq("group_id", activeGroup.value.id)
      .eq("user_id", userId.value)

    closeActive()
    await loadGroups()
  } catch(e){
    console.error(e)
  }
}

async function deleteGroup(){
  menuOpen.value = false
  if(!activeGroup.value?.id) return
  if(activeGroupRole.value !== "owner") return
  try{
    // best-effort cascade if not set in DB
    await supabase.from("messages").delete().eq("group_id", activeGroup.value.id)
    await supabase.from("group_members").delete().eq("group_id", activeGroup.value.id)
    await supabase.from("groups").delete().eq("id", activeGroup.value.id)
    closeActive()
    await loadGroups()
  } catch(e){
    console.error(e)
  }
}

function closeActive(){
  activeUser.value = null
  activeGroup.value = null
  activeType.value = null
  activeChatKey.value = null
  conversationId.value = null
  messages.value = []
  menuOpen.value = false
  if(channel){
    supabase.removeChannel(channel)
    channel = null
  }
}

const activeHeaderTitle = computed(() => {
  if(activeType.value === "direct") return activeUser.value?.name || ""
  if(activeType.value === "group") return activeGroup.value?.title || ""
  return ""
})

const activeHeaderAvatar = computed(() => {
  if(activeType.value === "direct") return activeUser.value?.avatar_url || ""
  if(activeType.value === "group") return activeGroup.value?.avatar_url || ""
  return ""
})

// group members map (for sender names)
const membersById = ref(new Map())
const activeGroupRole = ref(null) // owner/admin/member
const myDisplayName = computed(() => {
  if(myProfile.value?.name) return myProfile.value.name
  if(myProfile.value?.username) return `@${myProfile.value.username}`
  return "Кто-то"
})

async function loadGroupMembers(groupId){
  if(!groupId || !userId.value) return
  const { data, error } = await supabase
    .from("group_members")
    .select("user_id, role, profiles:profiles!group_members_user_id_fkey(id,name,username,avatar_url)")
    .eq("group_id", groupId)

  if(error){
    console.error(error)
    return
  }

  const map = new Map()
  let myRole = null
  ;(data || []).forEach((row) => {
    if(row.user_id === userId.value) myRole = row.role
    map.set(row.user_id, row.profiles)
  })
  membersById.value = map
  activeGroupRole.value = myRole
}

function memberNameById(uid){
  const p = membersById.value.get(uid)
  return p?.name || "User"
}

function memberAvatarById(uid){
  const p = membersById.value.get(uid)
  return p?.avatar_url || ""
}

function memberInitialById(uid){
  const p = membersById.value.get(uid)
  if(p?.name) return p.name[0]
  if(p?.username) return p.username[0]
  return "?"
}

const isGroupOwner = computed(() => activeGroupRole.value === "owner")

function unreadFor(chatKey){
  return getUnreadCount(chatKey)
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

.new-group-btn{
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  transition: 0.2s;
  font-size: 18px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.9;
}
.new-group-btn:hover{
  background: rgba(255,255,255,0.10);
  transform: translateY(-1px);
}

.badge{
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  background: rgba(239,68,68,0.95);
  color: white;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255,255,255,0.18);
}

.divider{
  height: 1px;
  background: rgba(255,255,255,0.10);
  margin: 10px 4px;
}

.modal-backdrop{
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 18px;
}
.modal{
  width: 100%;
  max-width: 520px;
  border-radius: 18px;
  border: 1px solid rgba(255,255,255,0.14);
  overflow: hidden;
}
.modal-header{
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.10);
}
.modal-body{
  padding: 14px 16px;
}
.modal-footer{
  padding: 14px 16px;
  border-top: 1px solid rgba(255,255,255,0.10);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.icon-btn{
  width: 34px;
  height: 34px;
  border-radius: 12px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  transition: 0.2s;
}
.icon-btn:hover{ background: rgba(255,255,255,0.10); }
.btn-secondary{
  padding: 8px 14px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.14);
  background: rgba(255,255,255,0.06);
  transition: 0.2s;
}
.btn-secondary:hover{ background: rgba(255,255,255,0.10); }
.btn-secondary:disabled{ opacity: 0.5; cursor: not-allowed; }

.selected-row{
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}
.chip{
  padding: 7px 10px;
  border-radius: 999px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  font-size: 12px;
  display: inline-flex;
  gap: 8px;
  align-items: center;
  cursor: pointer;
}
.chip:hover{ background: rgba(255,255,255,0.11); }

/* Message bubble word-breaking for iOS */
.message-bubble {
  max-width: 85%;
  word-break: break-word;
  overflow-wrap: break-word;
  -webkit-word-break: break-word;
  -webkit-word-wrap: break-word;
}

.message-text {
  word-break: break-word;
  overflow-wrap: break-word;
  -webkit-word-break: break-word;
  -webkit-word-wrap: break-word;
  display: block;
  min-width: 0;
}

.system-chip{
  max-width: 80%;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  opacity: 0.8;
  background: rgba(15,23,42,0.7);
  border: 1px solid rgba(255,255,255,0.12);
  color: rgba(255,255,255,0.75);
  text-align: center;
}

@media (max-width: 768px) {
  .message-bubble {
    max-width: 80%;
  }
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

