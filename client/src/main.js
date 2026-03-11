import { createApp } from "vue"
import App from "./App.vue"
import router from "./router"
import "./style.css"

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import { initPresence } from "./composables/usePresence"
import { initAuth } from "./composables/useAuth"

import {
  faHouse,
  faUser,
  faGear,
  faHeart,
  faComment,
  faRetweet,
  faPlus,
  faBars,
  faUserGroup,
  faMagnifyingGlass,
  faImage,
  faSpinner,
  faPenToSquare,
  faTrash,
  faPaperPlane,
  faAnglesDown,
  faBell,
  faDownload
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faHouse,
  faUser,
  faGear,
  faHeart,
  faComment,
  faRetweet,
  faPlus,
  faBars,
  faUserGroup,
  faMagnifyingGlass,
  faImage,
  faSpinner,
  faPenToSquare,
  faTrash,
  faPaperPlane,
  faAnglesDown,
  faBell,
  faDownload
)

async function startApp(){

  // сначала auth
  await initAuth()

  const app = createApp(App)

  app.use(router)

  app.component("fa", FontAwesomeIcon)

  // presence запускаем после auth
  initPresence()

  await router.isReady()

  app.mount("#app")

}

startApp()