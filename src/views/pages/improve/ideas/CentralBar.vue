<template>
  <div>
    <process-selector
      max-level="phase"
      show-count="ideas"
      section="ideas"
      :list="{withStages:true}"
      :detail="{withStagesFull:true}"
    ></process-selector>
  </div>
</template>
<script>
export default {
  async mounted() {
    //await this.$store.dispatch("idea/findAll");
  },
  methods: {
    async onSelectionChange(section, item) {
      try {
        if (section === "process") {
          await this.$store.dispatch("idea/findByProcess", { id: item.id });
        }
      } catch (ex) {
        console.log(ex);
      }
    }
  }
};
</script>