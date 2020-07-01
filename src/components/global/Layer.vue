<template>
  <div class="layer" v-if="show">
    <inner-overlay style="z-index:1" @click="close" v-if="showOverlay" :class="backdropClass"></inner-overlay>
    <div style="z-index:2;position:absolute;width:100%">
      <slot name="default"></slot>
    </div>
  </div>
</template>
<script>
import { /*mapState,*/ mapGetters } from "vuex";
export default {
  name: "layer",
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
      get: function() {
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
    //controller.addLayer(this)
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