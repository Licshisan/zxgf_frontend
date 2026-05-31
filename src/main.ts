import { createApp } from 'vue'
import { createPinia } from 'pinia'
import TDesign from 'tdesign-vue-next'
import TDesignChat from '@tdesign-vue-next/chat'

import App from './App.vue'
import router from './router'

import 'tdesign-vue-next/es/style/index.css'
import '@tdesign-vue-next/chat/es/style/index.css'
import './assets/base.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(TDesign)
app.use(TDesignChat)

app.mount('#app')
