<template>
  <div class="menubar-item-field-container">
    <div
      class="menu-item"
      :class="{ 'is-active': item.isActive ? item.isActive() : null }"
      @click="item.action"
      :title="item.title"
    >
      <svg class="remix" width="20" height="20">
        <use :xlink:href="`${remixiconUrl}#ri-${item.icon}`" />
      </svg>
    </div>
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

  data() {
    return {
      remixiconUrl,
    };
  },
};
</script>

<style lang="scss" scoped>
.menubar-item-field-container {
  width: 100%;
  height: 100%;
  display: flex;
  max-width: 50px;
  max-height: 50px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.menu-item {
  padding: 1rem;
  display: flex;
  color: #0d0d0d;
  border: none;
  background-color: transparent;
  border-radius: 0.4rem;
  padding: 0.25rem;
  margin-right: 0.25rem;
  cursor: pointer;
  max-width: 30px;
  max-height: 30px;
  margin: auto;

  svg {
    width: 100%;
    height: 100%;
    fill: currentColor;
  }

  &.is-active,
  &:hover {
    color: #fff;
    background-color: #0d0d0d;
  }
}
</style>
