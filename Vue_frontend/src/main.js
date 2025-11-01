import Vue from 'vue'              //导包
import App from './App.vue'
import router from './router'
// main.js
import ElementUI from 'element-ui'
import 'element-ui/packages/theme-chalk/lib/index.css' // 引入样式文件
import Animate from 'animate.css'
import 'animate.css/animate.css'
Vue.use(ElementUI)  
Vue.use(Animate)
Vue.config.productionTip = false   // 关闭生产提示  

new Vue({               //vue2 创建vue
  router,
  render: h => h(App)
}).$mount('#app')
