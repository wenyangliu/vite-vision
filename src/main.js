import { createApp } from 'vue'
import * as echarts from 'echarts'
import axios from 'axios'
import App from './App.vue'
import router from './router'
import store from './store'

// socket
import SocketService from '@/utils/socket_service'
SocketService.Instance.connect()

// 引入字体的文件
import './assets/font/iconfont.css'
// 引入全局的样式文件
import './assets/css/global.less'
// 注册echarts主题
import {chalk} from './assets/theme/chalk.js'
import {vintage} from './assets/theme/vintage.js'
echarts.registerTheme('chalk', chalk)
echarts.registerTheme('vintage', vintage)

const app = createApp(App)
app.provide('$echarts', echarts)
app.provide('$axios', axios)
app.provide('$socket', SocketService.Instance)
app.use(router).use(store).mount('#app')
