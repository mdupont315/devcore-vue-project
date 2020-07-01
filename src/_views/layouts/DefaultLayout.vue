<template>
  <div class="layout" v-if="user">
    <top-nav></top-nav>
    <div class="content" id="content-wrapper">
      <main-nav></main-nav>
      <main class="main" id="main">
        <div class="wrapper">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>
<script>
import { /*mapState,*/ mapGetters } from "vuex";
import TopNav from "./components/TopNav";
import MainNav from "./components/MainNav";
export default {
  name: "default-layout",
  components: {
    "top-nav": TopNav,
    "main-nav": MainNav
  },
  computed: {
    ...mapGetters({
      user: "auth/user",
      layers: "layers/layers"
    })
  },
  mounted() {
    this.$store.dispatch("app/showNavbar", false);
  }
};
</script>