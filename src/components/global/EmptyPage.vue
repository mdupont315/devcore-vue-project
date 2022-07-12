<template>
  <div class="empty-page" style="height: 100%; max-height: 94.8vh">
    <slot name="icon">
      <div class="h3 text-center">
        <i :class="`mdi ${getIcon} text-white`" style="font-size: 100px"></i>
      </div>
    </slot>
    <slot name="default">
      <div class="h2 text-center text-white">
        {{ $t("Just the empty space...") }}
      </div>
    </slot>
    <div class="text-center text-white">
      <slot name="content"></slot>
    </div>
  </div>
</template>
<script>
const mdi_icons = Object.freeze({
  empty_space: "mdi-flask-empty-outline",
  work_in_progress: "mdi mdi-tools",
});

export default {
  name: "EmptyPage",
  props: {
    iconType: {
      type: String,
      required: false,
      default: "empty_space",
    },
  },
  computed: {
    getIcon: {
      get() {
        return mdi_icons[this.iconType];
      },
    },
  },
};
</script>
