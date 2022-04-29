<template>
  <div
    class="overlay"
    id="inner_overlay"
    style="overscroll-behavior: contain"
    v-bind="$attrs"
    @click="$emit('click')"
  ></div>
</template>
<script>
export default {
  name: "InnerOverlay",
};
</script>
