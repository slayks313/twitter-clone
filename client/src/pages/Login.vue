<template>
  <div class="h-screen flex items-center justify-center">

    <div class="glass p-8 w-80 space-y-4">

      <h2 class="text-xl font-bold">Auth</h2>

      <input v-model="email" placeholder="Email" class="input"/>
      <input v-model="password" type="password" placeholder="Password" class="input"/>

      <button class="btn-glow w-full py-2 rounded-xl" @click="login">
        Login
      </button>

<router-link to="/register" class="text-sm opacity-60 block text-center">
  Нет аккаунта? Регистрация
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

async function login(){
  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  })

  if(error) return alert(error.message)

  router.push("/")
}

async function register(){
  const { error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value
  })

  if(error) return alert(error.message)

  alert("Account created")
}
</script>

<style>
.input{
  @apply w-full p-2 rounded bg-white/10 outline-none;
}
</style>
