<template>
    <router-view></router-view>
</template>
<script>
export default {
  data: () => ({
    currentComponent: null,
  }),
  async mounted() {
    //  await this.$store.dispatch("processStage/findAll");
    //  await this.$store.dispatch("processOperation/findAll");
    //  await this.$store.dispatch("processPhase/findAll");
  },
};
</script>
