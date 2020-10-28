<template>
  <div class="unblock-loader" :class="getPositionClass()">
    <b-spinner variant="primary"></b-spinner>
  </div>
</template>
<script>
export default {
  name: "unblock-loader",
  props: {
    position: {
      required: false
    }
  },
  methods: {
    getPositionClass() {
      switch (this.position) {
        case "bottom":
          return { "unblock-loader-bottom": true };
        default:
          return "";
      }
    }
  }
};
</script>