<template>
  <div class="engage_progress_item_container">
    <div class="engage_progress_item_container-icons">
      <b-badge
        variant="primary"
        class="engage_progress_item_container-usercount"
      >
        <b-avatar
          variant="primary"
          class="engage_progress_item_container-usercount-badge"
        ></b-avatar>
        <span class="engage_progress_item_container-usercount-text"
          >{{ item.userCount }}
        </span>
      </b-badge>
      <div class="engage_progress_item_container-icons-milestone">
        <div
          class="engage_progress_item_container-icons-milestone-line"
          :class="{ 'milestone-line-active': itemMeta.itemIndex !== 1 }"
        ></div>
        <div class="engage_progress_item_container-icons-milestone-container">
          <div :class="`milestone_rank_${itemMeta.itemIndex}`"></div>
        </div>
        <div
          v-if="itemMeta.itemIndex !== itemMeta.count"
          class="engage_progress_item_container-icons-milestone-line milestone-line-active"
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
export default {
  props: {
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
};
</script>

<style lang="scss" href="../../../../scss/_icons.scss"></style>
<style scoped>
.milestone_rank_1 {
  width: 50px;
  height: 50px;
  background: url("../../../../assets/milestones_sprite.png") -80px -220px;
  transform: scale(0.8) translate(10px, 10px);
}

.milestone_rank_2 {
  width: 50px;
  height: 50px;
  background: url("../../../../assets/milestones_sprite.png") -150px -220px;
  transform: scale(0.8) translate(10px, 10px);
}

.milestone_rank_3 {
  width: 50px;
  height: 50px;
  background: url("../../../../assets/milestones_sprite.png") -220px -220px;
  transform: scale(0.8) translate(10px, 10px);
}

.milestone_rank_4 {
  width: 50px;
  height: 50px;
  background: url("../../../../assets/milestones_sprite.png") -290px -80px;
  transform: scale(0.8) translate(10px, 10px);
}

.milestone_rank_5 {
  width: 50px;
  height: 50px;
  background: url("../../../../assets/milestones_sprite.png") -290px -10px;
  transform: scale(0.8) translate(10px, 10px);
}

.milestone_rank_6 {
  width: 50px;
  height: 50px;
  background: url("../../../../assets/milestones_sprite.png") -290px -220px;
  transform: scale(0.8) translate(10px, 10px);
}
.milestone_rank_7 {
  width: 50px;
  height: 50px;
  background: url("../../../../assets/milestones_sprite.png") -290px -150px;

  transform: scale(0.8) translate(10px, 10px);
}

.milestone_rank_8 {
  width: 50px;
  height: 50px;
  background: url("../../../../assets/milestones_sprite.png") -10px -80px;
  transform: scale(0.8) translate(10px, 10px);
}
.milestone_rank_9 {
  width: 50px;
  height: 50px;
  background: url("../../../../assets/milestones_sprite.png") -10px -10px;
  transform: scale(0.8) translate(10px, 10px);
}

.milestone_rank_10 {
  width: 50px;
  height: 50px;
  background: url("../../../../assets/milestones_sprite.png") -80px -10px;
  transform: scale(0.8) translate(10px, 10px);
}

.milestone_rank_11 {
  width: 50px;
  height: 50px;
  background: url("../../../../assets/milestones_sprite.png") -80px -80px;
  transform: scale(0.8) translate(10px, 10px);
}

.milestone_rank_12 {
  width: 50px;
  height: 50px;
  background: url("../../../../assets/milestones_sprite.png") -150px -10px;
  transform: scale(0.8) translate(10px, 10px);
}

.milestone_rank_13 {
  width: 50px;
  height: 50px;
  background: url("../../../../assets/milestones_sprite.png") -150px -80px;
  transform: scale(0.8) translate(10px, 10px);
}

.milestone_rank_14 {
  width: 50px;
  height: 50px;
  background: url("../../../../assets/milestones_sprite.png") -10px -150px;
  transform: scale(0.8) translate(10px, 10px);
}

.milestone_rank_15 {
  width: 50px;
  height: 50px;
  background: url("../../../../assets/milestones_sprite.png") -80px -150px;
  transform: scale(0.8) translate(10px, 10px);
}

.milestone_rank_16 {
  width: 50px;
  height: 50px;
  background: url("../../../../assets/milestones_sprite.png") -150px -150px;
  transform: scale(0.8) translate(10px, 10px);
}

.milestone_rank_17 {
  width: 50px;
  height: 50px;
  background: url("../../../../assets/milestones_sprite.png") -220px -10px;
  transform: scale(0.8) translate(10px, 10px);
}

.milestone_rank_18 {
  width: 50px;
  height: 50px;
  background: url("../../../../assets/milestones_sprite.png") -220px -80px;
  transform: scale(0.8) translate(10px, 10px);
}

.milestone_rank_19 {
  width: 50px;
  height: 50px;
  background: url("../../../../assets/milestones_sprite.png") -220px -150px;
  transform: scale(0.8) translate(10px, 10px);
}

.milestone_rank_20 {
  width: 50px;
  height: 50px;
  background: url("../../../../assets/milestones_sprite.png") -10px -220px;
  transform: scale(0.8) translate(10px, 10px);
}
</style>
<style scoped>
.engage_progress_item_container {
  height: 100%;
  width: 100%;
	min-width:230px;
	max-width: 85%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
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
/* .milestone-line.line-last-container-action {
  cursor: pointer;
} */

.engage_progress_item_container-icons {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.engage_progress_item_container-icon {
  transform: scale(0.8) translate(0px, 10px);
}
</style>
