<template>
  <div @click="toggleCreateForm(item)" style="cursor: pointer">
    <div
      class="engage_progress_container_body_item-action-center"
      v-if="itemMeta.itemIndex !== itemMeta.count"
    >
      <b-button
        class="milestone-line line-center-container-icon"
        pill
        variant="outline-primary"
        :id="`btnMilestone-${item.id}`"
        :class="{ buttonActivated: item.id === item._clickedIndex }"
      >
        <i class="mdi mdi-plus"></i>
      </b-button>
    </div>
    <div
      class="engage_progress_container_body_item-action-last"
      style="margin-top: 15px"
      v-else
    >
      <b-button
        class="milestone-line line-last-container-icon line-center-container-icon"
        pill
        variant="outline-primary"
        :id="`btnMilestone-${item.id}`"
        :class="{ buttonActivated: item.id == item._clickedIndex }"
      >
        <i class="mdi mdi-plus" style="color: #fff"></i>
      </b-button>
    </div>
    <b-popover
      ref="popover"
      :target="`btnMilestone-${item.id}`"
      :show.sync="isPopoverOpen"
      placement="bottom"
      class="form-popover"
    >
      <b-card no-body style="width: 300px">
        <b-card-body
          ><milestone-form
            :itemMeta="itemMeta"
            :item="item"
          ></milestone-form> </b-card-body
      ></b-card>
    </b-popover>
  </div>
</template>

<script>
import MilestoneForm from "./Form.vue";

export default {
  components: {
    "milestone-form": MilestoneForm,
  },
  props: {
    itemMeta: {
      type: Object,
      required: false,
      default: () => {},
    },
    item: {
      type: Object,
      required: false,
      default: () => {},
    },
  },
  computed: {
    isPopoverOpen: {
      get() {
        return this.item.id === this.item._clickedIndex;
      },
      set(value) {
        this.popoverState = value;
      },
    },
  },
  data: () => {
    return {
      popoverState: false,
      clickedIndex: null,
    };
  },

  methods: {
    toggleCreateForm(item) {
      this.$emit("toggle", item);
    },
  },
};
</script>

<style>
.milestone-line.line-last-container-line {
  flex-grow: 1;
  border-bottom: 2px solid lightgray;
}

.milestone-line.line-center-container-icon.buttonActivated {
  z-index: 1;
  align-items: center;
  font-size: 20px;
  color: white;
  background: #4294d0;
}

.engage_progress_item_container-icons-milestone-line.milestone-line-active {
  border-bottom: 2px solid lightgray;
}
.engage_progress_container_body_item-action-last
  > .milestone-line.line-last-container-icon {
  font-size: 42px;
  max-height: 50px;
  cursor: pointer;
  transform: translate(-50px, 0px);
  align-items: center;
  font-size: 20px;
  transform: translate(-30px, 28px);
  background: #4294d0;
  color: #fff;
}
.milestone-line.line-center-container-icon:hover {
  color: #fff;
}

.milestone-line.line-center-container-icon {
  align-items: center;
  font-size: 20px;
  content: "\F417";
  color: #4294d0;
  box-shadow: rgb(0 0 0 / 35%) 0px 5px 15px;
  height: 32px;
  width: 32px;
  cursor: pointer;
  border-radius: 100%;
  display: flex;
  margin-left: 22px;
  margin: 0;
  flex-direction: column;
  align-self: center;
  justify-content: center;
}
.engage_progress_container_body_item-action-last {
  margin: 30px 20px 0 20px;
}
.engage_progress_container_body_item-action-center {
  display: flex;
  flex-direction: column;
  margin-top: 45px;
  width: 60px;
  text-align: center;
}
.engage_progress_container_body_item-action-center,
.engage_progress_container_body_item-action-last {
  content: "\F417";
  z-index: 1;
  font-size: 20px;
}
</style>
