<template>
  <div>
    <process-selector
      max-level="process"
      section="analysis"
      :onApply="onApply"
    ></process-selector>
  </div>
</template>
<script>
export default {
  methods: {
    async onApply(args) {
      if (args.process) {
        await this.$store.dispatch("process/findById", { id: args.process.id });
        await this.$store.dispatch("project/findByProcess", {
          id: args.process.id
        });
      }
    }
  }
};
</script>