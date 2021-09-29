import Vue from "vue";
import "./registerServiceWorker";
import VueApollo from "vue-apollo";
import BootstrapVue from "bootstrap-vue";
import router from "./router";
import store from "./store";
import i18n from "./i18n";
import VueTheMask from "vue-the-mask";

import DefaultLayout from "./views/layouts/DefaultLayout";
import ExternalLayout from "./views/layouts/ExternalLayout";
import AppComponent from "./App.vue";
/* import wysiwyg from 'vue-wysiwyg';
 */
import "@/lib/functions";

import "./components/global";
// import './assets/scss/app.scss'
import VueDragscroll from "vue-dragscroll";


// plugins
import "@/plugins/validator";
import "@/plugins/snotify";
import "@/plugins/permissions";
import "@/plugins/currency";
import "@/plugins/sweetalert";
import "@/plugins/vueselect";
import "@/plugins/vueavatar";
import "@/plugins/portal";
import "@/plugins/perfect-scrollbar";
import "@/plugins/month-picker";

// directives
import "@/directives";

// middlewares
import "@/middlewares";

// filters
import "@/filters";

import { apolloProvider } from "@/plugins/apollo/client";

// set the apollo client
import gqlform from "./lib/gqlform";
Vue.use(VueDragscroll);
gqlform.apolloClients = apolloProvider.clients;
Vue.use(VueApollo);
Vue.use(BootstrapVue);
/* Vue.use(wysiwyg, {}) */
Vue.use(VueTheMask);
Vue.config.productionTip = false;
// layout
Vue.component("default-layout", DefaultLayout);
Vue.component("external-layout", ExternalLayout);

//Set language

window.vm = new Vue({
  router,
  store,
  i18n,
  apolloProvider,
  render: h => h(AppComponent)
}).$mount("#app");
