<template>
  <div class="max-w-2xl mx-auto space-y-6">

    <h1 class="text-2xl font-bold">Редактировать профиль</h1>

    <!-- Баннер -->
    <div>
      <label class="block mb-2">Баннер</label>

      <div class="h-40 rounded-xl overflow-hidden mb-2"
           :style="bannerPreview">
      </div>

      <input type="file" @change="uploadBanner" />
    </div>

    <!-- Аватар -->
    <div>
      <label class="block mb-2">Аватар</label>

      <div class="w-24 h-24 rounded-full overflow-hidden mb-2">
        <img
          v-if="avatarUrl"
          :src="avatarUrl"
          class="w-full h-full object-cover"
        />
      </div>

      <input type="file" @change="uploadAvatar" />
    </div>

    <!-- Имя -->
    <div>
      <label class="block mb-1">Имя</label>
      <input v-model="name" class="input" />
    </div>



    <!-- Bio -->
    <div>
      <label class="block mb-1">Bio</label>
      <textarea v-model="bio" class="input" />
    </div>
    <ThemeSwitcher />
     



    <button class="btn-glow px-6 py-2 rounded-xl" @click="save">
      Сохранить
    </button>
    <button class="btn-exit ml-4 px-6 py-2 rounded-xl" @click="logout">
  Logout
</button>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue"
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

<style>
.input{
  @apply w-full p-2 rounded bg-white/10 outline-none;
}
</style>
