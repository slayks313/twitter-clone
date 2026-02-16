<script setup>
import { onMounted } from "vue"
import { useRouter } from "vue-router"
import { supabase } from "./lib/supabase"

const router = useRouter()

onMounted(async () => {
  const { data } = await supabase.auth.getSession()

  if(!data.session){
    router.push("/login")
  }
})
</script>

<template>
  <router-view />
</template>
