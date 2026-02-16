<template>
  <div class="glass p-5">

    <h3 class="mb-3 font-bold">Theme</h3>

    <div class="grid grid-cols-4 gap-3">

      <button
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

const themes = [

  {
    name: "blue",
    preview: "linear-gradient(135deg,#2563eb,#9333ea)",
    vars:{
      "--bg-main":"#0b0f1a",
      "--bg1":"#2563eb66",
      "--bg2":"#9333ea66",
      "--card":"rgba(255,255,255,0.06)",
      "--glow":"#3b82f6aa",
      "--text":"#fff"
    }
  },

  {
    name: "purple",
    preview: "linear-gradient(135deg,#7c3aed,#ec4899)",
    vars:{
      "--bg-main":"#120b1a",
      "--bg1":"#7c3aed66",
      "--bg2":"#ec489966",
      "--card":"rgba(255,255,255,0.07)",
      "--glow":"#a855f7aa",
      "--text":"#fff"
    }
  },

  {
    name: "green",
    preview: "linear-gradient(135deg,#16a34a,#22d3ee)",
    vars:{
      "--bg-main":"#08140d",
      "--bg1":"#16a34a66",
      "--bg2":"#22d3ee66",
      "--card":"rgba(255,255,255,0.05)",
      "--glow":"#16a34aaa",
      "--text":"#eafff1"
    }
  },

  {
    name: "light",
    preview: "#ffffff",
    vars:{
      "--bg-main":"#f6f7fb",
      "--bg1":"#dbeafe",
      "--bg2":"#e0e7ff",
      "--card":"rgba(255,255,255,0.8)",
      "--glow":"#93c5fd",
      "--text":"#111"
    }
  }

]


function applyTheme(t){
  Object.entries(t.vars).forEach(([k,v])=>{
    document.documentElement.style.setProperty(k,v)
  })
}
</script>
