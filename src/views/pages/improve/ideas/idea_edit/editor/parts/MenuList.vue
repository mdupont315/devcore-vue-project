<template>
  <div>
    <b-button
      class="menu-list"
      :title="item.title"
      ref="btnMenuListPopover"
      tabindex="0"
      :class="{ 'is-active': selectionOpen }"
      style="width: 100%; height: 100%; margin: 0"
    >
      <div class="menu-list-active-text" @click="setActive(activeIcon)">
        <div class="menu-list-active-text-icon">
          {{ getActiveText(activeIcon) }}
        </div>
      </div>
      <!-- <svg class="remix">
        <use :xlink:href="`${remixiconUrl}#ri-${activeIcon}`" />
      </svg> -->
    </b-button>
    <b-popover
      ref="menuList-popover"
      class="menu-list-items"
      triggers="hover"
      :target="() => $refs.btnMenuListPopover"
      placement="bottom"
    >
      <b-card no-body style="align-items: center; width: 150px">
        <div
          v-for="(listItem, index) in item.listItems"
          :key="index"
          @click="invokeListItemAction(listItem, index)"
          class="menu-list-item"
          :class="{ 'is-active': activeHeadingIndex == index }"
          :style="{
            color: getHeadingColor(listItem),
          }"
          style="width: 100%; font-size: 1.25rem; padding: 10px"
        >
          <span>{{ getActiveText(listItem.icon) }} </span> {{ listItem.title }}
        </div></b-card
      >
    </b-popover>
  </div>
</template>

<script>
import remixiconUrl from "@/assets/img/remixicon.symbol.svg";

const fontLevels = {
  "Heading 1": 1,
  "Heading 2": 2,
  "Heading 3": 3,
};
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
  },
  methods: {
    setActive(active) {
      const thisItem = this.item.listItems.find((x) => x.icon === active);
      thisItem.action();
    },
    getActiveText(active) {
      let ret = "P";
      switch (active) {
        case "h-3":
          ret = "S";
          break;
        case "h-2":
          ret = "T";
          break;
        case "h-1":
          ret = "C";
      }

      return ret;
    },
    invokeListItemAction(listItem, index) {
      this.setActiveHeadingIndex(index);
      listItem.action();
    },
    setActiveHeadingIndex(index) {
      if (this.activeHeadingIndex !== index) {
        this.activeHeadingIndex = index;
      } else {
        this.activeHeadingIndex = null;
      }
    },
    toggleSelection() {
      this.selectionOpen = !this.selectionOpen;
    },
    // getHeadingFontSize(item) {
    //   if (!item || !item.title) return;
    //   let ret = "1rem";
    //   switch (fontLevels[item.title]) {
    //     case 3:
    //       ret = "12px";
    //       break;
    //     case 2:
    //       ret = "14px";
    //       break;
    //     case 1:
    //       ret = "20px";
    //   }
    //   return ret;
    // },
    getHeadingColor(item) {
      if (!item || !item.title) return;
      let ret = "1rem";
      switch (fontLevels[item.title]) {
        case 3:
          ret = "#000";
          break;
        case 2:
          ret = "#4294d0";
          break;
        case 1:
          ret = "#0D0D0D";
      }
      return ret;
    },
  },

  data() {
    return {
      selectionOpen: false,
      activeHeadingIndex: null,
      remixiconUrl,
    };
  },
};
</script>

<style lang="scss" scoped>
.menu-list-active-text {
  display: flex;
  width: 100%;
  height: 100%;
  font-size: 1.6rem;
  font-weight: 500;
  margin: 0px;
  align-items: center;
  justify-content: center;
}
.menu-list-active-text-icon {
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 5px;
  padding: 5px;
  border-radius: 5px;
  &.is-active,
  &:hover {
    color: #fff;
    background-color: #4294d0;
  }
}
.menu-list-item.is-active {
  color: #f8f8f8;
  background: #4294d0;
}

.menu-list-item:hover {
  background: lightgray;
  color: #fff;
}

.menu-list-items {
  position: fixed;
  background: #fff;
  color: #000;
  cursor: pointer;
  border: 1px solid #000;
}
.menu-list-item {
  padding: 5px 10px;
  width: 100%;
  cursor: pointer;
  width: 100%;
  font-size: 1.5rem;
  padding: 10px;
}

.menu-list {
  height: 100%;
  width: 1.75rem;
  height: 1.75rem;
  display: flex;
  z-index: 1;
  color: #0d0d0d;
  border: none;
  background-color: transparent;
  border-radius: 0.4rem;
  padding: 0.25rem;
  margin-right: 0.5rem;

  svg {
    width: 100%;
    height: 100%;
    fill: currentColor;
  }
}
</style>
