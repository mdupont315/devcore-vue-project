<template>
  <b-input v-bind="$attrs" @focus="focus" />
</template>
<script>
export default {
  name: "select-all-input",
  methods: {
    focus(event) {
      this.$el.focus();
      this.$el.select();
      this.$emit("focus", event);
    }
  }
};
</script>