import { createApp } from "vue"
import App from "./App.vue"
import router from "./router"
import "./style.css"
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { initPresence } from "./composables/usePresence"
import { initAuth } from "./composables/useAuth"

await initAuth()

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

const app = createApp(App)

app.use(router)

app.component('fa', FontAwesomeIcon)

initPresence()

app.mount('#app')

