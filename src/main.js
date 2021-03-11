import Vue from 'vue'
import App from './App.vue'
import {dwxf, dwxfDefaultSettings} from 'dw-xf'
import 'dw-xf/lib/dw-xf.css'
import settings from './settings'
import constantRoutes from './router'
import views from './views'
// import logo from './assets/logo.png'
import { codemirror } from 'vue-codemirror'
import dataV from '@jiaminghi/data-view'
import model from './components/model'

import './assets/iconfont/iconfont.css' // icon font
import 'codemirror/lib/codemirror.css'

Vue.use(codemirror)
Vue.use(dataV)

Vue.config.productionTip = false
Vue.use(dwxf, {
  settings: settings,
  constantRoutes: constantRoutes,
  views: views,
  logo: null
})

for (const item in model) {
  Vue.component(model[item].name, model[item])
}

new Vue({
  render: h => h(App),
  store: dwxfDefaultSettings.store,
  router: dwxfDefaultSettings.router
}).$mount('#app')
