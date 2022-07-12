<template>
  <b-button v-bind="$attrs" @click="click" :variant="buttonVariant">
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
    },
    buttonVariant: {
      required: false,
      default: () => "outline-primary",
    },
  },
  methods:{
    click(event){
      this.$emit("click", event)
    }
  }
};
</script>
