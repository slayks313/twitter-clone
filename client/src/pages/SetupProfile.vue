<template>
  <div class="min-h-screen flex items-center justify-center">

    <div class="glass p-8 w-[450px] space-y-4">

      <h2 class="text-xl font-bold">Настрой профиль</h2>

      <!-- Имя -->
      <div>
        <label class="block mb-1">Имя</label>
        <input
          v-model="name"
          placeholder="Твоё имя"
          class="input"
        />
      </div>

      <!-- Username -->
      <div>
        <label class="block mb-1">Username (@handle)</label>
        <input
          v-model="username"
          placeholder="username"
          class="input"
        />
      </div>

      <!-- Bio -->
      <div>
        <label class="block mb-1">Bio</label>
        <textarea
          v-model="bio"
          placeholder="О себе"
          class="input"
        />
      </div>

      <!-- Аватар -->
      <div>
        <label class="block mb-1">Аватар</label>
        <input type="file" @change="uploadAvatar" />
      </div>

      <!-- Баннер -->
      <div>
        <label class="block mb-1">Баннер</label>
        <input type="file" @change="uploadBanner" />
      </div>

      <button
        class="btn-glow w-full py-2 rounded-xl"
        @click="saveProfile"
      >
        Сохранить
      </button>

    </div>

  </div>
</template>

<script setup>
import { ref } from "vue"
import { supabase } from "../lib/supabase"
import { useRouter } from "vue-router"

const router = useRouter()

const name = ref("")
const username = ref("")
const bio = ref("")
const avatarUrl = ref(null)
const bannerUrl = ref(null)

async function uploadAvatar(e){
  const file = e.target.files[0]
  if(!file) return

  const { data } = await supabase.auth.getUser()
  const filePath = `${data.user.id}/avatar-${Date.now()}.png`

  await supabase.storage
    .from("avatars")
    .upload(filePath, file, { upsert:true })

  const { data: urlData } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath)

  avatarUrl.value = urlData.publicUrl
}

async function uploadBanner(e){
  const file = e.target.files[0]
  if(!file) return

  const { data } = await supabase.auth.getUser()
  const filePath = `${data.user.id}/banner-${Date.now()}.png`

  await supabase.storage
    .from("banners")
    .upload(filePath, file, { upsert:true })

  const { data: urlData } = supabase.storage
    .from("banners")
    .getPublicUrl(filePath)

  bannerUrl.value = urlData.publicUrl
}

async function saveProfile(){

  if(!username.value.trim()){
    return alert("Username обязателен")
  }

  const { data } = await supabase.auth.getUser()

  const { error } = await supabase
    .from("profiles")
    .update({
      name: name.value,
      username: username.value,
      bio: bio.value,
      avatar_url: avatarUrl.value,
      banner_url: bannerUrl.value
    })
    .eq("id", data.user.id)

  if(error) return alert(error.message)

  router.push("/")
}
</script>

<style>
.input{
  @apply w-full p-2 rounded bg-white/10 outline-none;
}
</style>
