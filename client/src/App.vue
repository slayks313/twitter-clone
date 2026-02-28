<script setup>
import { onMounted, watch } from "vue"
import { useRouter } from "vue-router"
import { supabase } from "./lib/supabase"
import { initPresence } from "./composables/usePresence"
import { themes } from "./themes" 
import { useAuth } from "./composables/useAuth"


const router = useRouter()




onMounted(() => {
  const savedThemeName = localStorage.getItem("user-theme")
  const theme = themes[savedThemeName]
  
  if (theme) {
    Object.entries(theme.vars).forEach(([k, v]) => {
      document.documentElement.style.setProperty(k, v)
    })
  }
})



onMounted(() => {
  initPresence()
})

const { user, ready } = useAuth()

watch([user, ready], ([newUser, isReady]) => {
  if (!isReady) return
  
  if (!newUser && router.currentRoute.value.path !== "/login" && router.currentRoute.value.path !== "/register") {
    router.push("/login")
  } else if (newUser && (router.currentRoute.value.path === "/login" || router.currentRoute.value.path === "/register")) {
    router.push("/")
  }
})
</script>

<template>
  <router-view />
</template>
