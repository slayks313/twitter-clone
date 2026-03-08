<template>
  <div class="bottom-container">
    <div class="bottom-ui-wrapper">
      
      <nav class="nav-bar">
<router-link to="/feed" class="nav-item">
          <fa icon="house" />
          <span>Лента</span>
        </router-link>
        
           <router-link :to="'/profile/' + userId" class="nav-item">
          <fa icon="user" />
          <span>Профиль</span>
        </router-link>

        <router-link to="/chat" class="nav-item relative">
          <fa icon="comment" />
          <span>Чаты</span>
          <div
            v-if="totalUnread > 0"
            class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]"
          >
            {{ totalUnread > 99 ? '99+' : totalUnread }}
          </div>
        </router-link>
        
        <router-link to="/settings" class="nav-item">
          <fa icon="cog" />
          <span>Настройки</span>
        </router-link>

     
      </nav>

      <button class="action-circle" @click="$router.push('/search')">
        <fa icon="search" />
      </button>

    </div>
  </div>
</template>

<script setup>
import { computed } from "vue"
import { useAuth } from "../composables/useAuth"
import { useUnreadMessages } from "../composables/useUnreadMessages"
import { useRoute } from "vue-router"

const route = useRoute()

const { user } = useAuth()
const { totalUnread } = useUnreadMessages()
const userId = computed(() => user.value?.id)
</script>

<style>
.bottom-container {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;

  width: 100%;
  padding: 0 12px;
  box-sizing: border-box;

  display: flex;
  justify-content: center;
  pointer-events: none;
}

.bottom-ui-wrapper {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  max-width: 480px;
  pointer-events: auto;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;

  flex: 1;
  min-width: 0;

  background: rgba(60, 60, 60, 0.45);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);

  padding: 8px 10px;
  border-radius: 50px;

  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.25);

  box-sizing: border-box;
}

.nav-item {
  flex: 1;
  min-width: 0;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  padding: 8px 4px;

  text-decoration: none;
  color: #fff;
  opacity: 0.6;
  border-radius: 30px;

  transition: all 0.35s cubic-bezier(.4,0,.2,1);
}

.nav-item span {
  font-size: 10px;
  margin-top: 3px;
  white-space: nowrap;
  transition: opacity 0.3s ease;
}

.nav-item:hover {
  opacity: 0.9;
}

.nav-item.router-link-exact-active {
  opacity: 1;
  background: rgba(255, 255, 255, 0.25);
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.action-circle {
  width: 58px;
  height: 58px;
  border-radius: 50%;

  border: none;
  cursor: pointer;
  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  background: rgba(60, 60, 60, 0.55);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);

  color: white;
  font-size: 22px;

  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);

  transition: all 0.3s cubic-bezier(.4,0,.2,1);
}

.action-circle:hover {
  transform: scale(1.1);
}

.action-circle:active {
  transform: scale(0.92);
}
</style>