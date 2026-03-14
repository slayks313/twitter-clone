import { reactive, computed, watch } from "vue"
import { supabase } from "../lib/supabase"
import { useAuth } from "./useAuth"

const { user } = useAuth()

const unreadCounts = reactive({})

const totalUnread = computed(() =>
  Object.values(unreadCounts).reduce((a, b) => a + b, 0)
)

function getUnreadCount(chatKey){
  return unreadCounts[chatKey] || 0
}

function updateLastRead(chatKey) {

  if (!user.value || !chatKey) return

  const key = `lastRead_${user.value.id}_${chatKey}`

  localStorage.setItem(key, new Date().toISOString())

  unreadCounts[chatKey] = 0

}

async function loadUnreadCounts(){

  if (!user.value) return

  const uid = user.value.id

  const [{ data: convs }, { data: memberships }] = await Promise.all([
    supabase
      .from("conversations")
      .select("id")
      .or(`user1.eq.${uid},user2.eq.${uid}`),
    supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", uid)
  ])

  const directIds = (convs || []).map((c) => c.id)
  const groupIds = (memberships || []).map((m) => m.group_id)

  const requests = [
    ...directIds.map(async (conversationId) => {
      const chatKey = `direct:${conversationId}`
      const lastRead = localStorage.getItem(`lastRead_${uid}_${chatKey}`) || "1970-01-01T00:00:00Z"

      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("conversation_id", conversationId)
        .gt("created_at", lastRead)
        .neq("sender_id", uid)

      unreadCounts[chatKey] = count || 0
    }),
    ...groupIds.map(async (groupId) => {
      const chatKey = `group:${groupId}`
      const lastRead = localStorage.getItem(`lastRead_${uid}_${chatKey}`) || "1970-01-01T00:00:00Z"

      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("group_id", groupId)
        .gt("created_at", lastRead)
        .neq("sender_id", uid)

      unreadCounts[chatKey] = count || 0
    })
  ]

  await Promise.all(requests)

}

watch(
  user,
  (newUser) => {

    if (newUser) {
      loadUnreadCounts()
    } else {
      Object.keys(unreadCounts).forEach((key) => delete unreadCounts[key])
    }

  },
  { immediate: true }
)

export function useUnreadMessages(){
  return { totalUnread, getUnreadCount, updateLastRead, reloadUnreadCounts: loadUnreadCounts }
}