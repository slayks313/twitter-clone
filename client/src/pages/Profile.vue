<template>
  <div v-if="profile" class="pb-10">

<!-- БАННЕР -->
<div
  class="h-48 rounded-md w-full relative"
  :style="bannerStyle"
></div>

<!-- АВАТАР -->
<div class="relative px-6 -mt-16 z-10">
  <div class="w-28 h-28 rounded-full border-4 border-black overflow-hidden bg-gray-700 shadow-xl">
    <img
      v-if="profile.avatar_url"
      :src="profile.avatar_url"
      class="w-full h-full object-cover"
    />
  </div>

  <div class="mt-4">
    <h2 class="text-2xl font-bold">
  {{ profile.name }}
</h2>

<p class="opacity-60">
  @{{ profile.username }}
</p>
<div class="flex items-center gap-6 mt-3">

  <div class="text-sm opacity-70">
    <span class="font-bold">{{ followersCount }}</span> Followers
  </div>

  <div class="text-sm opacity-70">
    <span class="font-bold">{{ followingCount }}</span> Following
  </div>

  <button
    v-if="currentUserId !== profile.id"
    @click="toggleFollow"
    class="px-4 py-1 rounded-xl transition"
    :class="isFollowing ? 'bg-white/10' : 'btn-glow'"
  >
    {{ isFollowing ? "Following" : "Follow" }}
  </button>

</div>



    <p class="opacity-60">
      {{ profile.bio || "No bio yet" }}
    </p>
  </div>
</div>


  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue"
import { supabase } from "../lib/supabase"
import { useRoute } from "vue-router"

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
  const { count: followers } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", profile.value.id)

  followersCount.value = followers || 0

  const { count: following } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", profile.value.id)

  followingCount.value = following || 0

  if(currentUserId.value && currentUserId.value !== profile.value.id){
    const { data: existing } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", currentUserId.value)
      .eq("following_id", profile.value.id)

    isFollowing.value = existing?.length > 0
  }
}


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

onMounted(loadProfile)

// если меняется username в url
watch(() => route.params.id, loadProfile)
</script>


