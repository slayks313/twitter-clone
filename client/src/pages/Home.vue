<template>
  <div>
  <div class="space-y-6">

<div class="post-wrapper relative">

  <!-- поле и иконка поиска -->
  <div class="search-icon-circle absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center" @click="$router.push('/search')">
    <fa icon="magnifying-glass" />
  </div>
  <div class="post-field flex-1 flex items-center gap-2 ml-14">
    <input
      v-model="content"
      placeholder="Публикация"
      class="post-input flex-1 pl-4"
      @keydown.enter="createPost"
    />

  <!-- превью внутри поля -->
  <div v-if="imagePreviews.length" class="inline-preview-row">
    <div
      v-for="(img, index) in imagePreviews"
      :key="index"
      class="inline-preview"
    >
      <img :src="img" @click="openFullImage(index)" />
      <button @click="removeImage(index)">×</button>
    </div>
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

<div v-if="isInitialLoading" class="space-y-6">
  <div v-for="n in 5" :key="n" class="glass p-5 animate-pulse">

    <div class="flex items-center gap-3 mb-4">
      <div class="w-10 h-10 bg-gray-700 rounded-full"></div>
      <div class="flex-1 space-y-2">
        <div class="h-4 bg-gray-700 rounded w-1/3"></div>
        <div class="h-3 bg-gray-700 rounded w-1/4"></div>
      </div>
    </div>

    <div class="space-y-2">
      <div class="h-4 bg-gray-700 rounded"></div>
      <div class="h-4 bg-gray-700 rounded w-5/6"></div>
      <div class="h-4 bg-gray-700 rounded w-2/3"></div>
    </div>

    <div class="mt-4 h-60 bg-gray-700 rounded-xl"></div>

  </div>
</div>

    <!-- Лента -->
<DynamicScroller
  v-if="!isInitialLoading"
  :items="posts"
  key-field="id"
  class="scroller"
  :min-item-size="200"
>
  <template #default="{ item, index }">

<DynamicScrollerItem
  :item="item"
  :active="true"
  :size-dependencies="[item.content, item.post_images]"
  :data-index="index"
>
  <div class="pb-6"> <!-- вот тут отступ -->
    <TweetCard
      :post="item"
      :followingSet="followingSet"
      :likedPostsSet="likedPostsSet"
      :currentUserId="currentUserId"
      :updateFollowing="updateFollowing"
    />
  </div>
</DynamicScrollerItem>

  </template>
</DynamicScroller>


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
  <div ref="scrollTrigger"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue"
import { supabase } from "../lib/supabase"
import TweetCard from "../components/TweetCard.vue"
import {
  DynamicScroller,
  DynamicScrollerItem
} from "vue-virtual-scroller"

import "vue-virtual-scroller/dist/vue-virtual-scroller.css"

import { useAuth } from "../composables/useAuth"

const { user } = useAuth()
const scrollTrigger = ref(null)

// ── Состояние ──
const content = ref("")
const imageFiles = ref([])
const imagePreviews = ref([])
const currentUserId = ref(null)
const followingSet = ref(new Set())
const likedPostsSet = ref(new Set())
const isPosting = ref(false)
const currentFullImage = ref(null)
const isInitialLoading = ref(true)
const showFullImage = ref(false)
const posts = ref([])
const page = ref(0)
const pageSize = 10
const isLoadingMore = ref(false)
const hasMore = ref(true)
let channel

const emit = defineEmits(['toggleMobileNav'])

// ── localStorage черновик ──
const DRAFT_KEY = "post_draft"

function saveDraft() {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({
      content: content.value,
      images: imagePreviews.value  // здесь уже base64
    }))
  } catch (e) {
    // переполнен — игнорируем
  }
}

function clearDraft() {
  localStorage.removeItem(DRAFT_KEY)
}

async function restoreDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return
    const draft = JSON.parse(raw)
    if (draft.content) content.value = draft.content
    if (Array.isArray(draft.images) && draft.images.length) {
      for (const dataUrl of draft.images) {
        if (!dataUrl || !dataUrl.startsWith("data:")) continue
        imagePreviews.value.push(dataUrl)
        // base64 → Blob → File, чтобы можно было загрузить в Supabase
        const res = await fetch(dataUrl)
        const blob = await res.blob()
        const ext = blob.type.split("/")[1] || "jpg"
        const file = new File([blob], `draft-${Date.now()}.${ext}`, { type: blob.type })
        imageFiles.value.push(file)
      }
    }
  } catch (e) {
    clearDraft()
  }
}

// Восстанавливаем черновик при старте
restoreDraft()

// ── Infinite scroll ──
onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) loadPosts()
    },
    { threshold: 1 }
  )
  if (scrollTrigger.value) observer.observe(scrollTrigger.value)
})

// ── Загрузка данных пользователя ──
watch(user, async (u) => {
  if (!u) return
  currentUserId.value = u.id

  const { data: myFollows } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", u.id)
  followingSet.value = new Set(myFollows?.map(f => f.following_id))

  const { data: myLikes } = await supabase
    .from("likes")
    .select("post_id")
    .eq("user_id", u.id)
  likedPostsSet.value = new Set(myLikes?.map(l => l.post_id))

  await loadPosts()
}, { immediate: true })

// ── Полноэкранный просмотр ──
function openFullImage(index) {
  currentFullImage.value = imagePreviews.value[index]
  showFullImage.value = true
}

function closeFullImage() {
  showFullImage.value = false
  currentFullImage.value = null
}

// ── Выбор изображений ──
// Конвертируем File → base64 и сразу сохраняем черновик в localStorage
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function handleImage(e) {
  const files = Array.from(e.target.files)
  if (!files.length) return

  for (const file of files) {
    try {
      const base64 = await fileToBase64(file)
      imagePreviews.value.push(base64)
      imageFiles.value.push(file)
    } catch (err) {
      console.error("Ошибка чтения файла:", err)
    }
  }

  // Сохраняем черновик (превью уже base64 — можно хранить в localStorage)
  saveDraft()
}

function removeImage(index) {
  imageFiles.value.splice(index, 1)
  imagePreviews.value.splice(index, 1)
  saveDraft()
}

// ── Лента ──
async function loadPosts() {
  if (page.value === 0) isInitialLoading.value = true
  if (isLoadingMore.value) return
  if (!currentUserId.value) return

  isLoadingMore.value = true

  const { data, error } = await supabase
    .rpc("get_ranked_posts", {
      p_user: currentUserId.value,
      p_limit: pageSize,
      p_offset: page.value * pageSize
    })

  if (error) {
    console.error(error)
    isLoadingMore.value = false
    return
  }

  if (!data || data.length === 0) {
    isLoadingMore.value = false
    isInitialLoading.value = false
    return
  }

  const cleaned = data.map(post => ({
    ...post,
    post_images: (post.post_images || []).filter(i => i?.image_url)
  }))

  posts.value.push(...cleaned)
  page.value++
  isLoadingMore.value = false
  isInitialLoading.value = false
}

function updateFollowing(targetId, isNowFollowing) {
  if (isNowFollowing) followingSet.value.add(targetId)
  else followingSet.value.delete(targetId)
}

// ── Создание поста ──
async function createPost() {
  if (isPosting.value) return
  isPosting.value = true

  if (!content.value.trim() && !imageFiles.value.length) {
    isPosting.value = false
    return
  }

  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user
  if (!user) return

  // 1️⃣ создаём пост
  const { data: postData, error: postError } = await supabase
    .from("posts")
    .insert({ content: content.value, user_id: user.id })
    .select()
    .single()

  if (postError) {
    alert(postError.message)
    isPosting.value = false
    return
  }

  const postId = postData.id

  await supabase.rpc("add_post_hashtags", {
    p_post_id: postId,
    p_content: content.value
  })

  // 2️⃣ загружаем картинки
  for (const file of imageFiles.value) {
    const fileExt = file.name.split('.').pop()
    const filePath = `${user.id}/${Date.now()}-${Math.random()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from("post-images")
      .upload(filePath, file)

    if (uploadError) {
      alert(uploadError.message)
      isPosting.value = false
      return
    }

    const { data } = supabase.storage.from("post-images").getPublicUrl(filePath)

    const { error: imageInsertError } = await supabase
      .from("post_images")
      .insert({ post_id: postId, image_url: data.publicUrl })

    if (imageInsertError) {
      alert(imageInsertError.message)
      isPosting.value = false
      return
    }
  }

  // 3️⃣ очищаем поле и черновик
  content.value = ""
  imageFiles.value = []
  imagePreviews.value = []
  clearDraft()

  loadPosts()
  isPosting.value = false
}

onUnmounted(() => {
  if (channel) supabase.removeChannel(channel)
})
</script>

<style scoped>
.vue-recycle-scroller__item-wrapper {
  overflow: visible !important;
}

.search-icon-input {
  display: none;
}

.search-icon-circle {
  width: 48px;
  height: 48px; /* same as input height */
  border-radius: 50%;
  background: rgba(255,255,255,0.1);
  cursor: pointer;
  transition: background 0.2s, opacity 0.2s;
  font-size: 18px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}
.search-icon-circle:hover {
  background: rgba(255,255,255,0.2);
  opacity: 0.8;
}

.vue-recycle-scroller__item-view {
  overflow: visible !important;
}
.scroller {
  overflow: visible !important;
}

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

.inline-preview-row{
  display: flex;
  align-items: center;
  max-width: 150px;
  overflow-x: auto;
  padding-right: 4px;
  gap: 6px;
  flex-shrink: 1;
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
  position: relative;
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
  /* icon moved outside so no left padding needed */
  height: 48px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.06);
}

/* инпут */
.post-input {
  flex: 1;
  min-width: 0;
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
@media (max-width: 768px) {
  .space-y-6 {
    padding: 12px;
  }
  .search-icon-circle {
    display: none;
  }
  .post-field {
    margin-left: 0 !important;
  }
}
</style>