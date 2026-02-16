import { createRouter, createWebHistory } from "vue-router"
import { supabase } from "../lib/supabase"

import MainLayout from "../layout/MainLayout.vue"
import Home from "../pages/Home.vue"
import Profile from "../pages/Profile.vue"
import Settings from "../pages/Settings.vue"
import Login from "../pages/Login.vue"
import Register from "../pages/Register.vue"
import SetupProfile from "../pages/SetupProfile.vue"
import Chat from "../pages/Chat.vue"

const routes = [

  { path: "/login", component: Login },
  { path: "/register", component: Register },

  // ВАЖНО: setup отдельно, НЕ внутри MainLayout
  { path: "/setup-profile", component: SetupProfile, meta:{auth:true} },

  {
    path: "/",
    component: MainLayout,
    meta:{auth:true},
    children: [
      { path: "", component: Home },
      { path: "profile/:id", component: Profile },
      { path: "settings", component: Settings },
      {path: "/chat", component: () => import("../pages/Chat.vue")}

    ]
  }

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to) => {

  const { data } = await supabase.auth.getSession()
  const session = data.session

  if(to.meta.auth && !session){
    return "/login"
  }

  if(session){
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", session.user.id)
      .single()

    if(!profile?.username && to.path !== "/setup-profile"){
      return "/setup-profile"
    }
  }

})

export default router
