<template>
  <div class="menubar-file-input-field-container">
    <label class="menubar-file-input-field">
      <svg class="remix" style="transform: translate(0px, 10px)">
        <use :xlink:href="`${remixiconUrl}#ri-${item.icon}`" />
      </svg>
      <input type="file" style="visibility: hidden" @change="previewFiles" />
    </label>
  </div>
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

<style lang="scss" scoped>
.menubar-file-input-field-container {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.menubar-file-input-field {
  width: 50px;
  text-align: center;
  cursor: pointer;
  width: 100%;
  margin-bottom: 0px;
  height: 100%;




}
.menu-file {
  width: 1.75rem;
  height: 1.75rem;
  display: flex;
  color: #0d0d0d;
  border: none;
  background-color: transparent;
  border-radius: 0.4rem;
  padding: 0.25rem;
  margin-right: 0.25rem;

  svg {
    width: 100%;
    height: 100%;
    fill: currentColor;
  }
}
</style>
