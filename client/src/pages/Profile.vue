<template>
  <div v-if="profile" class="max-w-2xl mx-auto pb-10">
    <div class="h-48 w-full rounded-xl overflow-hidden relative" :style="bannerStyle"></div>

    <div class="px-6 relative z-10">
      <div class="relative -mt-14">
        <div class="w-28 h-28 rounded-full border-4 border-black overflow-hidden bg-gray-700 shadow-xl">
          <img v-if="profile.avatar_url" :src="profile.avatar_url" class="w-full h-full object-cover" />
        </div>

        <div class="mt-4">
        <h2 
  class="text-2xl font-bold transition-all" 
  :class="{ 'owner-gradient-text': profile.username === 'hello' }"
>
  {{ profile.name }}
</h2>
          <p class="opacity-60">@{{ profile.username }}</p>
          
          <div class="flex items-center gap-6 mt-3">
            <div class="text-sm opacity-70"><span class="font-bold">{{ followersCount }}</span> Followers</div>
            <div class="text-sm opacity-70"><span class="font-bold">{{ followingCount }}</span> Following</div>
            <button v-if="currentUserId !== profile.id" @click="toggleFollow" class="px-4 py-1 rounded-xl transition" :class="isFollowing ? 'bg-white/10' : 'btn-glow'">
              {{ isFollowing ? "Following" : "Follow" }}
            </button>
          </div>
          <p class="mt-3 opacity-60">{{ profile.bio || "No bio yet" }}</p>
        </div>
      </div>
    </div>

   <div class="mt-8 space-y-6">
  
  <div v-if="loadingPosts" class="space-y-6"> 
    <div v-for="n in 3" :key="n" class="glass p-5 animate-pulse">
      <div class="h-4 bg-gray-700 rounded w-1/3 mb-4"></div>
      <div class="h-4 bg-gray-700 rounded mb-2"></div>
      <div class="h-4 bg-gray-700 rounded w-2/3"></div>
    </div>
  </div>

  <div v-else-if="userPosts.length === 0" class="px-6 opacity-50 text-sm">
    No posts yet
  </div>

  <TweetCard
    v-for="post in userPosts"
    :key="post.id"
    :post="post"
    :currentUserId="currentUserId"
    :followingSet="new Set()"
    :likedPostsSet="new Set()"
    :updateFollowing="() => {}"
  />
</div>
  </div>
  <canvas ref="sparkCanvas" class="spark-canvas"></canvas>
</template>

<script setup>
import { supabase } from "../lib/supabase"
import { useRoute } from "vue-router"
import TweetCard from "../components/TweetCard.vue"
import { ref, onMounted, onUnmounted, computed, watch } from "vue" // Добавлен onUnmounted

const userPosts = ref([])
const loadingPosts = ref(true)


const emit = defineEmits(['toggleMobileNav'])
const sparkCanvas = ref(null)

let createSpark
let resize

onMounted(() => {
  const canvas = sparkCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext("2d")
  let sparks = []

  resize = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }

  resize()
  window.addEventListener("resize", resize)

  createSpark = (e) => {
    if (profile.value?.username !== "hello") return

    sparks.push({
      x: e.clientX,
      y: e.clientY,
      size: Math.random() * 4 + 2,
      life: 1
    })
  }

  window.addEventListener("mousemove", createSpark)

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    sparks = sparks.filter(s => {
      s.life -= 0.02
      s.y += 1

      ctx.beginPath()
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255,255,255,${s.life})`
      ctx.fill()

      return s.life > 0
    })

    requestAnimationFrame(animate)
  }

  animate()
})

onUnmounted(() => {
  if (createSpark) window.removeEventListener("mousemove", createSpark)
  if (resize) window.removeEventListener("resize", resize)
})


async function loadUserPosts(){

  if(!profile.value) return

  loadingPosts.value = true

  const { data, error } = await supabase
    .rpc("get_ranked_posts", {
      p_user: currentUserId.value,
      p_limit: 50,
      p_offset: 0
    })

  if(!error && data){
    // фильтруем только посты владельца профиля
    userPosts.value = data.filter(
      post => post.user_id === profile.value.id
    )
  }

  loadingPosts.value = false
}

const route = useRoute()

const profile = ref(null)
const isFollowing = ref(false)
const followersCount = ref(0)
const followingCount = ref(0)
const currentUserId = ref(null)

async function loadProfile(){

  const param = route.params.id

  const { data: userData } = await supabase.auth.getUser()
  currentUserId.value = userData.user?.id

  let query = supabase.from("profiles").select("*")

  // если похоже на uuid → ищем по id
  if(param.includes("-")){
    query = query.eq("id", param)
  } else {
    query = query.eq("username", param)
  }

  const { data, error } = await query.single()

  if(error || !data){
    console.error(error)
    return
  }

  profile.value = data

  // пересчёт подписчиков
const { data: stats } = await supabase.rpc("get_profile_stats", {
  p_user: profile.value.id
})

followersCount.value = stats?.followers || 0
followingCount.value = stats?.following || 0

  if(currentUserId.value && currentUserId.value !== profile.value.id){
    const { data: existing } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", currentUserId.value)
      .eq("following_id", profile.value.id)

    isFollowing.value = existing?.length > 0
  }
 
  await loadUserPosts()
}
 // Функция для создания искр


// Включаем слежку за мышью





async function toggleFollow(){

  if(!currentUserId.value || currentUserId.value === profile.value.id) return

  if(isFollowing.value){

    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", currentUserId.value)
      .eq("following_id", profile.value.id)

    if(!error){
      isFollowing.value = false
      followersCount.value--
    }

  } else {

    const { error } = await supabase
      .from("follows")
      .insert({
        follower_id: currentUserId.value,
        following_id: profile.value.id
      })

    if(!error){
      isFollowing.value = true
      followersCount.value++
    }
  }
}


const bannerStyle = computed(() => {

  if(profile.value?.banner_url){
    return {
      backgroundImage: `url(${profile.value.banner_url})`,
      backgroundSize: "cover",
      backgroundPosition: "center"
    }
  }

  return {
    background: "linear-gradient(135deg,#2563eb,#9333ea)"
  }
})

watch(
  () => route.params.id,
  () => loadProfile(),
  { immediate: true }
)
</script>


