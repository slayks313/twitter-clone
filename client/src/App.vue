<script setup>
import { onMounted, onUnmounted, watch } from "vue"
import { useRouter } from "vue-router"
import { supabase } from "./lib/supabase"
import { initPresence } from "./composables/usePresence"
import { themes } from "./themes"
import { useAuth } from "./composables/useAuth"

const router = useRouter()

// =======================
// AUTH STATE LISTENER
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
    router.replace("/")
  }

})

// =======================
// TAB VISIBILITY FIX
// =======================

function handleVisibilityChange() {

  if (document.visibilityState === "visible") {
    supabase.auth.getSession()
  }

}

document.addEventListener("visibilitychange", handleVisibilityChange)

// =======================
// CLEANUP
// =======================

onUnmounted(() => {

  authListener.subscription.unsubscribe()

  document.removeEventListener(
    "visibilitychange",
    handleVisibilityChange
  )

})
</script>

<template>
  <router-view />
</template>