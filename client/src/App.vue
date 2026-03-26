<script setup>
import { onMounted, onUnmounted, watch } from "vue"
import { useRouter } from "vue-router"
import { supabase } from "./lib/supabase"
import { initPresence } from "./composables/usePresence"
import { themes } from "./themes"
import { useAuth } from "./composables/useAuth"
import UpdateModal from './components/UpdateModal.vue';

const router = useRouter()

// =======================
// AUTH STATE LISTENER (2)
// =======================
const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
  if (!session) return

  if (event === "SIGNED_IN") {
    const userId = session.user.id

    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single()

    if (!data) {
      router.replace("/setup-profile")
    } else {
      router.replace("/feed")
    }
  }
})

// =======================
// THEME LOAD
// =======================
onMounted(() => {
  const savedThemeName = localStorage.getItem("user-theme")
  const theme = themes[savedThemeName]

  if (theme) {
    Object.entries(theme.vars).forEach(([k, v]) => {
      document.documentElement.style.setProperty(k, v)
    })

    if (savedThemeName === "light") {
      document.documentElement.classList.add("theme-light")
    } else {
      document.documentElement.classList.remove("theme-light")
    }
  }
})

// =======================
// PRESENCE
// =======================
onMounted(() => {
  initPresence()
})

// =======================
// AUTH COMPOSABLE
// =======================
const { user, ready } = useAuth()

watch([user, ready], ([newUser, isReady]) => {
  if (!isReady) return

  const path = router.currentRoute.value.path

  if (!newUser && path !== "/login" && path !== "/register") {
    router.replace("/login")
  }

  if (newUser && (path === "/login" || path === "/register")) {
    router.replace("/feed")
  }
})

// =======================
// TAB VISIBILITY FIX
// =======================
function handleVisibilityChange() {
  if (document.visibilityState === "hidden") {
    sessionStorage.setItem("lastRoute", window.location.pathname)
  }

  if (document.visibilityState === "visible") {
    window.location.reload()
  }
}

document.addEventListener("visibilitychange", handleVisibilityChange)

// =======================
// RESTORE ROUTE
// =======================
onMounted(() => {
  const lastRoute = sessionStorage.getItem("lastRoute")

  if (lastRoute) {
    router.replace(lastRoute)
    sessionStorage.removeItem("lastRoute")
  }
})

// =======================
// CLEANUP
// =======================
onUnmounted(() => {
  authListener.subscription.unsubscribe()
  document.removeEventListener("visibilitychange", handleVisibilityChange)
})
</script>

<template>
  <router-view />
  <UpdateModal />
</template>