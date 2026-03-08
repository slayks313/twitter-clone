import { reactive, computed, watch } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

const { user } = useAuth()

const unreadCounts = reactive({})

const totalUnread = computed(() => Object.values(unreadCounts).reduce((a, b) => a + b, 0))

function updateLastRead(conversationId) {
  if (!user.value || !conversationId) return
  const key = `lastRead_${user.value.id}_${conversationId}`
  localStorage.setItem(key, new Date().toISOString())
  unreadCounts[conversationId] = 0
}

async function loadUnreadCounts() {
  if (!user.value) return
  
  const { data: convs } = await supabase
    .from('conversations')
    .select('id')
    .or(`user1.eq.${user.value.id},user2.eq.${user.value.id}`)

  if (!convs) return

  for (const conv of convs) {
    const key = `lastRead_${user.value.id}_${conv.id}`
    const lastRead = localStorage.getItem(key) || '1970-01-01T00:00:00Z'
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conv.id)
      .gt('created_at', lastRead)
      .neq('sender_id', user.value.id)
    unreadCounts[conv.id] = count || 0
  }
}

watch(user, (newUser) => {
  if (newUser) {
    loadUnreadCounts()
  } else {
    Object.keys(unreadCounts).forEach(key => delete unreadCounts[key])
  }
}, { immediate: true })

export function useUnreadMessages() {
  return { totalUnread, updateLastRead }
}
