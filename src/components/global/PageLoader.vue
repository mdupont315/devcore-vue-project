<template>
  <div class="page-loader">
    <b-spinner :variant="variant" class="spinner"></b-spinner>
  </div>
</template>
<script>
export default {
  name: "page-loader",
  props: {
    variant: {
      type: String,
      required: false,
      default: () => "white"
    }
  }
};
</script>