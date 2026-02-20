<template>
  <aside class="right-panel sticky top-6 h-fit flex flex-col gap-4 items-center">

    <!-- Кнопка настроек (три полоски) -->
    <router-link to="/settings" class="settings-btn">
      <fa icon="bars" />
    </router-link>

    <!-- Вертикальная планка с подписками -->
    <div class="followers-bar glass">
      <div
        v-for="user in followingUsers"
        :key="user.id"
        class="follower-item"
        :title="user.name || user.username"
      >
        <img
          v-if="user.avatar_url"
          :src="user.avatar_url"
          class="follower-avatar"
          alt="avatar"
        />
        <div v-else class="follower-avatar fallback">
          <fa icon="user" />
        </div>
        <span v-if="onlineUsers.has(user.id)" class="online-dot" />
      </div>

      <div v-if="followingUsers.length === 0" class="empty-hint">
        <fa icon="user-group" />
      </div>
    </div>

  </aside>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { supabase } from "../lib/supabase"
import { getOnlineUsers } from "../composables/usePresence"

const onlineUsers = getOnlineUsers()

const followingUsers = ref([])

onMounted(async () => {
  const { data: auth } = await supabase.auth.getUser()
  const me = auth.user?.id
  if (!me) return

  const { data: follows } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", me)

  if (!follows?.length) return

  const ids = follows.map(f => f.following_id)

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, name, username, avatar_url")
    .in("id", ids)

  followingUsers.value = profiles || []
})
</script>

<style scoped>
.right-panel {
  width: 72px;
  flex-shrink: 0;
}

.settings-btn {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text);
  opacity: 0.55;
  font-size: 19px;
  text-decoration: none;
  transition: 0.2s;
}

.settings-btn:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.08);
}

.followers-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 18px 12px;
  width: 64px;
  border-radius: 32px;
}

.follower-item {
  position: relative;
  flex-shrink: 0;
}

.follower-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
  border: 1.5px solid rgba(255, 255, 255, 0.12);
  cursor: pointer;
  transition: 0.2s;
  display: block;
}

.follower-avatar:hover {
  transform: scale(1.08);
  border-color: var(--glow);
  box-shadow: 0 0 10px var(--glow);
}

.follower-avatar.fallback {
  background: var(--card);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  color: var(--text);
  opacity: 0.4;
}

.online-dot {
  position: absolute;
  bottom: 1px;
  right: 1px;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: #22c55e;
  border: 2px solid var(--bg-main);
}

.empty-hint {
  color: var(--text);
  opacity: 0.25;
  font-size: 18px;
  padding: 8px 0;
}
</style>