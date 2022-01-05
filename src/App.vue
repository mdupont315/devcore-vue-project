<style>
@import "./assets/css/style.css";
</style>

<template>
  <div id="app" :class="container_class">
    <div v-if="show_overlay" class="overlay" @click="overlayClicked"></div>
    <component :is="layout">
      <router-view v-if="loaded" />
      <portal-target name="layers"></portal-target>
    </component>
    <vue-snotify />
    <ws-update-notify v-if="ws_updated"></ws-update-notify>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import { loadApp } from "@/lib/utils";
import UpdateFound from "./components/UpdateFound";
import gql from "graphql-tag";

const defaultLayout = "default-layout";
export default {
  components: {
    "ws-update-notify": UpdateFound,
  },
  data() {
    return {
      loaded: false,
    };
  },
  computed: {
    layout() {
      return this.$route.meta.layout || defaultLayout;
    },
    ...mapGetters({
      show_navbar: "app/show_navbar",
      container_class: "app/container_class",
      show_overlay: "app/show_overlay",
      ws_updated: "app/ws_updated",
    }),
  },
  async mounted() {
    await loadApp();
    this.loaded = true;
  },
  // apollo: {
  //   $subscribe: {
  //     subscribed: {
  //       query: gql`
  //         subscription notificationSubscription {
  //           newNotification{
  //             type
  //             payload
  //           }
  //         }
  //       `,
  //       result({ data }) {
  //         console.log(data);
  //       }
  //     }
  //   }
  // },
  methods: {
    overlayClicked($event) {
      this.$store.dispatch("app/overlayClicked", $event);
    },
  },
};
</script>
<style>
/* Hide scrollbar for Chrome, Safari and Opera */
 ::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
html {

 -ms-overflow-style: none;
  scrollbar-width: none;
	-webkit-transform: translate3d(0, 0, 0);
}
</style>
