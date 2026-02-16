<template>
  <div class="flex gap-6 p-6">

    <Sidebar />

    <main class="flex-1 max-w-2xl mx-auto">
      <router-view />
    </main>

    <RightPanel />

  </div>
</template>

<script setup>
import Sidebar from "../components/Sidebar.vue"
import RightPanel from "../components/RightPanel.vue"
</script>
