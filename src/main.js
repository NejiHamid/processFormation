import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import Vuex from 'vuex'
import _ from 'lodash'
import Gapi from './customClasses/gapi'
import './registerServiceWorker'

Vue.config.productionTip = false
const gapiConfig = {
  apiKey: process.env.VUE_APP_API_KEY,
  clientId: process.env.VUE_APP_CLIENT_ID,
  discoveryDocs: ['https://docs.googleapis.com/$discovery/rest?version=v1', 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest', 'https://sheets.googleapis.com/$discovery/rest?version=v4', 'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'],
  scope: 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/spreadsheets'
}

// eslint-disable-next-line no-undef
const gApi = new Gapi(gapi, gapiConfig)
gApi.initClients()

Object.defineProperty(Vue.prototype, '$gapi', {
  // eslint-disable-next-line no-undef
  value: gApi
})

Object.defineProperty(Vuex.Store.prototype, '$gapi', {
  // eslint-disable-next-line no-undef
  value: gApi
})

Object.defineProperty(Vue.prototype, '$_', {
  value: _
})
// securité d'accès au route si non
router.beforeEach((to, from, next) => {
  if (to.name !== 'login' && to.name !== 'privacy-policy' && !store.getters.isSignIn) next({ name: 'login' })
  else next()
})

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
