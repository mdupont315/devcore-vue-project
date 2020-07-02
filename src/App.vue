<style>
  @import './assets/css/style.css';
</style>
<script src="http://localhost:8098"></script>
<template>
  <div id="app" :class="container_class">
    <div class="overlay" v-if="show_overlay" @click="overlayClicked"></div>
    <router-view v-if="loaded" />
    <portal-target name="layers"></portal-target>
    <vue-snotify />
    <ws-update-notify v-if="ws_updated"></ws-update-notify>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import { loadApp } from "@/lib/utils";
import UpdateFound from "./components/UpdateFound";
export default {
  components: {
    "ws-update-notify": UpdateFound
  },
  data() {
    return {
      loaded: false
    };
  },
  computed: {
    ...mapGetters({
      show_navbar: "app/show_navbar",
      container_class: "app/container_class",
      show_overlay: "app/show_overlay",
      ws_updated: "app/ws_updated"
    })
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
    }
  }
};
</script>