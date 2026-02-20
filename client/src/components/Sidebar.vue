<template>
  <aside class="sidebar sticky top-6 h-fit flex flex-col gap-4">

    <!-- Аватар -->
    <div class="avatar-wrap">
      <img
        v-if="avatarUrl"
        :src="avatarUrl"
        class="avatar-img"
        alt="avatar"
      />
      <div v-else class="avatar-placeholder">
        <fa icon="user" />
      </div>
    </div>

    <!-- Навигация -->
    <nav class="nav-block glass">
      <router-link class="nav" to="/">
        <fa icon="house" />
        <span>home</span>
      </router-link>

      <router-link
        v-if="userId"
        :to="'/profile/' + userId"
        class="nav"
      >
        <fa icon="user" />
        <span>profile</span>
      </router-link>

      <router-link class="nav" to="/chat">
        <fa icon="comment" />
        <span>chat</span>
      </router-link>
    </nav>

  </aside>
</template>

<script setup>
import { supabase } from "../lib/supabase"
import { ref, onMounted } from "vue"

const userId = ref("")
const avatarUrl = ref("")

onMounted(async () => {
  const { data } = await supabase.auth.getUser()
  userId.value = data.user?.id

  if (userId.value) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", userId.value)
      .single()

    avatarUrl.value = profile?.avatar_url || ""
  }
})
</script>

<style scoped>
.sidebar {
  width: 180px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ——— Аватар ——— */
.avatar-wrap {
  display: flex;
  justify-content: center;
}

.avatar-img,
.avatar-placeholder {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 20px var(--glow);
}

.avatar-placeholder {
  background: var(--card);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: var(--text);
  opacity: 0.5;
}

/* ——— Nav блок ——— */
.nav-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 12px;
}

/* ——— Ссылки ——— */
.nav {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
  opacity: 0.65;
  transition: 0.2s;
  text-decoration: none;
  letter-spacing: 0.01em;
}

.nav:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.07);
  transform: translateX(4px);
}

/* активная ссылка */
.nav.router-link-exact-active {
  opacity: 1;
  background: rgba(255, 255, 255, 0.1);
}

/* ——— Светлая тема ——— */
@media (prefers-color-scheme: light) {
  .nav:hover {
    background: rgba(0, 0, 0, 0.05);
  }
  .nav.router-link-exact-active {
    background: rgba(0, 0, 0, 0.07);
  }
}
</style>