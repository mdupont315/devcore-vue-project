<template>
  <div v-if="show" class="layer">
    <inner-overlay v-if="showOverlay" style="z-index:1" :class="backdropClass" @click="close"></inner-overlay>
    <div style="z-index:2;position:absolute;width:100%">
      <slot name="default"></slot>
    </div>
  </div>
</template>
<script>
import { /* mapState, */ mapGetters } from "vuex";

export default {
  name: "Layer",
  props: {
    showBackdrop: {
      name: "show-backdrop",
      type: Boolean,
      required: false,
      default: () => true
    },
    backdropClass: {
      name: "backdrop-class",
      required: false,
    }
  },
  data: () => ({
    show: true
  }),
  computed: {
    ...mapGetters({
      current: "layers/current"
    }),
    showOverlay: {
      get() {
        return this.showBackdrop && this.current === this;
      }
    }
  },
  mounted() {
    this.$store.dispatch("layers/addLayer", this);
  },
  beforeDestroy() {
    this.$store.dispatch("layers/removeLayer", this);
  },
  updated() {
    // controller.addLayer(this)
  },
  methods: {
    close(event) {
      this.$store.dispatch("layers/removeLayer", this);
      this.show = false;
      this.$emit("closed", event);
    }
  }
};
</script>
