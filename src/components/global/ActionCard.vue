<template>
  <div class="action-card" :class="dataMode">
    <b-card class="wrapper" no-body>
      <div class="placeholder" @click="toggleContent" v-if="!showContent">
        <slot name="placeholder">Add new item</slot>
      </div>
      <div class="content-wrapper" v-if="showContent">
        <inner-overlay @click="toggleContent"></inner-overlay>
        <div class="content">
          <slot name="default"></slot>
        </div>
      </div>
    </b-card>
  </div>
</template>
<script>
export default {
  name: "action-card",
  props: {
    mode: {
      required: false,
      default: () => "no-mode"
    }
  },
  data: () => ({
    dataMode: "no-mode",
    showContent: false
  }),
  mounted() {
    this.dataMode = this.mode;
  },
  methods: {
    changeMode(mode) {
      if (mode) {
        this.dataMode = "mode-" + mode;
      } else {
        this.dataMode = "no-mode";
      }
      this.$emit("beforeModeChange", this.mode);
      this.showContent = mode;
      this.$emit("toggled", this.showContent);
    },
    toggleContent() {
      this.$emit("beforeToggle", !this.showContent);
      this.showContent = !this.showContent;
      if (this.showContent) {
        this.dataMode = "mode-edit";
      } else {
        this.dataMode = "no-mode";
      }
      this.$emit("toggled", this.showContent);
    }
  }
};
</script>