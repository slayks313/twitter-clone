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
<button
  v-if="props.currentUserId === post.user_id"
  @click.stop="openDeleteModal"
  class="delete-btn"
>
  <fa icon="trash" />
</button>


</div>


    <!-- Content -->
    <p class="mb-4 opacity-90">
      {{ post.content }}
    </p>
 
<div
  v-if="post.post_images?.length"
  class="insta-carousel"
  @mousedown="startDrag"
  @mouseup="(e) => endDrag(e, post.post_images.length)"
  @mouseleave="(e) => endDrag(e, post.post_images.length)"
  @touchstart="startDrag"
  @touchend="(e) => endDrag(e, post.post_images.length)"
>

  <div
    class="carousel-track"
    :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
  >
 <div
  v-for="(img, index) in post.post_images"
  :key="img.image_url"
  class="carousel-slide"
>
  <img
    :src="img.image_url"
    draggable="false"
   
  />
</div>
  </div>

  <!-- стрелки -->
  <button
    v-if="currentSlide > 0"
    class="arrow left"
    @click="prevSlide"
  >
    ‹
  </button>

  <button
    v-if="currentSlide < post.post_images.length - 1"
    class="arrow right"
    @click="nextSlide(post.post_images.length)"
  >
    ›
  </button>

  <!-- точки -->
  <div class="dots">
    <span
      v-for="(img, index) in post.post_images"
      :key="index"
      class="dot"
      :class="{ active: currentSlide === index }"
      @click="goToSlide(index)"
    />
  </div>

</div>

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
  <div v-if="showDeleteModal" class="modal-overlay">

  <div class="modal-box">

    <h3>Удалить пост?</h3>
    <p class="modal-text">Это действие нельзя отменить.</p>

    <div class="modal-actions">
      <button class="modal-cancel" @click="closeDeleteModal">
        Отмена
      </button>

      <button class="modal-delete" @click="deletePost">
        Удалить
      </button>
    </div>

  </div>

</div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue"
import { supabase } from "../lib/supabase"
import { useRouter } from "vue-router"

const router = useRouter()

const currentUserId = ref(null)
const currentSlide = ref(0)


const showDeleteModal = ref(false)

function openDeleteModal() {
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
}

let startX = 0
let isDragging = false


async function deletePost() {

  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", props.post.id)

  if (error) {
    alert(error.message)
    return
  }

  closeDeleteModal()
  location.reload()
}

function nextSlide(total) {
  if (currentSlide.value < total - 1) {
    currentSlide.value++
  }
}

function prevSlide() {
  if (currentSlide.value > 0) {
    currentSlide.value--
  }
}

function goToSlide(index) {
  currentSlide.value = index
}

/* --- SWIPE --- */

function startDrag(e) {
  isDragging = true
  startX = e.type.includes("mouse") ? e.clientX : e.touches[0].clientX
}

function endDrag(e, total) {
  if (!isDragging) return
  isDragging = false

  const endX = e.type.includes("mouse")
    ? e.clientX
    : e.changedTouches[0].clientX

  const diff = startX - endX

  if (diff > 50) nextSlide(total)
  if (diff < -50) prevSlide()
}








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

<style>

.delete-btn {
  background: transparent;
  border: none;
  color: #ef4444;
  cursor: pointer;
  opacity: 0.7;
  transition: 0.2s;
}

.delete-btn:hover {
  opacity: 1;
  transform: scale(1.1);
}
.viewer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.viewer-content {
  position: relative;
  max-width: 95%;
  max-height: 95%;
}

.viewer-image {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
}

.viewer-close {
  position: absolute;
  top: -40px;
  right: 0;
  font-size: 28px;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
}

.viewer-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 40px;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
}

.viewer-arrow.left { left: -60px; }
.viewer-arrow.right { right: -60px; }
.insta-carousel {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  margin-top: 12px;
  user-select: none;
}

.carousel-track {
  display: flex;
  transition: transform 0.4s ease;
}

.carousel-slide {
  min-width: 100%;
}

.carousel-slide img {
  width: 100%;
  max-height: 500px;
  object-fit: cover;

}
.modal-overlay {
  position: fixed;
  inset: 0;

  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-box {
  background: rgba(0, 0, 0, 0.75); /* чёрный прозрачный */
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);

  padding: 24px;
  border-radius: 18px;
  width: 320px;
  text-align: center;

  border: 1px solid rgba(255,255,255,0.08);
}

.modal-text {
  opacity: 0.6;
  font-size: 14px;
  margin-top: 6px;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 18px;
  gap: 12px;
}

.modal-cancel {
  flex: 1;
  padding: 8px;
  border-radius: 10px;
  border: none;
  background: rgba(255,255,255,0.1);
  color: var(--text);
  cursor: pointer;
}

.modal-delete {
  flex: 1;
  padding: 8px;
  border-radius: 10px;
  border: none;
  background: #ef4444;
  color: white;
  cursor: pointer;
}

/* стрелки */
.arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(0,0,0,0.4);
  color: white;
  font-size: 20px;
  cursor: pointer;
}

.arrow.left { left: 10px; }
.arrow.right { right: 10px; }

/* точки */
.dots {
  position: absolute;
  bottom: 12px;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 6px;
}

.dot {
  width: 6px;
  height: 6px;
  background: rgba(255,255,255,0.5);
  border-radius: 50%;
  cursor: pointer;
}

.dot.active {
  background: white;
}</style>
