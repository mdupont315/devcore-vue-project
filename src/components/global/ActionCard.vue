<template>
  <div class="action-card" :class="dataMode">
    <b-card class="wrapper" no-body>
      <div v-if="!showContent" class="placeholder" @click="toggleContent">
        <slot name="placeholder">Add new item</slot>
      </div>
      <div v-if="showContent" class="content-wrapper">
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
  name: "ActionCard",
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
			console.log(mode);
      if (mode) {
        this.dataMode = `mode-${mode}`;
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
