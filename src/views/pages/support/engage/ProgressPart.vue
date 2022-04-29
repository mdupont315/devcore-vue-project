<template>
  <div class="engage_progress_item_container">
    <div class="engage_progress_item_container-icons">
      <div class="engage_progress_item_container-icons-badge-and-delete">
        <div>
          <b-badge
            variant="primary"
            class="engage_progress_item_container-usercount"
          >
            <b-avatar
              variant="primary"
              class="engage_progress_item_container-usercount-badge"
            ></b-avatar>
            <span class="engage_progress_item_container-usercount-text"
              >{{ getItemUsers }}
            </span>
          </b-badge>
        </div>
        <progress-delete
          v-show="isEditing && !item.isDefault"
          @remove="removeItem"
          :item="item"
          class="is-elevated-layer"
        >
        </progress-delete>
      </div>

      <div class="engage_progress_item_container-icons-milestone">
        <div
          class="engage_progress_item_container-icons-milestone-line"
          :class="{ 'milestone-line-active': itemMeta.itemIndex !== 1 }"
        ></div>
        <div class="engage_progress_item_container-icons-milestone-container">
          <div :class="getMilestoneRankIcon()"></div>
        </div>
        <div
          v-if="itemMeta.itemIndex !== itemMeta.count"
          class="
            engage_progress_item_container-icons-milestone-line
            milestone-line-active
          "
        ></div>
        <div
          v-else
          class="engage_progress_item_container-icons-milestone-line line-last"
        >
          <div class="milestone-line line-last-container">
            <div class="milestone-line line-last-container-line"></div>
          </div>
        </div>
      </div>
    </div>
    <slot></slot>
  </div>
</template>

<script>
import ProgressDelete from "./ProgressDelete.vue";

export default {
  components: {
    "progress-delete": ProgressDelete,
  },
  props: {
    isEditing: {
      type: Boolean,
      required: false,
      default: () => false,
    },
    item: {
      type: Object,
      required: false,
      default: () => {},
    },
    itemMeta: {
      type: Object,
      required: false,
      default: () => {},
    },
  },
  computed: {
    getItemUsers() {
      if (this.item.users) {
        return new Set(this.item.users.map((x) => x.userId)).size;
      } else {
        return "";
      }
    },
  },
  methods: {
    getMilestoneRankIcon() {
      if (this.item && this.item.isDefault) return `milestone_rank_0`;
      return `milestone_rank_${this.itemMeta.itemIndex}`;
    },
    removeItem(part) {
      this.$emit("removePart", part);
    },
  },
};
</script>
<style scoped>
/* Icons */

.milestone_rank_0 {
  width: 50px;
  height: 50px;
  background: url("~@/assets/sprite_star.png") 0 0;
  transform: scale(1) translate(10px, 10px);
}

.milestone_rank_1 {
  width: 50px;
  height: 50px;
  background: url("~@/assets/sprite_star.png") 0 -52px;
  transform: scale(1) translate(10px, 10px);
}

.milestone_rank_2 {
  width: 50px;
  height: 50px;
  background: url("~@/assets/sprite_star.png") 0 -104px;
  transform: scale(1) translate(10px, 10px);
}

.milestone_rank_3 {
  width: 50px;
  height: 50px;
  background: url("~@/assets/sprite_star.png") 0 -156px;
  transform: scale(1) translate(10px, 10px);
}

.milestone_rank_4 {
  width: 50px;
  height: 50px;
  background: url("~@/assets/sprite_star.png") 0 -208px;
  transform: scale(1) translate(10px, 10px);
}

.milestone_rank_5 {
  width: 50px;
  height: 50px;
  background: url("~@/assets/sprite_star.png") 0 -260px;
  transform: scale(1) translate(10px, 10px);
}
.milestone_rank_6 {
  width: 50px;
  height: 50px;
  background: url("~@/assets/sprite_star.png") 0 -312px;
  transform: scale(1) translate(10px, 10px);
}

.milestone_rank_7 {
  width: 50px;
  height: 50px;
  background: url("~@/assets/sprite_star.png") 0 -364px;
  transform: scale(1) translate(10px, 10px);
}
.milestone_rank_8 {
  width: 50px;
  height: 50px;
  background: url("~@/assets/sprite_star.png") 0 -416px;
  transform: scale(1) translate(10px, 10px);
}

.milestone_rank_9 {
  width: 50px;
  height: 50px;
  background: url("~@/assets/sprite_star.png") 0 -468px;
  transform: scale(1) translate(10px, 10px);
}

.milestone_rank_10 {
  width: 50px;
  height: 50px;
  background: url("~@/assets/sprite_star.png") 0 -518px;
  transform: scale(1) translate(10px, 10px);
}

.milestone_rank_11 {
  width: 50px;
  height: 50px;
  background: url("~@/assets/sprite_star.png") 0 -570px;
  transform: scale(1) translate(10px, 10px);
}

.milestone_rank_12 {
  width: 50px;
  height: 50px;
  background: url("~@/assets/sprite_star.png") 0 -622px;
  transform: scale(1) translate(10px, 10px);
}

.milestone_rank_13 {
  width: 50px;
  height: 50px;
  background: url("~@/assets/sprite_star.png") 0 -674px;
  transform: scale(1) translate(10px, 10px);
}

.milestone_rank_14 {
  width: 50px;
  height: 50px;
  background: url("~@/assets/sprite_star.png") 0 -726px;
  transform: scale(1) translate(10px, 10px);
}

.milestone_rank_15 {
  width: 50px;
  height: 50px;
  background: url("~@/assets/sprite_star.png") 0px -776px;
  transform: scale(1) translate(10px, 10px);
}

.milestone_rank_16 {
  width: 50px;
  height: 50px;
  background: url("~@/assets/sprite_star.png") 0px -820px;
  transform: scale(1) translate(10px, 10px);
}
</style>

<style scoped>
.engage_progress_item_container {
  height: 100%;
  width: 100%;
  min-width: 230px;
  max-width: 230px;
  /*   max-width: 85%; */
  display: flex;
  flex-direction: column;
  padding: 0 0 20px 0px;
}
.engage_progress_item_container-usercount {
  width: 40px;
  height: 25px;
  display: flex;
  flex-direction: row;
  transform: translate(0px, 5px);
}

.engage_progress_item_container-icons-milestone {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  flex-grow: 1;
}

.engage_progress_item_container-icons-milestone-container {
  box-shadow: rgb(0 0 0 / 35%) 0px 5px 15px;
  border-radius: 50%;
  text-align: center;
  width: 70px;
  height: 70px;
  max-width: 70px;
  flex-grow: 1;
}

.engage_progress_item_container-icons-milestone-line {
  align-self: center;
  flex-grow: 2;
}

.engage_progress_item_container-icons-milestone-line.line-last {
  flex-grow: 2;
  justify-content: flex-end;
}

.milestone-line.line-last-container {
  justify-content: flex-end;
  display: flex;
  place-items: center;
}

.engage_progress_item_container-usercount-text {
  align-self: center;
}

.engage_progress_item_container-usercount-badge {
  width: 25px;
  height: 20px;
}

.engage_progress_item_container-icons-badge-and-delete {
  display: flex;
  margin-left: 50px;
  width: 90px;
}
.engage_progress_item_container-icons {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.engage_progress_item_container-icon {
  transform: scale(1) translate(0px, 10px);
}
</style>
