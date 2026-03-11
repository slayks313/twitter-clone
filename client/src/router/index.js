import { createRouter, createWebHistory } from "vue-router"
import { supabase } from "../lib/supabase"

import MainLayout from "../layout/MainLayout.vue"
import Home from "../pages/Home.vue"
import Profile from "../pages/Profile.vue"
import Settings from "../pages/Settings.vue"
import Login from "../pages/Login.vue"
import Register from "../pages/Register.vue"
import SetupProfile from "../pages/SetupProfile.vue"
import { useAuth } from "../composables/useAuth"

let profileLoaded = false
let hasUsername = false

const routes = [

  { path: "/login", component: Login },
  { path: "/register", component: Register },
  { path: "/setup-profile", component: SetupProfile, meta:{auth:true} },

  {
    path: "/",
    component: MainLayout,
    meta:{auth:true},
    redirect: "/feed",
    children: [
      { path: "feed", component: Home },
      { path: "search", component: () => import("../pages/Search.vue") },
      { path: "profile/:id", component: Profile },
      { path: "settings", component: Settings },
      { path: "chat", component: () => import("../pages/Chat.vue") }
    ]
  }

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to) => {

  const { user, ready } = useAuth()

  if (!ready.value) return true

  // если страница требует авторизации
  if (to.meta.auth && !user.value) {
    return "/login"
  }

  // проверяем профиль только один раз
  if (user.value && !profileLoaded) {

    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.value.id)
      .single()

    hasUsername = !!profile?.username
    profileLoaded = true

  }

  if (user.value && !hasUsername && to.path !== "/setup-profile") {
    return "/setup-profile"
  }

  return true

})

export default router