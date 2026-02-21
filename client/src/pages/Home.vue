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

  <!-- превью внутри поля -->
 <div
  v-for="(img, index) in imagePreviews"
  :key="index"
  class="inline-preview"
>
  <img :src="img" @click="openFullImage(index)" />
  <button @click="removeImage(index)">×</button>
</div>

  <!-- кнопка загрузки -->
  <label class="upload-btn">
    <fa icon="image" />
  <input
  type="file"
  accept="image/*"
  multiple
  @change="handleImage"
  hidden
/>
  </label>

<button
  class="post-btn"
  @click="createPost"
  :disabled="isPosting"
>
  <fa
    v-if="isPosting"
    icon="spinner"
    spin
  />
  <span v-else>Пост</span>
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


<div
  v-if="showFullImage"
  class="fullscreen-overlay"
  @click="closeFullImage"
>
  <div class="fullscreen-container" @click.stop>

    <button
      class="fullscreen-close"
      @click="closeFullImage"
    >
      ×
    </button>

    <img
      :src="currentFullImage"
      class="fullscreen-img"
    />

  </div>
</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue"
import { supabase } from "../lib/supabase"
import TweetCard from "../components/TweetCard.vue"


const imageFiles = ref([])
const imagePreviews = ref([])
const currentUserId = ref(null)
const followingSet = ref(new Set())
const likedPostsSet = ref(new Set())
const imagePreview = ref(null)
const isPosting = ref(false)

const showFullImage = ref(false)

function openFullImage(index) {
  currentFullImage.value = imagePreviews.value[index]
  showFullImage.value = true
}

function closeFullImage() {
  showFullImage.value = false
  currentFullImage.value = null
}

function handleImage(e) {
  const files = Array.from(e.target.files)
  if (!files.length) return

  files.forEach(file => {
    imageFiles.value.push(file)
    imagePreviews.value.push(URL.createObjectURL(file))
  })
}

function removeImage(index) {
  imageFiles.value.splice(index, 1)
  imagePreviews.value.splice(index, 1)
}

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
  likes(count),
  post_images (
    image_url
  )
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
  if (isPosting.value) return
isPosting.value = true

  if (!content.value.trim() && !imageFiles.value.length) return

  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user

  if (!user) return

  // 1️⃣ создаём пост
  const { data: postData, error: postError } = await supabase
    .from("posts")
    .insert({
      content: content.value,
      user_id: user.id
    })
    .select()
    .single()

  if (postError) {
    alert(postError.message)
    return
  }

  const postId = postData.id

  // 2️⃣ если есть картинки — загружаем
  for (const file of imageFiles.value) {

    const fileExt = file.name.split('.').pop()
    const filePath = `${user.id}/${Date.now()}-${Math.random()}.${fileExt}`

    // upload в storage
    const { error: uploadError } = await supabase.storage
      .from("post-images")
      .upload(filePath, file)

    if (uploadError) {
      alert(uploadError.message)
      return
    }

    const { data } = supabase.storage
      .from("post-images")
      .getPublicUrl(filePath)

    // 3️⃣ сохраняем ссылку в post_images
    const { error: imageInsertError } = await supabase
      .from("post_images")
      .insert({
        post_id: postId,
        image_url: data.publicUrl
      })

    if (imageInsertError) {
      alert(imageInsertError.message)
      return
    }
  }

  // 4️⃣ очищаем
  content.value = ""
  imageFiles.value = []
  imagePreviews.value = []

  loadPosts()
  isPosting.value = false
}
</script>

<style scoped>

.post-btn {
  min-width: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.post-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.fullscreen-overlay {
  position: fixed;
  inset: 0;
  background: transparent; /* вообще без фона */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.fullscreen-container {
  position: relative;
  max-width: 95%;
  max-height: 95%;
}

.fullscreen-img {
  max-width: 100%;
  max-height: 90vh;
  border-radius: 16px;
  object-fit: contain;
  box-shadow: 0 0 40px rgba(0,0,0,0.6);
}

.fullscreen-close {
  position: absolute;
  top: -15px;
  right: -15px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #ef4444;
  color: #ffffff;
  font-size: 20px;
  cursor: pointer;
  transition: 0.2s;
}

.fullscreen-close:hover {
  background: #ef4444;
  color: white;
}
.inline-preview {
  position: relative;
  width: 34px;
  height: 34px;
  margin-right: 6px;
  flex-shrink: 0;
}

.inline-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.inline-preview button {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: none;
  background: rgba(0,0,0,0.7);
  color: white;
  font-size: 11px;
  cursor: pointer;
}

.image-upload {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: 10px;
}

.upload-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text);
  opacity: 0.6;
  cursor: pointer;
  transition: 0.2s;
}

.upload-btn:hover {
  opacity: 1;
  background: rgba(255,255,255,0.08);
}

.preview-container {
  position: relative;
  max-width: 640px;
}

.preview-img {
  width: 100%;
  border-radius: 18px;
  object-fit: cover;
  max-height: 350px;
  border: 1px solid rgba(255,255,255,0.08);
}

.remove-img {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: rgba(0,0,0,0.6);
  color: white;
  font-size: 16px;
  cursor: pointer;
}




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