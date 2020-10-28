<template>
  <div>
    <process-selector max-level="process" show-count="items" section="process" :allowEdit="true" :onApply="onApply"></process-selector>
  </div>
</template>
<script>
export default {
  methods: {
   async onApply(args) {
      if (args.process) {
       await this.$store.dispatch("process/findById", { id: args.process.id });
      }
    }
  }
};
</script>