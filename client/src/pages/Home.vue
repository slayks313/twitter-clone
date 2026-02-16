<template>
  <div class="space-y-6">

    <!-- Созение поста -->
    <div class="glass p-5">
      <textarea
        v-model="content"
        placeholder="Share something futuristic..."
        class="w-full bg-transparent outline-none resize-none text-lg"
      />

      <div class="flex justify-end mt-3">
        <button
          class="btn-glow px-5 py-2 rounded-xl"
          @click="createPost"
        >
          Post
        </button>
      </div>
    </div>

    <!-- Лента -->
<TweetCard
  v-for="post in posts"
  :key="post.id"
  :post="post"
  :followingSet="followingSet"
  :likedPostsSet="likedPostsSet"
  :currentUserId="currentUserId"
  :updateFollowing="updateFollowing"
/>




  </div>
</template>

<script setup>
import { ref } from "vue"
import { supabase } from "../lib/supabase"
import TweetCard from "../components/TweetCard.vue"
import { onMounted, onUnmounted } from "vue"

const currentUserId = ref(null)
const followingSet = ref(new Set())
const likedPostsSet = ref(new Set())

let channel

onMounted(async () => {

  const { data } = await supabase.auth.getUser()
  currentUserId.value = data.user?.id

  if(currentUserId.value){

    // 1️⃣ Загружаем все подписки одним запросом
    const { data: myFollows } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", currentUserId.value)

    followingSet.value = new Set(
      myFollows?.map(f => f.following_id)
    )

    // 2️⃣ Загружаем все лайки пользователя одним запросом
    const { data: myLikes } = await supabase
      .from("likes")
      .select("post_id")
      .eq("user_id", currentUserId.value)

    likedPostsSet.value = new Set(
      myLikes?.map(l => l.post_id)
    )
  }

  loadPosts()
})


onUnmounted(() => {
  if (channel) {
    supabase.removeChannel(channel)
  }
})


const content = ref("")
const posts = ref([])

async function loadPosts(){

  const { data, error } = await supabase
    .from("posts")
    .select(`
  *,
  profiles!posts_user_id_fkey (
    id,
    name,
    username,
    avatar_url
  ),
  likes(count)
`)

    .order("created_at", { ascending:false })

  if(error){
    console.error(error)
    return
  }

  posts.value = data
}

function updateFollowing(targetId, isNowFollowing){
  if(isNowFollowing){
    followingSet.value.add(targetId)
  } else {
    followingSet.value.delete(targetId)
  }
}

async function createPost(){

  if(!content.value.trim()) return

  const { data: userData } = await supabase.auth.getUser()

  const { error } = await supabase
    .from("posts")
    .insert({
      content: content.value,
      user_id: userData.user.id
    })

  if(error){
    alert(error.message)
    return
  }

  content.value = ""
  loadPosts()
}

onMounted(loadPosts)
</script>
