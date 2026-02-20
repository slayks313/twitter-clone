<template>
  <div class="layout">
    <Sidebar />
    <div class="center">
      <router-view />
    </div>
    <RightPanel />
  </div>
</template>

<script setup>
import Sidebar from "../components/Sidebar.vue"
import RightPanel from "../components/RightPanel.vue"
</script>

<style scoped>
.layout {
  display: flex;
  align-items: flex-start;
  justify-content: center;   /* центрируем всю группу */
  padding: 24px 20px;
  min-height: 100vh;
  gap: 16px;                 /* одинаковый gap между всеми тремя */
}

.center {
  width: 640px;
  flex-shrink: 0;            /* не сжимается, фиксированная ширина */
}
</style>