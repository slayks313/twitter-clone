<template>
  <div class="max-w-2xl mx-auto p-6   transition-all duration-500"
     >
    
    <h1 class="text-3xl font-extrabold mb-8 tracking-tight">Редактировать профиль</h1>

    <div class="space-y-8">
      
      <div class="group relative">
        <label class="text-sm font-medium opacity-60 mb-3 block">Баннер профиля</label>
        <div 
          class="h-44 rounded-2xl overflow-hidden border-2 border-dashed border-white/10 relative cursor-pointer hover:border-blue-500/50 transition-colors"
          :style="bannerPreview"
          @click="$refs.bannerInput.click()"
        >
          <div class="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all flex items-center justify-center">
            <span class="text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Сменить баннер</span>
          </div>
        </div>
        <input type="file" ref="bannerInput" class="hidden" @change="uploadBanner" />
      </div>

      <div class="flex items-center gap-6">
        <div class="relative group cursor-pointer" @click="$refs.avatarInput.click()">
          <div class="w-24 h-24 rounded-full overflow-hidden ring-4 ring-white/10 group-hover:ring-blue-500/50 transition-all">
            <img v-if="avatarUrl" :src="avatarUrl" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-2xl uppercase">
              {{ name?.charAt(0) }}
            </div>
          </div>
          <div class="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            </svg>
          </div>
        </div>
        <div>
          <h3 class="font-bold text-lg">Ваш аватар</h3>
          <p class="text-sm opacity-50">Рекомендуется 400x400px</p>
        </div>
        <input type="file" ref="avatarInput" class="hidden" @change="uploadAvatar" />
      </div>

      <div class="grid gap-6">
        <div class="space-y-2">
          <label class="text-sm font-medium opacity-60">Отображаемое имя</label>
          <input v-model="name" class="glass-input" placeholder="Введите имя..." />
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium opacity-60">О себе (Bio)</label>
          <textarea v-model="bio" rows="3" class="glass-input resize-none" placeholder="Расскажите о себе..." />
        </div>
      </div>

      <div class="pt-4 border-t border-white/5">
        <label class="text-sm font-medium opacity-60 mb-4 block">Тема оформления</label>
        <ThemeSwitcher />
      </div>

      <div class="action-buttons flex items-center justify-between pt-6 flex-wrap gap-4">
        <button class="btn-exit opacity-70 hover:opacity-100 transition-all font-medium" @click="logout">
          Выйти из аккаунта
        </button>
        
        <button class="save-button px-10 py-3 rounded-2xl font-bold text-white shadow-xl hover:scale-105 active:scale-95 transition-all" @click="save">
          Сохранить изменения
        </button>
      </div>
    </div>
  </div>
</template>
<script setup>

import { ref, onMounted, computed, watch, onUnmounted } from "vue"

import { supabase } from "../lib/supabase"

import { useRouter } from "vue-router"

import ThemeSwitcher from "../components/ThemeSwitcher.vue"

import { useAuth } from "../composables/useAuth"



const name = ref("")

const username = ref("")

const bio = ref("")

const avatarUrl = ref(null)

const bannerUrl = ref(null)



const router = useRouter()
const emit = defineEmits(["toggleMobileNav"])







const { user } = useAuth()



const userId = computed(() => user.value?.id)



watch(userId, async (id) => {

  if (!id) return



  const { data: profile } = await supabase

    .from("profiles")

    .select("*")

    .eq("id", id)

    .single()



  if (profile) {

    name.value = profile.name

    username.value = profile.username

    bio.value = profile.bio

    avatarUrl.value = profile.avatar_url

    bannerUrl.value = profile.banner_url

  }

}, { immediate: true })

async function logout(){

  await supabase.auth.signOut()

  router.push("/login")

}



const bannerPreview = computed(() => {

  if(bannerUrl.value){

    return {

      backgroundImage: `url(${bannerUrl.value})`,

      backgroundSize: "cover",

      backgroundPosition: "center"

    }

  }



  return {

    background: "linear-gradient(135deg,#2563eb,#9333ea)"

  }

})



async function uploadAvatar(e){

  const file = e.target.files[0]

  if(!file) return



  const filePath = `${userId.value}/avatar-${Date.now()}.png`



  const { error } = await supabase.storage

    .from("avatars")

    .upload(filePath, file, { upsert:true })



  if(error) return alert(error.message)



  const { data } = supabase.storage

    .from("avatars")

    .getPublicUrl(filePath)



  avatarUrl.value = data.publicUrl

}



async function uploadBanner(e){

  const file = e.target.files[0]

  if(!file) return



  const filePath = `${userId.value}/banner-${Date.now()}.png`



  const { error } = await supabase.storage

    .from("banners")

    .upload(filePath, file, { upsert:true })



  if(error) return alert(error.message)



  const { data } = supabase.storage

    .from("banners")

    .getPublicUrl(filePath)



  bannerUrl.value = data.publicUrl

}



async function save(){



  if (!userId.value) return



  const { error } = await supabase

    .from("profiles")

    .update({

      name: name.value,

      username: username.value,

      bio: bio.value,

      avatar_url: avatarUrl.value,

      banner_url: bannerUrl.value

    })

    .eq("id", userId.value)



  if(error) return alert(error.message)



  alert("Профиль обновлён")

}

</script>

<style scoped>
/* Эффект стеклянного инпута */
.glass-input {
  @apply w-full px-4 py-3 rounded-2xl outline-none transition-all border;
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.08);
  color: var(--text);
}

.glass-input:focus {
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.1);
}



/* Анимация появления */
.max-w-2xl {
  animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}


/* Кнопка "Сохранить" — сочная, но без грязных теней */
.save-button {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.save-button:hover {
  filter: brightness(1.1);
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); /* Мягкое свечение вместо тени */
}

/* Кнопка "Logout" — минимализм */
.btn-exit {
  background: rgba(239, 68, 68, 0.399);
  border-color: rgba(239, 68, 68, 0.4);
  border: 1px solid var(--border);
  color: #ef4444;
  padding: 12px 24px;
  border-radius: 16px;
  transition: all 0.3s ease;
}

.btn-exit:hover {
  background: rgba(239, 68, 68, 0.08);
  border-color: rgba(239, 68, 68, 0.4);
}

@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  .action-buttons > button {
    width: 100%;
  }
}
</style>