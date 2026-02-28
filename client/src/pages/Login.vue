<template>
  <div class="min-h-dvh flex items-center justify-center p-4">

    <div class="glass p-6 sm:p-8 w-full sm:w-80 space-y-4">

      <h2 class="text-xl font-bold">Auth</h2>

      <input v-model="email" placeholder="Email" class="input"/>
      <input v-model="password" type="password" placeholder="Password" class="input"/>

      <button class="btn-glow w-full py-2 rounded-xl disabled:opacity-50" @click="login" :disabled="isLoading">
        {{ isLoading ? 'Загрузка...' : 'Login' }}
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
import { watch } from "vue"

const email = ref("")
const password = ref("")
const router = useRouter()
const isLoading = ref(false)

import { useAuth } from "../composables/useAuth"

const { user } = useAuth()

watch(user, (newUser) => {
  if (newUser) {
    router.push("/")
  }
})

async function login(){
  if (!email.value || !password.value) {
    return alert("Пожалуйста заполните все поля")
  }

  isLoading.value = true

  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  })

  isLoading.value = false

  if (error) return alert(error.message)
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
