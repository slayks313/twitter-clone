<template>
  <aside class="glass w-64 p-6 sticky top-6 h-fit">

    <!-- <h1 class="text-2xl font-bold mb-8 tracking-widest">
      ⚡ NEXUS
    </h1> -->

    <nav class="flex flex-col gap-3">

     <router-link class="nav" to="/">
  <fa icon="house" />
  Feed
</router-link>

<router-link
  v-if="userId"
  :to="'/profile/' + userId"
  class="nav"
>
  <fa icon="user" />
  Profile
</router-link>

<router-link class="nav" to="/chat">
  <fa icon="comment" />
  Chat
</router-link>


<router-link class="nav" to="/settings">
  <fa icon="gear" />
  Settings
</router-link>



    </nav>




  </aside>
</template>
<script setup>
import { supabase } from "../lib/supabase"
import { useRouter } from "vue-router"
import { ref, onMounted } from "vue"


const userId = ref("")

onMounted(async () => {
  const { data } = await supabase.auth.getUser()
  userId.value = data.user.id
})


const router = useRouter()

async function logout(){
  await supabase.auth.signOut()
  router.push("/login")
}


</script>

<style scoped>
.nav{
  display:flex;
  align-items:center;
  gap:12px;
  padding:12px;
  border-radius:14px;
  transition:.25s;
}
.nav:hover{
  background: rgba(255,255,255,0.08);
  transform: translateX(6px);
}

</style>
