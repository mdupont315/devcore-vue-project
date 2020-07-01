<template>
  <b-textarea v-bind="$attrs" @focus="focus"></b-textarea>
</template>
<script>
export default {
  name: "select-all-textarea",
  methods: {
    focus(event) {
      this.$el.focus();
      this.$el.select();
      this.$emit("focus", event);
    }
  }
};
</script>