<template>
  <div class="engage_progress_container_body_item-container">
    <div
      v-if="itemMeta.itemIndex !== itemMeta.count"
      class="engage_progress_container_body_item-action-center"
    >
      <b-button
        @click="toggleCreateForm(item)"
        class="milestone-line line-center-container-icon"
        pill
        variant="outline-primary"
        :id="`btnMilestone-${item.id}`"
        :class="{ buttonActivated: item.id === item._clickedIndex }"
      >
        <i class="mdi mdi-plus"></i>
      </b-button>
    </div>
    <div class="engage_progress_container_body_item-action-last" v-else>
      <b-button
        @click="toggleCreateForm(item)"
        class="
          milestone-line
          line-last-container-icon line-center-container-icon
        "
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
      :show="isPopoverOpen"
      placement="bottom"
      class="form-popover"
    >
      <b-card no-body style="width: 300px">
        <b-card-body
          ><milestone-form
            :itemMeta="itemMeta"
            :item="item"
            @close="closePopover"
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
    isEditing: {
      type: Boolean,
      required: false,
      default: () => false,
    },
    isDefault: {
      type: Boolean,
      required: false,
      default: () => false,
    },
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
    openFormId: {
      type: String,
      required: false,
      default: () => null,
    },
  },

  computed: {
    isPopoverOpen: {
      get() {
        return this.openFormId == this.item.id;
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
    closePopover() {
			console.log("CLOSE1");
      this.$emit("close");
    },
    toggleCreateForm(item) {
			console.log("TOGGLE");
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

.milestone-line.line-center-container-icon.buttonActivated,
.milestone-line.line-last-container-icon.buttonActivated {
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
  align-items: center;
  font-size: 20px;
  background: #4294d0;
  color: #fff;
}
.milestone-line.line-center-container-icon:hover {
  color: #fff;
}

.engage_progress_container_body_item-container {
  cursor: pointer;
  width: 100%;
  z-index: 1;
  margin-top: 47px;
}

.milestone-line.line-center-container-icon {
  align-items: center;
  font-size: 20px;
  content: "\F417";
  color: #4294d0;
  box-shadow: rgb(0 0 0 / 35%) 0px 5px 15px;
  height: 28px;
  width: 28px;
  cursor: pointer;
  border-radius: 100%;
  display: flex;
  margin-left: 22px;
  margin: 0;
  flex-direction: column;
  align-self: center;
  justify-content: center;
}

.engage_progress_container_body_item-action-center {
  display: flex;
  flex-direction: column;
  text-align: center;
}
.engage_progress_container_body_item-action-center,
.engage_progress_container_body_item-action-last {
  content: "\F417";
  z-index: 1;
  font-size: 20px;
  display: flex;
  place-content: center;
}
</style>
