import Vue from 'vue'
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'
import App from './App.vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import Vuelidate from 'vuelidate'
import axios from 'axios'
import VueAxios from 'vue-axios'
import router from './router'
import VueGoodTablePlugin from 'vue-good-table'
import 'vue-good-table/dist/vue-good-table.css'
import store from './store'
import './registerServiceWorker'
import fullscreen from 'vue-fullscreen'
import VueSweetalert2 from 'vue-sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import './../node_modules/jquery/dist/jquery.min.js'

import 'vue-awesome/icons'
import Icon from 'vue-awesome/components/Icon'
import VueSignaturePad from 'vue-signature-pad'
import VueGeolocation from 'vue-browser-geolocation'
import { version } from '../package.json'
import i18n from './i18n'

axios.defaults.baseURL = process.env.VUE_APP_API_URL
Vue.config.productionTip = false
Vue.prototype.$appVersion = version
Vue.prototype.$loading = false

Vue.use(BootstrapVue)
Vue.use(BootstrapVueIcons)
Vue.use(Vuelidate)
Vue.use(VueGoodTablePlugin)
Vue.use(fullscreen)
Vue.use(VueSweetalert2)
Vue.use(VueSignaturePad)
Vue.component('v-icon', Icon)
Vue.use(require('vue-moment'))
Vue.component('auto-logout', require('./components/AutoLogout.vue').default)
Vue.use(VueAxios, axios)
Vue.use(VueGeolocation)

new Vue({
  data: {
    activecompany: 'AL'
  },
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')
