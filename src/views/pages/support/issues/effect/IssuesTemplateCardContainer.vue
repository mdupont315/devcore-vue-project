<template>
  <div
    :style="{ width: tableWidth * 0.74 + 'px' }"
    ref="issuesTemplateCardContainer"
    class="issues-template-card-container"
  >
    <slot></slot>
  </div>
</template>


<script>
export default {
  methods: {
    toggleOverlay() {
      console.log("toggle");
    },
    consoleit(ue) {
      console.log(ue);
    },
  },
  props: {
    items: {
      required: false,
      default: () => [],
    },
    tableWidth: {
      required: false,
      default: () => 1582,
    },
  },
};
</script>

<style scoped>
.issues-template-card-container {
  height: 100%;
  min-height: 565px;
  position: absolute;
  top: 0px;
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  right: 400px;
  margin: 0px 10px;
  overflow: scroll;
  border-radius: 5px;
}
</style>
