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

    <!-- Модальное окно для успеха -->
    <div v-if="showSuccessModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="closeSuccessModal">
      <div class="glass p-6 max-w-sm w-full space-y-4 animate-fade-in">
        <div class="flex items-center gap-3 text-green-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="text-lg font-semibold">Успешно</h3>
        </div>
        <p class="text-sm opacity-80">Аккаунт создан! Проверьте почту для подтверждения.</p>
        <button 
          class="btn-glow w-full py-2 rounded-xl mt-2" 
          @click="handleSuccess"
        >
          Продолжить
        </button>
      </div>
    </div>

    <div class="glass p-6 sm:p-8 w-full sm:w-80 space-y-4">
      <h2 class="text-xl font-bold">Create account</h2>

      <div class="space-y-2">
        <input 
          v-model="email" 
          placeholder="Email" 
          class="input" 
          :class="{ 'border-red-500/50': emailError }"
          @input="emailError = false"
          @keyup.enter="register"
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
          @keyup.enter="register"
        />
        <p v-if="passwordError" class="text-xs text-red-400">Пароль обязателен</p>
        <p v-if="password && password.length < 6" class="text-xs text-yellow-400">
          Пароль должен содержать минимум 6 символов
        </p>
      </div>

      <div class="space-y-2">
        <input 
          v-model="confirmPassword" 
          type="password" 
          placeholder="Confirm Password" 
          class="input"
          :class="{ 'border-red-500/50': confirmPasswordError }" 
          @input="confirmPasswordError = false"
          @keyup.enter="register"
        />
        <p v-if="confirmPasswordError" class="text-xs text-red-400">Пароли не совпадают</p>
      </div>

      <button 
        class="btn-glow w-full py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all" 
        @click="register" 
        :disabled="isLoading"
      >
        <span v-if="isLoading" class="flex items-center justify-center gap-2">
          <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Загрузка...
        </span>
        <span v-else>Register</span>
      </button>

      <router-link to="/login" class="text-sm opacity-60 block text-center hover:opacity-100 transition-opacity">
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
const confirmPassword = ref("")
const router = useRouter()
const isLoading = ref(false)

// Состояния для валидации
const emailError = ref(false)
const passwordError = ref(false)
const confirmPasswordError = ref(false)

// Состояния для модальных окон
const showErrorModal = ref(false)
const showSuccessModal = ref(false)
const errorMessage = ref("")

function closeErrorModal() {
  showErrorModal.value = false
  errorMessage.value = ""
}

function closeSuccessModal() {
  showSuccessModal.value = false
}

function handleSuccess() {
  closeSuccessModal()
  router.push("/setup-profile")
}

function showError(message) {
  errorMessage.value = message
  showErrorModal.value = true
}

async function register() {
  // Валидация
  emailError.value = !email.value
  passwordError.value = !password.value
  confirmPasswordError.value = password.value !== confirmPassword.value

  if (emailError.value) {
    return showError("Введите email")
  }

  if (passwordError.value) {
    return showError("Введите пароль")
  }

  if (password.value.length < 6) {
    return showError("Пароль должен содержать минимум 6 символов")
  }

  if (confirmPasswordError.value) {
    return showError("Пароли не совпадают")
  }

  isLoading.value = true

  const { data, error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
    options: {
      emailRedirectTo: window.location.origin
    }
  })

  isLoading.value = false

  if (error) {
    if (error.message.includes("User already registered")) {
      showError("Пользователь с таким email уже существует")
    } else {
      showError(error.message)
    }
    return
  }

router.push("/setup-profile")
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