<template>
  <div
    @mouseover="setSelectionOpen(true)"
    @mouseleave="setSelectionOpen(false)"
  >
    <div
      class="menubar-header-menu-grid"
      :class="{ 'menu-grid-is-active': selectionOpen || selecting }"
      ref="menuListButtonHeading"
    >

      <svg class="remix">
        <use :xlink:href="`${remixiconUrl}#ri-${item.icon}`" />
      </svg>
    </div>
    <b-popover
      class="menu-grid-items"
      triggers="hover"
      boundary="window"
      :target="() => $refs.menuListButtonHeading"
      placement="bottom"
    >
      <div
        class="menu-grid-item-container"
        @mouseenter="selecting = true"
        @mouseleave="selecting = false"
      >
        <div
          v-for="(listItem, index) in allItems"
          :key="index"
          :class="`menu-grid-item menu-grid-item-${
            listItem.title
          } ${isItemActive()}`"
          @click="invokeGridItemAction(listItem, index)"
        >
          <svg class="remix">
            <use :xlink:href="`${remixiconUrl}#ri-${listItem.icon}`" />
          </svg>
        </div>
      </div>
    </b-popover>
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
    activeIcon: {
      type: String,
      required: true,
    },
    allItems: {
      type: Array,
      required: true,
    },
  },
  methods: {
    isItemActive() {
      return "item-not-active";
      // const item = this.item.listItems.find((t) => t.title == "item");
      // return item.isActive() ? "item-active" : "item-not-active";
    },
    invokeGridItemAction(listItem, index) {
      this.toggleSelection();
      listItem.action();
    },
    setSelectionOpen(val) {
      setTimeout(() => {}, 500);
      if (!val && !this.selecting) {
        this.selectionOpen = val;
      } else {
        this.selectionOpen = val;
      }
    },
    toggleSelection() {
      this.selectionOpen = !this.selectionOpen;
    },
  },
  data() {
    return {
      selectionOpen: false,
      remixiconUrl,
      selecting: false,
    };
  },
};
</script>

<style lang="scss" scoped>
.remix {
  width: 20px;
  height: 20px;
}
.menu-grid-item-container {
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(3, 1fr);
  padding: 10px;
}
.menu-grid .menu-grid-item:hover {
  background: #4294d0;
  color: #fff;
}

.menu-grid-items {
  position: fixed;
  background: #fff;
  color: #000;
  cursor: pointer;
  border: 1px solid #000;
}
.menu-grid-item {
  &.menu-grid-item-link {
    & > svg {
      transform: rotate(45deg);
    }
  }
  padding: 10px;
  background: #fff;
  width: 100%;
  border-radius: 3px;
  max-height: 40px;
  max-width: 40px;
  cursor: pointer;
  &.item-not-active:not(.menu-grid-item-item) {
    background: #fff;
    &:hover {
      background: #4294d0;
      > svg > use {
        fill: #fff;
      }
    }
    & > svg > use {
      fill: #000;
    }
  }
}

.menu-grid {
  display: flex;
  height: 40px;
  width: 40px;
  z-index: 1;
  color: #0d0d0d;
  border: none;
  background-color: transparent;
  border-radius: 3px;

  svg {
    width: 20px;
    height: 20px;
    fill: currentColor;
  }
}
.menu-grid-is-active {
  &:hover {
    background: #4294d0;
    & > svg > use {
      fill: #fff;
    }
  }
  & svg {
    fill: #000;
  }
}

.menubar-header-menu-grid {
  padding: 1rem;
  display: flex;
  color: #0d0d0d;
  border: none;
  background-color: #fff;
  border-radius: 0.4rem;
  padding: 0.25rem;
  margin-right: 0.25rem;
  cursor: pointer;
  max-width: 28px;
  max-height: 28px;
  margin: auto;
  &.menu-grid-is-active {
    background-color: #4294d0 !important;
    & > svg > use {
      fill: #fff;
    }
  }
}
</style>
