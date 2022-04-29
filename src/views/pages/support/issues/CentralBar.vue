<template>
  <div>
    <process-selector max-level="process" section="issues" :on-apply="onApply"></process-selector>
  </div>
</template>
<script>
export default {
  methods: {
    async onApply(args) {
      if (args.process) {
        await this.$store.dispatch("process/findById", { id: args.process.id });
        await this.$store.dispatch("issue/findByProcess", {
          id: args.process.id
        });
      }
    }
  }
};
</script>