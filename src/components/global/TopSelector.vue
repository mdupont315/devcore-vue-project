<template>
  <div class="top-selector" :class="{expanded:expanded}">
    <div class="title">{{ title }}</div>
    <div ref="currentSelection" class="current-selection" @click="toggle">
      <div class="text-overflow">
        <slot name="current" v-bind="{value:this.currentItem, items:items}">{{$t('All')}}</slot>
      </div>
    </div>
    <div class="selector-wrapper">
      <b-popover :target="()=>$refs.currentSelection" placement="bottom">
        <div class="top-selector-content">
          <div class="content">
            <div
              v-for="(item,index) in items"
              :key="index"
              class="item"
              :class="{active:isItemActive(item)}"
            >
              <slot name="item" v-bind="{item:item, items:items}">{{ item }}</slot>
            </div>
          </div>
        </div>
      </b-popover>
    </div>
  </div>
</template>
<script>
export default {
  name: "TopSelector",
  props: {
    items: {
      default: () => [],
      required: false,
      type: Array
    },
    input: {
      type: Object,
      required: false,
      default: () => null
    },
    itemComparatorFn: {
      type: Function,
      required: false
    },
    title: {
      required: false
    }
  },
  data: () => ({
    expanded: false,
    currentItem: null
  }),
  mounted() {
    this.currentItem = this.input;
  },
  methods: {
    isItemActive(item) {
      if (this.itemComparatorFn) {
        return this.itemComparatorFn(this.currentItem, item);
      }
      return this.currentItem == item;
    },
    toggle() {
      this.expanded = !this.expanded;
      this.$emit("toggled", this.expanded);
    }
  }
};
</script>