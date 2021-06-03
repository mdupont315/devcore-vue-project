<template>
  <div class="engage_progress_container">
    <div class="engage_progress_container-header">
      <div class="engage_progress_container-header-edit">
        <div
          class="engage_progress_container_header-action"
          @click="toggleEdit"
        >
          <i class="mdi mdi-pencil engage-header-edit-icon"></i
          ><span class="engage_progress_container-header-edit-text">{{
            $t("Edit")
          }}</span>
        </div>
      </div>
    </div>
    <div
      class="engage_progress_container-body"
      style="display: flex; flex-direction: row"
    >
      <inner-overlay
        v-if="showMilestonePopover"
        style="z-index: 1"
        @click="toggleCreateForm"
      ></inner-overlay>
      <div
        v-for="(part, index) in getProgressPart"
        :key="index"
        class="engage_progress_container_body_item"
      >
        <progress-part
          :part="part"
          :itemMeta="{ itemIndex: index + 1, count: getProgressPart.length }"
        >
          <div class="engage_progress_container-body-score">
            <span class="engage_progress_container-body-score-text">
              {{ $t("requiredScore") }}
            </span>
            <span class="engage_progress_container-body-score-value">{{
              part.requiredScore
            }}</span>
          </div>
          <div class="engage_progress_container-body-text">
            <b-card :title="part.title">
              <b-card-text>
                {{ part.description }}
              </b-card-text>
            </b-card>
          </div>
        </progress-part>
        <div @click="toggleCreateForm(part)" style="cursor: pointer">
          <div
            class="engage_progress_container_body_item-action-center"
            v-if="index + 1 !== getProgressPart.length"
          >
            <b-button
              class="milestone-line line-center-container-icon"
              style="align-items: center; font-size: 20px"
              pill
              variant="outline-primary"
              :id="`btnMilestone-${part.id}`"
              :style="
                part.id === clickedIndex
                  ? 'z-index: 1;align-items: center;font-size: 20px;color: white;background: #4294d0'
                  : ''
              "
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
              :id="`btnMilestone-${part.id}`"
              :style="
                part.id === clickedIndex
                  ? 'z-index: 1;align-items: center;font-size: 20px;color: white;background: #4294d0'
                  : ''
              "
            >
              <i class="mdi mdi-plus" style="color: #fff"></i>
            </b-button>
          </div>
          <b-popover
            ref="popover"
            :target="`btnMilestone-${part.id}`"
            :show.sync="showMilestonePopover"
            placement="bottom"
            class="form-popover"
            v-if="part && part.id == clickedIndex"
          >
            <b-card
              no-body
              style="width: 300px"
              v-if="part && part.id == clickedIndex"
            >
              <b-card-body
                ><milestone-form
                  @input="createPart"
                ></milestone-form> </b-card-body
            ></b-card>
          </b-popover>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ProgressPart from "./ProgressPart.vue";
import MilestoneForm from "./Form.vue";

export default {
  components: {
    "progress-part": ProgressPart,
    "milestone-form": MilestoneForm,
  },
  props: {
    items: {
      type: Array,
      required: false,
      default: () => [],
    },
  },
  computed: {
    getProgressPart() {
      return this.items;
    },
  },
  data: () => {
    return {
      clickedIndex: null,
      showMilestonePopover: false,
    };
  },
  methods: {
    async createPart(item) {
      console.log(item);
    },
    toggleCreateForm(previous) {
      if (previous) {
        this.clickedIndex = previous.id;
      } else {
        this.clickedIndex = null;
      }

      this.showMilestonePopover = !this.showMilestonePopover;

      /*  const checkForm = new GQLForm({
          id: row.item.userId,
          rewarded: !row.item.rewarded,
        });

        await this.$store.dispatch("milestone/reward", checkForm); */
    },
    async toggleEdit() {
      await this.$store.dispatch("milestone/findAll", {
        force: true,
      });
      console.log("toggle edit!");
    },
  },
};
</script>

<style>
.milestone-line.line-last-container-line {
  flex-grow: 1;
  border-bottom: 2px solid lightgray;
}

.engage_progress_part_container-icons-milestone-line.milestone-line-active {
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
  content: "\F417";
  color: #4294d0;
  box-shadow: rgb(0 0 0 / 35%) 0px 5px 15px;
  z-index: 10;
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

.engage_progress_container_body_item-action-center,
.engage_progress_container_body_item-action-last {
  content: "\F417";
  z-index: 1;
  font-size: 20px;
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
.engage_progress_container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  padding-right: 15px;
  padding-left: 15px;
  margin-right: auto;
  margin-left: auto;
  padding-bottom: 20px;
}
.engage_progress_container-header {
  background: #fff;
  height: 60px;
  display: flex;
  align-items: flex-end;
  flex-direction: column;
  padding: 0 20px;
  z-index: 1;
}

.engage_progress_container_body_item {
  height: 100%;
  width: 100%;
  background: #fff;
  display: flex;
}

.engage_progress_container-body-score {
  box-shadow: rgb(0 0 0 / 35%) 0px 5px 15px;
  width: 150px;
  align-self: center;
  align-items: center;
  padding: 10px;
  border-radius: 50px;
  display: flex;
  height: 40px;
  justify-content: space-between;
}
.engage_progress_container-body-score-value {
  color: #4294d0;
  border: 1px solid #4294d0;
  border-radius: 50px;
  padding: 5px;
  min-width: 45px;
  display: flex;
  justify-content: center;
}

.engage_progress_container-body-text {
  box-shadow: rgb(0 0 0 / 35%) 0px 5px 15px;
  padding: 20px;
  margin: 20px;
}

.engage_progress_container-header-edit-text {
  font-size: 8px;
  color: black;
}

.engage_progress_container-header-edit {
  width: 40px;
  height: 40px;
  text-align: center;
  color: #4294d0;
  border-radius: 50%;
  box-shadow: rgb(0 0 0 / 35%) 0px 5px 15px;
  cursor: pointer;
  transform: translate(0px, 15px);
}
.engage_progress_container_header-action {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.engage_progress_container-body {
  width: 100%;
  height: 100%;
  margin: auto;
  align-self: center;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
}

.engage-header-edit-icon:before {
  transform: translate(0px, 5px);
}
</style>
