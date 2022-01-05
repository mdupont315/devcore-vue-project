<template>
  <div ref="issuesTemplateCardContainer" class="issues-template-card-container">
    <div
      class="issues-template-card-container-items"
      id="issues-template-card-container"
      @click="toggleOverlay"
      ref="issues-template-card-container"
      :style="{ width: tableWidth * 0.7 + 'px' }"
    >
      <slot></slot>
    </div>
  </div>
</template>


<script>
export default {
  methods: {
    toggleOverlay($event) {
      const clickEmpty =
        $event.target.getAttribute("id") ==
        this.$el.firstChild.getAttribute("id");

      if (clickEmpty) {
        this.$emit("toggleOverlay");
      }
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

<style>
.issueEffectAddForm-form-popover[x-placement="bottom"]
  > .popover-body
  > .card
  > div
  > div
  > .issues-template-card-container {
  justify-content: flex-end;
}

.issueEffectAddForm-form-popover[x-placement="top"]
  > .popover-body
  > .card
  > div
  > div
  > .issues-template-card-container {
  justify-content: flex-start;
}

.issueEffectAddForm-form-popover[x-placement="bottom"]
  > .popover-body
  > .card
  > div
  > div
  > .issues-template-card-container {
  justify-content: flex-start;
}

.issueEffectAddForm-form-popover[x-placement="top"]
  > .popover-body
  > .card
  > div
  > div
  > .issues-template-card-container {
  top: -170px;
  height: 100%;
  justify-content: flex-end;
}
</style>
<style scoped>
.issues-template-card-container-items {
  display: flex;
  overflow: scroll;
  flex-direction: row-reverse;
  height: 100%;
  flex-wrap: wrap;
	scrollbar-width: none;
	overscroll-behavior: none;
}
.issues-template-card-container {
	scrollbar-width: none;
  height: 100%;
  overflow: hidden;
  display: flex;
  min-height: 404px;
  max-height: 404px;
  top: 0px;
  right: 100%;
  margin: 0px 10px;
  border-radius: 5px;
  position: fixed;
  min-height: 585px;
}
</style>
