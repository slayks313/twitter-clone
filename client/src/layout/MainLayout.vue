<template>
  <div class="layout">
    <Sidebar />
    <div class="center">
      <router-view />
      <MobileNav class="mobile-only" />
    </div>
    <RightPanel />
  </div>
</template>

<script setup>
import Sidebar from "../components/Sidebar.vue"
import RightPanel from "../components/RightPanel.vue"
import MobileNav from "../pages/MobileNav.vue";
</script>

<style scoped>
.mobile-only {
  display: none;
}


.layout {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 24px 20px;
  min-height: 100vh;
  gap: 16px;
}

.center {
  width: 640px;
  flex-shrink: 0;
}
@media (max-width: 768px) {
  .mobile-only {
    display: block;
  }

  .center {
    padding-bottom: 80px; /* чтобы контент не залез под меню */
  }
}
@media (max-width: 768px) {
  .center {
    width: 100%;
    padding-bottom: 90px;
  }
}
/* 📱 МОБИЛА */
@media (max-width: 768px) {
  .layout {
    padding: 0;
  }

  .center {
    width: 100%;
  }

  :deep(.sidebar),
  :deep(.right-panel) {
    display: none;
  }
}
</style>