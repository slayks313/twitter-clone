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

  // если auth ещё не загрузился — пропускаем
  if (!ready.value) return true

  // если страница требует авторизации
  if (to.meta.auth && !user.value) {
    return "/login"
  }

  // если пользователь залогинен — проверяем профиль
  if (user.value) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.value.id)
      .single()

    if (!profile?.username && to.path !== "/setup-profile") {
      return "/setup-profile"
    }
  }

  return true
})

export default router
