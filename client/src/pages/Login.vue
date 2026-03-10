<template>
  <div class="min-h-dvh flex items-center justify-center p-4">

    <!-- Модальное окно для ошибок -->
    <div v-if="showErrorModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="closeErrorModal">
      <div class="glass p-6 max-w-sm w-full space-y-4 animate-fade-in">
        <div class="flex items-center gap-3 text-red-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="text-lg font-semibold">Ошибка</h3>
        </div>
        <p class="text-sm opacity-80">{{ errorMessage }}</p>
        <button 
          class="btn-glow w-full py-2 rounded-xl mt-2" 
          @click="closeErrorModal"
        >
          Понятно
        </button>
      </div>
    </div>

    <div class="glass p-6 sm:p-8 w-full sm:w-80 space-y-4">
      <h2 class="text-xl font-bold">Auth</h2>

      <div class="space-y-2">
        <input 
          v-model="email" 
          placeholder="Email" 
          class="input" 
          :class="{ 'border-red-500/50': emailError }"
          @input="emailError = false"
          @keyup.enter="login"
        />
        <p v-if="emailError" class="text-xs text-red-400">Email обязателен</p>
      </div>

      <div class="space-y-2">
        <input 
          v-model="password" 
          type="password" 
          placeholder="Password" 
          class="input"
          :class="{ 'border-red-500/50': passwordError }" 
          @input="passwordError = false"
          @keyup.enter="login"
        />
        <p v-if="passwordError" class="text-xs text-red-400">Пароль обязателен</p>
      </div>

      <button 
        class="btn-glow w-full py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all" 
        @click="login" 
        :disabled="isLoading"
      >
        <span v-if="isLoading" class="flex items-center justify-center gap-2">
          <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Загрузка...
        </span>
        <span v-else>Login</span>
      </button>
      <button
  class="w-full py-2 rounded-xl border border-white/20 flex items-center justify-center gap-2 hover:bg-white/5 transition"
  @click="loginWithGoogle"
>
  <img src="https://www.svgrepo.com/show/475656/google-color.svg" class="w-5 h-5" />
  Continue with Google
</button>

      <router-link to="/register" class="text-sm opacity-60 block text-center hover:opacity-100 transition-opacity">
        Нет аккаунта? Регистрация
      </router-link>
      
      <!-- ссылка на apk-архив для незалогиненных пользователей -->
      <div class="text-center mt-4">
        <a href="/app.zip" download class="text-sm underline opacity-70 hover:opacity-100">Скачать мобильное приложение</a>
      </div>
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

// Состояния для ошибок валидации
const emailError = ref(false)
const passwordError = ref(false)

// Состояния для модального окна ошибок
const showErrorModal = ref(false)
const errorMessage = ref("")

import { useAuth } from "../composables/useAuth"

const { user } = useAuth()

watch(user, (newUser) => {
  if (newUser) {
    router.push("/")
  }
})

function closeErrorModal() {
  showErrorModal.value = false
  errorMessage.value = ""
}

function showError(message) {
  errorMessage.value = message
  showErrorModal.value = true
}
async function loginWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
  provider: "google",
  options: {
    redirectTo: "https://social-network-ten-theta.vercel.app"
  }
})

  if (error) {
    showError(error.message)
  }
}
async function login() {
  // Валидация полей
  emailError.value = !email.value
  passwordError.value = !password.value

  if (emailError.value || passwordError.value) {
    return showError("Пожалуйста заполните все поля")
  }

  isLoading.value = true

  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  })

  isLoading.value = false

  if (error) {
    // Обработка разных типов ошибок
    if (error.message.includes("Invalid login credentials")) {
      showError("Неверный email или пароль")
    } else if (error.message.includes("Email not confirmed")) {
      showError("Email не подтвержден. Проверьте почту")
    } else {
      showError(error.message)
    }
  }
}
</script>

<style scoped>
.input {
  @apply w-full p-2 rounded bg-white/10 outline-none border border-transparent focus:border-white/30 transition-all;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}
</style>