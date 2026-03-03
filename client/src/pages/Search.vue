<template>
  <div class="search-container max-w-2xl mx-auto px-4 py-8" :style="{ color: 'var(--text)' }">
    <div class="mb-8 text-center">

      <div 
        class="inline-flex p-1 backdrop-blur-md rounded-2xl border mb-8"
        style="background: var(--card); border-color: rgba(128,128,128,0.2);"
      >
        <button
          v-for="tab in ['posts', 'users']"
          :key="tab"
          @click="mode = tab"
          :class="[
            'px-8 py-2.5 rounded-xl text-sm font-medium transition-all duration-300',
            mode === tab 
              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' 
              : 'opacity-60 hover:opacity-100'
          ]"
          :style="mode !== tab ? { color: 'var(--text)' } : {}"
        >
          {{ tab === 'posts' ? 'Posts' : 'People' }}
        </button>
      </div>

      <div class="relative group">
        <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 opacity-40 group-focus-within:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          v-model="searchQuery"
          @keyup.enter="runSearch"
          type="text"
          placeholder="Search for tags, names or keywords..."
          class="w-full border rounded-2xl pl-12 pr-24 py-4 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          :style="{ 
            background: 'var(--card)', 
            borderColor: 'rgba(128,128,128,0.2)',
            color: 'var(--text)'
          }"
        />
        <button 
          @click="runSearch"
          class="absolute right-2 top-2 bottom-2 px-5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition-transform active:scale-95"
        >
          Search
        </button>
      </div>
    </div>

    <div class="results-wrapper">
      <div v-if="isLoading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="h-32 w-full animate-pulse rounded-2xl" style="background: var(--card)"></div>
      </div>

      <div v-else>
        <div v-if="mode === 'posts'" class="space-y-6">
          <div v-if="results.length === 0 && searchQuery" class="empty-state">
            <p class="opacity-40">No posts matched your spark ✨</p>
          </div>
          <div v-for="post in results" :key="post.id" class="transform transition hover:translate-y-[-2px]">
            <TweetCard
              :post="post"
              :followingSet="followingSet"
              :likedPostsSet="likedPostsSet"
              :currentUserId="currentUserId"
              :updateFollowing="updateFollowing"
            />
          </div>
        </div>

        <div v-else class="grid grid-cols-1 gap-3">
          <div v-if="results.length === 0 && searchQuery" class="empty-state">
            <p class="opacity-40">We couldn't find that person 🔎</p>
          </div>
          <div 
            v-for="u in results" 
            :key="u.id" 
            class="group flex items-center gap-4 p-4 border rounded-2xl transition-all cursor-pointer"
            :style="{ 
              background: 'var(--card)', 
              borderColor: 'rgba(128,128,128,0.1)' 
            }"
            @click="viewProfile(u.id)"
          >
            <div class="relative">
              <img
                v-if="u.avatar_url"
                :src="u.avatar_url"
                class="w-14 h-14 rounded-full object-cover ring-2 transition-all"
                :style="{ ringColor: 'rgba(128,128,128,0.2)' }"
              />
              <div v-else class="w-14 h-14 rounded-full flex items-center justify-center bg-gray-500/20">
                {{ u.username?.charAt(0).toUpperCase() }}
              </div>
            </div>
            <div class="flex-1">
              <div class="font-bold text-lg leading-tight group-hover:text-blue-400 transition-colors">
                {{ u.name || 'Anonymous' }}
              </div>
              <div class="text-sm opacity-50">@{{ u.username }}</div>
            </div>
            <div class="opacity-0 group-hover:opacity-100 transition-opacity">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '../lib/supabase'
import TweetCard from '../components/TweetCard.vue'
import { useAuth } from '../composables/useAuth'
import { useRouter } from 'vue-router'

const searchQuery = ref('')
const mode = ref('posts')
const results = ref([])
const isLoading = ref(false)

const { user } = useAuth()
const currentUserId = ref(null)
const followingSet = ref(new Set())
const likedPostsSet = ref(new Set())

const router = useRouter()

function viewProfile(id) {
  router.push(`/profile/${id}`)
}

async function loadProfileData() {
  const { data: userData } = await supabase.auth.getUser()
  currentUserId.value = userData.user?.id

  if (currentUserId.value) {
    const { data: myFollows } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', currentUserId.value)
    followingSet.value = new Set(myFollows.map(f => f.following_id))

    const { data: myLikes } = await supabase
      .from('likes')
      .select('post_id')
      .eq('user_id', currentUserId.value)
    likedPostsSet.value = new Set(myLikes.map(l => l.post_id))
  }
}

async function runSearch() {
  if (!searchQuery.value.trim()) {
    results.value = []
    return
  }
  isLoading.value = true
  if (mode.value === 'posts') {
    const q = searchQuery.value.trim().replace(/^#/, '')
    const { data } = await supabase
      .from('posts')
      .select(`*, post_images(*), profiles(*)`)
      .ilike('content', `%#${q}%`)
    results.value = data || []
  } else {
    const q = searchQuery.value.trim()
    const { data } = await supabase
      .from('profiles')
      .select('id,name,username,avatar_url')
      .or(`username.ilike.%${q}%,name.ilike.%${q}%`)
    results.value = data || []
  }
  isLoading.value = false
}

// load follow/like sets for TweetCard
loadProfileData()

function updateFollowing(targetId, isNow) {
  if (isNow) followingSet.value.add(targetId)
  else followingSet.value.delete(targetId)
}
</script>

<style scoped>
.empty-state {
  @apply py-20 text-center text-lg italic;
}

/* Настройки плейсхолдера для разных тем */
input::placeholder {
  color: var(--text);
  opacity: 0.3;
}

.results-wrapper {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>