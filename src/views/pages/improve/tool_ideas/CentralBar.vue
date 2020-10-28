<template>
  <div>
    <process-selector
      max-level="phase"
      show-count="toolIdeas"
      section="toolIdeas"
      :list="{withStages:true}"
      :detail="{withStagesFull:true}"
    ></process-selector>
  </div>
</template>
<script>
export default {
  async mounted() {
    await this.$store.dispatch("toolIdea/findAll");
  },
  methods: {
    async onSelectionChange(section, item) {
      try {
        if (section === "process") {
          await this.$store.dispatch("toolIdea/findByProcess", { id: item.id });
        }
      } catch (ex) {
        console.log(ex);
      }
    }
  }
};
</script>