<template>
  <input />
</template>

<script>
import remixiconUrl from "@/assets/img/remixicon.symbol.svg";

export default {
  props: {
    item: {
      type: Object,
      required: true,
    },
  },

  methods: {
    previewFiles(event) {
      this.item.action(event.target.files);
    },
  },
  data() {
    return {
      remixiconUrl,
    };
  },
};
</script>

