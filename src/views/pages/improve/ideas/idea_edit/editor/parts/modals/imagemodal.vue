<template>
  <div>
		<div v-if="getValue">
			<layer style="z-index:2"/>
			image
		</div>
	</div>
</template>

<script>
export default {
  props: {
    value: {
      type: Boolean,
      default: () => false,
    },
  },
  computed: {
    getValue: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit("close", value);
      },
    },
  },
};
</script>

<style></style>
