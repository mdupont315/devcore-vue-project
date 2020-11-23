<template>
  <div v-if="user" class="layout">
    <top-nav></top-nav>
    <div id="content-wrapper" class="content">
      <main-nav></main-nav>
      <main id="main" class="main">
        <div class="wrapper">
          <slot />
        </div>
      </main>
    </div>
  </div>

</template>
<script>
import { /* mapState, */ mapGetters } from "vuex";
import TopNav from "./components/TopNav";
import MainNav from "./components/MainNav";

export default {
  name: "DefaultLayout",
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
