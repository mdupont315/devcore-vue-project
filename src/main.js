// import Vue from 'vue'

// import AppLayout from './layout/index.vue'
// import router from './router'
// import store from './store'

// import './mixins'
// import './plugins'
// import './thirdParty'

// import './scss/style.scss'
// import './assets/fonts/bebasneue.css'

// Vue.config.productionTip = false

// new Vue({
//   name: 'Root',
//   router,
//   store,
//   mounted () {
//     store.commit('dom/SET_WINDOW_WIDTH', window.innerWidth)
//     window.addEventListener('resize', () => store.commit('dom/SET_WINDOW_WIDTH', window.innerWidth))
//   },

//   beforeDestroy () {
//     window.removeEventListener('resize', () => store.commit('dom/SET_WINDOW_WIDTH', window.innerWidth))
//   },
//   render: h => h(AppLayout)
// }).$mount('#app')
import Vue from 'vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import VueApollo from 'vue-apollo'
import i18n from './i18n'
import BootstrapVue from 'bootstrap-vue'



import DefaultLayout from './views/layouts/DefaultLayout'
import ExternalLayout from './views/layouts/ExternalLayout'
import AppComponent from './App.vue'


import '@/lib/functions'

import './components/global';
// import './assets/scss/app.scss'

//plugins
import '@/plugins/validator'
import '@/plugins/snotify'
import '@/plugins/permissions'
import '@/plugins/currency'
import '@/plugins/sweetalert'
import '@/plugins/vueselect'
import '@/plugins/vueavatar'
import '@/plugins/portal'
import '@/plugins/perfect-scrollbar'
import '@/plugins/month-picker'

//directives
import '@/directives'

//middlewares
import '@/middlewares'

//filters
import '@/filters'

import {
    apolloProvider
} from '@/plugins/apollo/client'

//set the apollo client
import gqlform from './lib/gqlform';
gqlform.apolloClients = apolloProvider.clients;

Vue.use(VueApollo)
Vue.use(BootstrapVue)


Vue.config.productionTip = false;

//layout
Vue.component('default-layout', DefaultLayout);
Vue.component('external-layout', ExternalLayout);




window.vm = new Vue({
    router,
    store,
    i18n,
    apolloProvider,
    render: h => h(AppComponent)
}).$mount('#app')