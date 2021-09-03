<template>
  <div class="overlay" v-bind="$attrs" @click="$emit('click')">
<!--       <div style="width: 200px; height:4000vh; overflow:scroll; background: red">WTF</div>
 -->  </div>
</template>
<script>
export default {
  name: "InnerOverlay",
  /*   props: {
    scrollable: {
      type: Boolean,
      default: false,
    },
  }, */
/*   computed: {
    getScrollTop() {
      if (this.$el) {
        console.log(this.$el.children[0].offsetTop);
        return this.$el.children[0].offsetTop;
      }
      return 0;
    },
  },
  watch: {
    getScrollTop: {
      handler(e) {
        console.log(e);
        this.$emit("overlayScroll", e);
      },
    },
  },
  beforeDestroy() {
    window.removeEventListener("wheel", this.handleScroll);
  },
  mounted() {
    console.log("add");
    window.addEventListener("wheel", this.handleScroll);
  },
  methods: {
    handleScroll(e) {
			console.log(e);
			this.$emit("overlayScroll", e.deltaY)
		},
  }, */
};
</script>
