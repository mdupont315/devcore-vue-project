<template>
  <div style="height:100%">
    <div class="feedback__container" v-if="$can('core/ideaIssueReply/manage')">
      <b-popover
        ref="popover"
        :target="() => $refs[refTarget]"
        triggers="click"
        :show="openState"
        boundary="window"
        placement="top"
        :offset="offset"
        class="form-popover"
        custom-class="general-feedback-form"
      >
        <b-card
          no-body
          v-if="openState"
          style="width: 275px"
          class="feedback-form"
        >
          <div class="feedback-form-header">
            <div class="feedback-form-header-body">
              <div class="feedback-form-header-body-author">
                <div class="feedback-form-header-body-author-name">
                  <author-time
                    :user="user"
                    :anonymous="item.anonymous"
                    :time="item.createdAt"
                    class="d-inline-block"
                  ></author-time>
                  <!--  <img
                    :src="user.getAvatarUrl('50x50')"
                    class="border rounded-circle"
                    height="22"
                  />

                  <div class="feedback-form-header-body-author-name-text">
                    {{ user.fullName }}
                  </div> -->
                </div>

                <confirm-button
                  @confirm="toggleFeedback"
                  :confirmPlacement="'left'"
                  :confirmMessage="getConfirmMessage"
                  :btnStyle="getConfirmBtnStyle"
                >
                  <i class="mdi mdi-close" style="font-size: 2rem"></i>
                </confirm-button>
              </div>

              <div class="feedback-form-header-body-content">
                {{ itemDescription }}
              </div>
            </div>
          </div>
          <div class="feedback-form-body">
            <input
              class="feedback-form-body-input"
              autofocus
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

          <div class="feedback-form-footer">
            <div class="feedback-form-footer-body">
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
        </b-card>
      </b-popover>

      <icoIssueFeedback
        @click="toggleFeedback"
        :ref="refTarget"
        class="feedbackIcon"
        :class="{
          'feedbackIcon-active': openState,
        }"
      ></icoIssueFeedback>
      <slot></slot>
    </div>
  </div>
</template>

<script>
import icoIssueFeedback from "@/assets/img/icons/svg/ico-issue-feedback.svg?inline";

export default {
  components: { icoIssueFeedback },
  computed: {
    /*   ...mapGetters({
      user: "auth/user",
    }), */

    getConfirmBtnStyle() {
      return `display:flex;flex-direction:row;background:#fff;border:none;color:#000;align-items:center;box-shadow: none;`;
    },
    getConfirmMessage() {
      if (this.type == "ideaFeedback") {
        return this.$t("IdeaFeedbackClose");
      } else if (this.type == "issueFeedback") {
        return this.$t("IdeaFeedbackClose");
      } else {
        return this.$t("IdeaIssueFeedbackClose");
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
    user: {
      required: true,
    },
    textPlaceholder: {
      required: true,
      type: String,
    },
    itemDescription: {
      required: false,
    },
    offset: {
      required: false,
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
      if (this.openState) {
        this.$emit("close");
        return;
      }
      this.$emit("toggle", this.item, this.type);
    },
    saveFeedback() {
      //deduct value
      this.feedbackForm.value = this.rewardablePoints[this.rewardActiveIndex];
      this.feedbackForm.typeAuthorId = this.item.author.id;

      this.isLoading = true;
      //emit form
      this.$emit("save", this.feedbackForm);
    },
  },
};
</script>

<style>
.general-feedback-form[x-placement="top"] {
  top: -10px !important;
}

.general-feedback-form[x-placement="bottom"] {
  top: 10px !important;
}
</style>

<style scoped>
.feedback__container {
	height:100%;
  flex-direction: column;
  display: flex;
}
.feedbackIcon:hover path,
.feedback__container > .feedbackIcon.feedbackIcon-active path {
  fill: #fff;
  background: #4294d0;
}

.feedback-form-body {
  padding: 5px 10px;
  height: 50px;
  display: flex;
  align-items: center;
  border-top: 1px solid lightgrey;
}

.feedback-form-header-body {
  padding: 10px;
  display: flex;
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
}

.feedback-form {
  width: 275px;
  box-shadow: rgb(0 0 0 / 35%) 0px 5px 15px;
  border-radius: 0px;
}

.feedback-form-header-body-author {
  display: flex;
  justify-content: space-between;
}
.feedback-form-body-input {
  font-size: 12px;
  outline: none;
  border: none;
  width: 100%;
  height: 100%;
}

.feedback-form-header-body-author-name {
  display: flex;
  align-items: center;
}
.feedback-form-header-body-author-name-text {
  font-size: 12px;
  letter-spacing: 1px;
  color: #4294d0;
  margin: 0 10px;
}

.feedback-form-header-body-content {
  margin: 0 20px;
  font-size: 12px;
  color: #777;
}

.feedback-form-header-body-author-name-time {
  color: #777;
  opacity: 0.5;
  font-size: 10px;
  letter-spacing: 1;
  align-self: center;
}

.feedback-form-footer {
  display: flex;
  align-items: center;
  height: 40px;
  padding: 10px;
}
.feedback-form-footer-body {
  display: flex;
}
.feedbackIcon {
  border-radius: 50%;
  fill: #000;
  outline: none;
  width: 40px;
  height: 37px;
}

.feedbackIcon > path {
  transform: translate(8px, 8px);
}

.feedbackIcon:hover {
  background: #4294d0;
  border-radius: 50%;
  outline: none;
  cursor: pointer;
}

.feedbackIcon-active {
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
