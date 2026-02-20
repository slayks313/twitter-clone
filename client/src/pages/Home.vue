<template>
  <div class="space-y-6">

<div class="post-wrapper">

  <!-- отдельная лупа -->
  <div class="search-icon">
    <fa icon="magnifying-glass" />
  </div>

  <!-- поле -->
  <div class="post-field">
    <input
      v-model="content"
      placeholder="Публикация"
      class="post-input"
      @keydown.enter="createPost"
    />

    <button class="post-btn" @click="createPost">
      Пост
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
import { ref, onMounted, onUnmounted } from "vue"
import { supabase } from "../lib/supabase"
import TweetCard from "../components/TweetCard.vue"

const currentUserId = ref(null)
const followingSet = ref(new Set())
const likedPostsSet = ref(new Set())

let channel

onMounted(async () => {
  const { data } = await supabase.auth.getUser()
  currentUserId.value = data.user?.id

  if (currentUserId.value) {
    const { data: myFollows } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", currentUserId.value)

    followingSet.value = new Set(myFollows?.map(f => f.following_id))

    const { data: myLikes } = await supabase
      .from("likes")
      .select("post_id")
      .eq("user_id", currentUserId.value)

    likedPostsSet.value = new Set(myLikes?.map(l => l.post_id))
  }

  loadPosts()
})

onUnmounted(() => {
  if (channel) supabase.removeChannel(channel)
})

const content = ref("")
const posts = ref([])

async function loadPosts() {
  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      profiles!posts_user_id_fkey (
        id, name, username, avatar_url
      ),
      likes(count)
    `)
    .order("created_at", { ascending: false })

  if (error) { console.error(error); return }
  posts.value = data
}

function updateFollowing(targetId, isNowFollowing) {
  if (isNowFollowing) followingSet.value.add(targetId)
  else followingSet.value.delete(targetId)
}

async function createPost() {
  if (!content.value.trim()) return

  const { data: userData } = await supabase.auth.getUser()

  const { error } = await supabase
    .from("posts")
    .insert({ content: content.value, user_id: userData.user.id })

  if (error) { alert(error.message); return }

  content.value = ""
  loadPosts()
}
</script>

<style scoped>
.post-wrapper {
  display: flex;
  align-items: center;
  gap: 14px;
}

/* отдельная лупа */
.search-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--bg1), var(--bg2));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 15px;
  flex-shrink: 0;
  box-shadow: 0 0 15px var(--glow);
}

/* поле */
.post-field {
  flex: 1;
  display: flex;
  align-items: center;
  background: var(--card);
  border-radius: 40px;
  padding-left: 18px;
  height: 48px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.06);
}

/* инпут */
.post-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 15px;
  color: var(--text);
}

.post-input::placeholder {
  color: var(--text);
  opacity: 0.5;
}

/* кнопка внутри */
.post-btn {
  height: 100%;
  padding: 0 28px;
  border: none;
  background: linear-gradient(135deg, var(--bg1), var(--bg2));
  color: white;
  font-weight: 600;
  border-radius: 40px;
  cursor: pointer;
  box-shadow: 0 0 15px var(--glow);
}
</style>