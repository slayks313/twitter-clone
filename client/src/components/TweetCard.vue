<template>
  <div v-if="post" class="glass p-5 transition hover:scale-[1.02]">

    <!-- Header -->
<div class="flex items-center justify-between mb-3">

  <div class="flex items-center gap-3 cursor-pointer"
      @click="goToProfile"
>

    <img
      v-if="post.profiles.avatar_url"
      :src="post.profiles.avatar_url"
      class="w-10 h-10 rounded-full object-cover"
    />

    <div>
      <div class="font-bold">
        {{ post.profiles.name }}
      </div>

      <div class="text-xs opacity-50">
        @{{ post.profiles.username }} · {{ formattedDate }}
      </div>
    </div>

  </div>

  <!-- Follow button -->
<button
  v-if="props.currentUserId !== post.profiles.id"
  @click.stop="toggleFollow(post.profiles.id)"
  class="px-3 py-1 text-sm rounded-xl transition"
  :class="isFollowing ? 'bg-white/10' : 'btn-glow'"
>
  {{ isFollowing ? "Following" : "Follow" }}
</button>


</div>


    <!-- Content -->
    <p class="mb-4 opacity-90">
      {{ post.content }}
    </p>

    <!-- Actions -->
    <div class="flex items-center gap-6 mt-3">

      <button
        @click="toggleLike"
        class="flex items-center gap-2 group transition"
      >
        <fa
          icon="heart"
          :class="liked ? 'text-pink-500 scale-110' : 'opacity-60 group-hover:text-pink-400'"
        />

        <span :class="liked ? 'text-pink-500' : 'opacity-60'">
          {{ likesCount }}
        </span>
      </button>

    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue"
import { supabase } from "../lib/supabase"
import { useRouter } from "vue-router"

const router = useRouter()

const currentUserId = ref(null)



const isFollowing = computed(() => {
  return props.followingSet?.has(props.post.profiles.id)
})

const liked = computed(() => {
  return props.likedPostsSet?.has(props.post.id)
})





async function toggleFollow(targetId){

  if(!props.currentUserId) return

  if(props.followingSet.has(targetId)){

    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", props.currentUserId)
      .eq("following_id", targetId)

    if(!error){
      props.updateFollowing(targetId, false)
    }

  } else {

    const { error } = await supabase
      .from("follows")
      .insert({
        follower_id: props.currentUserId,
        following_id: targetId
      })

    if(!error){
      props.updateFollowing(targetId, true)
    }
  }
}



function goToProfile(){
  if(!props.post.profiles?.username) return
  router.push("/profile/" + props.post.profiles.username)
}



const props = defineProps({
  post: Object,
  followingSet: Object,
  likedPostsSet: Object,
  currentUserId: String,
  updateFollowing: Function

})


const likesCount = ref(props.post.likes?.[0]?.count || 0)





async function toggleLike(){

  if(!props.currentUserId) return

  if(liked.value){

    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("post_id", props.post.id)
      .eq("user_id", props.currentUserId)

    if(!error){
      props.likedPostsSet.delete(props.post.id)
      likesCount.value--
    }

  } else {

    const { error } = await supabase
      .from("likes")
      .insert({
        post_id: props.post.id,
        user_id: props.currentUserId
      })

    if(!error){
      props.likedPostsSet.add(props.post.id)
      likesCount.value++
    }
  }
}





const shortUser = computed(() => {
  return props.post.user_id?.slice(0,8)
})

const formattedDate = computed(() => {
  return new Date(props.post.created_at).toLocaleString()
})
</script>
