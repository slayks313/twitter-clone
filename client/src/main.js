import { createApp } from "vue"
import App from "./App.vue"
import router from "./router"
import "./style.css"
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import {
  faHouse,
  faUser,
  faGear,
  faHeart,
  faComment,
  faRetweet,
  faPlus
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faHouse,
  faUser,
  faGear,
  faHeart,
  faComment,
  faRetweet,
  faPlus
)

const app = createApp(App)

app.use(router)

app.component('fa', FontAwesomeIcon)

app.mount('#app')

