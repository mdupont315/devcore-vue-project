<template>
  <div class="layout">
    <main class="main">
      <slot />
    </main>
  </div>
</template>
<script>
export default {
  name: "ExternalLayout",
  mounted() {
    this.$store.dispatch("app/showNavbar", false);
  }
};
</script>
