<template>
<div class="glass p-5">
    <h3 class="mb-3 font-bold">Theme</h3>
    <div class="grid grid-cols-5 gap-3"> <button
        v-for="t in themes"
        :key="t.name"
        :style="{ background: t.preview }"
        class="h-10 rounded-xl border border-white/20"
        @click="applyTheme(t)"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue"

import { themes } from "../themes" // Подключаем наш файл

function applyTheme(t) {
  Object.entries(t.vars).forEach(([k, v]) => {
    document.documentElement.style.setProperty(k, v)
  })
  localStorage.setItem("user-theme", t.name)
}






</script>
