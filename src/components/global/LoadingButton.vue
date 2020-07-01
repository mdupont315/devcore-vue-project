<template>
  <b-button v-bind="$attrs" @click="click">
    <b-spinner small v-if="loading"></b-spinner> <slot />
  </b-button>
</template>
<script>
export default {
  name: "loading-button",
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