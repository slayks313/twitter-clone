<template>
  <div class="h-screen flex items-center justify-center">

    <div class="glass p-8 w-80 space-y-4">

      <h2 class="text-xl font-bold">Create account</h2>

      <input v-model="email" placeholder="Email" class="input"/>
      <input v-model="password" type="password" placeholder="Password" class="input"/>

      <button class="btn-glow w-full py-2 rounded-xl" @click="register">
        Register
      </button>

      <router-link to="/login" class="text-sm opacity-60 block text-center">
        Уже есть аккаунт? Войти
      </router-link>

    </div>

  </div>
</template>

<script setup>
import { ref } from "vue"
import { supabase } from "../lib/supabase"
import { useRouter } from "vue-router"

const email = ref("")
const password = ref("")
const router = useRouter()

async function register(){
  const { data, error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value
  })

  if(error) return alert(error.message)

  const user = data.user

  if(user){
    await supabase.from("profiles").insert({
      id: user.id,
      username: "user_" + user.id.slice(0,6)
    })
  }

  alert("Аккаунт создан!")
  router.push("/setup-profile")
}

</script>

<style>
.input{
  @apply w-full p-2 rounded bg-white/10 outline-none;
}
</style>
