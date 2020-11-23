<template>
  <b-button v-bind="$attrs" @click="click">
    <b-spinner v-if="loading" small></b-spinner> <slot />
  </b-button>
</template>
<script>
export default {
  name: "LoadingButton",
  props: {
    loading: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  methods:{
    click(event){
      this.$emit("click", event)
    }
  }
};
</script>