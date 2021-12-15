<template>
  <div>
    <process-selector max-level="process" @nullifyProcess="section = null" show-count="items" :section="section" :allow-edit="true" :on-apply="onApply"></process-selector>
  </div>
</template>
<script>
export default {
 data: () => ({
    section: "process",
  }),
  methods: {
   async onApply(args) {
      if (args.process) {
       await this.$store.dispatch("process/findById", { id: args.process.id });
      }
    }
  }
};
</script>
