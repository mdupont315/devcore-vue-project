<template>
  <div
    class="issueEffect__feedback__container"
    style="flex-direction: column; display: flex"
  >
    <div class="text-center">
      <!--   <b-tooltip :target="() => $refs[refTarget]" variant="primary"
        ><span class="issue-effect-tooltip-title">{{
          $t("issueEffectFeedback")
        }}</span></b-tooltip
      > -->
    </div>

    <b-popover
      ref="popover"
      :target="() => $refs[refTarget]"
      triggers="click"
      :show="openState"
      placement="top"
      :offset="offset"
      class="form-popover"
      custom-class="issueEffectCommentForm-form-popover"
    >
      <b-card no-body v-if="openState" style="width: 275px">
        <div
          class="feedback-form-author"
          style="
            padding: 10px;
            border-bottom: 1px solid lightgray;
            display: flex;
            height: 80px;
            justify-content: space-between;
          "
        >
          <div>
            <div style="display: flex; justify-content: space-between">
              <div>Jennifer Jane</div>
              <div>just now</div>
            </div>

            <div>we can imporve this idea</div>
          </div>
          <div>
            <confirm-button
              v-if="!isLoading"
              @confirm="toggleFeedback"
              :confirmPlacement="'left'"
              :confirmMessage="getConfirmMessage"
              :btnStyle="'display:flex;flex-direction:row;background:#fff;border:none;color:#000;align-items:center;box-shadow: none;'"
            >
              <i class="mdi mdi-close" style="font-size: 2rem"></i>
            </confirm-button>
          </div>
        </div>
        <div
          class="feedback-form-message"
          style="
            padding: 10px;
            height: 50px;
            display: flex;
            align-items: center;
          "
        >
          <input
            style="
              font-size: 12px;
              outline: none;
              border: none;
              width: 100%;
              height: 100%;
            "
            v-model="feedbackForm.description"
            placeholder="Leave a reply"
            type="text"
            debounce="500"
          />

          <div @click="saveFeedback" style="cursor: pointer">
            <i
              class="mdi mdi-send"
              style="font-size: 30px; color: #4494d1"
              v-if="!isLoading"
            ></i>
            <b-spinner v-else></b-spinner>
          </div>
        </div>

        <div
          class="feedback-form-value-and-submit"
          style="
            display: flex;
            align-items: center;
            height: 40px;
            padding: 10px;
          "
        >
          <div>
            <div style="display: flex">
              <div
                v-for="(item, index) in rewardablePoints"
                :key="index"
                class="issueEffect__feedback_feedback_reward"
                @click="rewardActiveIndex = index"
                :class="rewardActiveIndex === index ? 'reward__active' : ''"
              >
                {{ item }}
              </div>
            </div>
          </div>
        </div>
        <!--     <div
          class="form-label-group select required"
          style="width: 500px; height: 100%"
        >
          <b-textarea
            v-model="feedbackForm.description"
            v-autoresize
            class="no-style my-0 issue-Effect__feedback-text"
            :placeholder="textPlaceholder"
            name="feedback"
          ></b-textarea>
        </div>
        <div
          class="issueEffect__feedback_feedback-btn"
          style="
            display: flex;
            flex-direction: row;
            justify-content: space-between;
          "
        >
          <div style="display: flex">
            <div
              v-for="(item, index) in rewardablePoints"
              :key="index"
              class="issueEffect__feedback_feedback_reward"
              @click="rewardActiveIndex = index"
              :class="rewardActiveIndex === index ? 'reward__active' : ''"
            >
              {{ item }}
            </div>
          </div>
          <loading-button
            :disabled="feedbackForm.description.length == 0"
            style="align-self: center; padding: 5px"
            :loading="isLoading"
            @click="saveFeedback"
          >
          </loading-button>
        </div>-->
      </b-card>
    </b-popover>

    <icoIssueFeedback
      @click="toggleFeedback"
      :ref="refTarget"
      class="issueEffect__feedbackIcon"
      :class="{
        'issueEffectIcon-active': openState,
      }"
      width="40px"
      height="40px"
    ></icoIssueFeedback>
    <slot></slot>
  </div>
</template>

<script>
import icoIssueFeedback from "@/assets/img/icons/svg/ico-issue-feedback.svg?inline";

export default {
  components: { icoIssueFeedback },
  computed: {
    getConfirmMessage() {
      if (this.type == "ideaFeedback") {
        return this.$t("IdeaFeedbackClose");
      } else if (this.type == "issueFeedback") {
        return this.$t("IdeaFeedbackClose");
      } else {
        return this.$t("IdeaissueFeedbackClose");
      }
    },
  },
  props: {
    item: {
      required: true,
      type: Object,
      default() {
        return {};
      },
    },
    refTarget: {
      required: true,
      type: String,
    },
    type: {
      required: false,
      type: String,
    },
    textPlaceholder: {
      required: true,
      type: String,
    },
    offset: {
      required: false,
      type: Number,
      default() {
        return 0;
      },
    },
    openState: {
      required: true,
      type: Boolean,
      default() {
        return false;
      },
    },
  },
  watch: {
    openState(newVal) {
      if (newVal && this.isLoading) {
        this.isLoading = !this.isLoading;
        this.feedbackForm.description = "";
      }
    },
  },
  data: () => ({
    isLoading: false,
    feedbackForm: {
      description: "",
      value: 0,
    },
    rewardActiveIndex: 0,
    rewardablePoints: [0, 5, 10, 25, 50, 100],
  }),
  methods: {
    toggleFeedback() {
      //toggles modal
      console.log(this.openState);
      if (this.openState) {
        this.$emit("close");
        return;
      }
      this.$emit("toggle", this.item, this.type);
    },
    saveFeedback() {
      //deduct value
      this.feedbackForm.value = this.rewardablePoints[this.rewardActiveIndex];

      this.isLoading = true;
      //emit form
      this.$emit("save", this.feedbackForm);
    },
  },
};
</script>

<style scoped>
.issueEffect__feedbackIcon:hover path,
.issueEffect__feedback__container
  > .issueEffect__feedbackIcon.issueEffectIcon-active
  path {
  fill: #fff;
  background: #4294d0;
}

.issueEffect__feedbackIcon {
  border-radius: 50%;
  fill: #000;
  outline: none;
}

.issueEffect__feedbackIcon > path {
  transform: translate(8px, 8px);
}

.issueEffect__feedbackIcon:hover {
  background: #4294d0;
  border-radius: 50%;
  outline: none;
  cursor: pointer;
}

.issueEffectIcon-active {
  background: #4294d0;
  position: relative;
  z-index: 1;
}

.issue-effect-tooltip-title {
  font-size: 9px;
  line-height: 11px;
  letter-spacing: 1.5px;
  align-content: center;
  text-transform: uppercase;
}

.issue-Effect__feedback-text {
  min-height: 20px;
  overflow: hidden;
  max-height: 100px;
  border: 1px solid lightgray;
}

.issueEffect__feedback_feedback-btn {
  display: flex;
  justify-content: center;
  padding-top: 5px;
}

.issueEffect__feedback_feedback_reward {
  height: 32px;
  font-weight: 600;
  font-size: 16px;
  width: 32px;
  text-align: center;
  display: flex;
  margin-right: 3px;
  align-items: center;
  border: 1px solid lightgray;
  place-content: center;
  border-radius: 3px;
  cursor: pointer;
}
.issueEffect__feedback_feedback_reward.reward__active {
  background: #4294d0;
  color: #fff;
}
</style>
