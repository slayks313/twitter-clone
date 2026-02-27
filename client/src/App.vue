<script setup>
import { onMounted } from "vue"
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

onMounted(async () => {
  const { user } = useAuth()

  if(!user.value){
    router.push("/login")
  }
})
</script>

<template>
  <router-view />
</template>
