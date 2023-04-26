import Vue from 'vue'
import 'es6-promise/auto'
import Vuex from 'vuex'
import axios from 'axios'
import createPersistedState from 'vuex-persistedstate'
import router from './router'

Vue.use(Vuex)
Vue.use(axios)

export default new Vuex.Store({
  state: {
    loginSuccessful: false,
    loggedinuser: 'Not set',
    loginError: '',
    test: false,
    prtlab: '',
    prtdoc: '',
    prt100x100: '',
    prt100x50: '',
    prt165x80: '',
    prt60x35: '',
    afdeling: '',
    avatar: '',
    lastlogin: '',
    supervisor: '',
    viewonly: false,
    activecompany: '',
    userbadge: '',
    almnuInfo: '',
    almnuOperations: '',
    almnuReception: '',
    almnuReturn: '',
    almnuShipping: '',
    almnuWarehouse: '',
    mnumbwarehouse: '',
    mnumbreception: '',
    mnumboperations: '',
    mnumbinfo: '',
    mnusystems: '',
    mnuextrusion: ''
  },
  mutations: {
    changeactivecompany (state, passedvalue) {
      state.activecompany = passedvalue
    },
    loginStop: (state, errorMessage) => {
      // console.log(router.currentRoute.fullPath)
      state.loginError = errorMessage
      state.loginSuccessful = false
      state.loggedinuser = ''
      state.test = false
      state.prtlab = ''
      state.prtdoc = ''
      state.prt100x100 = ''
      state.prt100x50 = ''
      state.prt165x80 = ''
      state.prt60x35 = ''
      state.afdeling = ''
      state.supervisor = ''
      state.viewonly = false
      state.lastlogin = ''
      state.userbadge = ''
      state.mnualinfo = ''
      state.mnualoperations = ''
      state.mnualreception = ''
      state.mnualreturn = ''
      state.mnualshipping = ''
      state.mnualwarehouse = ''
      state.mnumbwarehouse = ''
      state.mnumbreception = ''
      state.mnumboperations = ''
      state.mnumbinfo = ''
      state.mnusystems = ''
      state.mnuextrusion = ''
      // router.push('/')
      if (router.currentRoute.fullPath !== '/') {
        router.push('/')
      } else { location.reload() }
      // location.reload() // to force new version
    },
    authUser: (state, userData) => {
      // console.log(userData)
      state.loggedinuser = userData.username
      state.loginSuccessful = true
      state.loginError = ''
      state.test = userData.test
      state.prtlab = userData.prtlab
      state.prtdoc = userData.prtdoc
      state.prt100x100 = userData.prt100x100
      state.prt100x50 = userData.prt100x50
      state.prt165x80 = userData.prt165x80
      state.prt60x35 = userData.prt60x35
      state.afdeling = userData.afdeling
      state.supervisor = userData.supervisor
      state.userbadge = userData.badge
      state.mnualinfo = userData.mnualinfo
      state.mnualoperations = userData.mnualoperations
      state.mnualreception = userData.mnualreception
      state.mnualreturn = userData.mnualreturn
      state.mnualshipping = userData.mnualshipping
      state.mnualwarehouse = userData.mnualwarehouse
      state.mnumbwarehouse = userData.mnumbwarehouse
      state.mnumbreception = userData.mnumbreception
      state.mnumboperations = userData.mnumboperations
      state.mnumbinfo = userData.mnumbinfo
      state.mnusystems = userData.mnusystems
      state.mnuextrusion = userData.mnuextrusion
      if (userData.badge === '9999') { state.viewonly = true } else { state.viewonly = false }
      state.lastlogin = Date.now()
    }
  },
  actions: {
    login ({ commit }, loginData) {
      Vue.prototype.$loading = true
      axios.post('/Checklogin?badgeid=' + loginData.id)
        .then(res => {
          if (!res.data.length) {
            // console.log('ID NOT FOUND')
            commit('loginStop', 'badge not found/disabled')
          } else {
            // console.log(res.data)
            commit('authUser', {
              username: res.data[0].Shortname,
              test: res.data[0].Test,
              prtlab: res.data[0].PrtLab,
              prtdoc: res.data[0].PrtDoc,
              prt100x100: res.data[0].PRT100x100,
              prt100x50: res.data[0].PRT100x50,
              prt165x80: res.data[0].PRT165x80,
              prt60x35: res.data[0].PRT60x35,
              badge: res.data[0].Badge,
              afdeling: res.data[0].Afdeling,
              supervisor: res.data[0].Supervisor,
              mnualinfo: res.data[0].ALMnuInfo,
              mnualoperations: res.data[0].ALMnuOperations,
              mnualreception: res.data[0].ALMnuReception,
              mnualreturn: res.data[0].ALMnuReturn,
              mnualshipping: res.data[0].ALMnuShipping,
              mnualwarehouse: res.data[0].ALMnuWarehouse,
              mnumbwarehouse: res.data[0].MBMnuWarehouse,
              mnumbreception: res.data[0].MBMnuWarehouse,
              mnumboperations: res.data[0].MBMnuWarehouse,
              mnumbinfo: res.data[0].MBMnuWarehouse,
              mnusystems: res.data[0].MnuSystems,
              mnuextrusion: res.data[0].MnuExtrusion
            })
          }
        })
        .catch(error => {
          commit('loginStop', error.response.data.error)
        })
      Vue.prototype.$loading = false
    },
    logout ({ commit }) {
      commit('loginStop', '')
    }
  },
  plugins: [createPersistedState()],
  getters: {
    user (state) {
      return state.loggedinuser
    },
    isAuthenticated (state) {
      return state.loginSuccessful
    }
  }
})
