<template>
  <div>
    <div class="ideaIssue_reply_container">
      <b-card no-body style="width: 275px; height: 100%; background: #fff">
        <div class="ideaIssue_reply_header">
          <div class="feedback-form-header-body-author">
            <div class="feedback-form-header-body-author-name">
              <author-time
                :user="getUser"
                :anonymous="comment.anonymous"
                :time="comment.createdAt"
                class="d-inline-block"
              ></author-time>
            </div>

            <confirm-button
              @confirm="saveEmptyFeedback"
              :confirmPlacement="'top'"
              :confirmMessage="getConfirmMessage"
              :btnStyle="getConfirmBtnStyle"
              :showOverlay="false"
            >
              <i class="mdi mdi-close" style="font-size: 2rem"></i>
            </confirm-button>
          </div>
        </div>
        <div class="ideaIssue_reply_body">
          <div class="ideaIssue_reply_form_body-content">
            {{ comment.content }}
          </div>
          <div class="ideaIssue_reply_form_body-input">
            <b-form-textarea
              class="feedback-form-body-input"
              autofocus
              v-model="feedbackForm.description"
              :placeholder="$t('Leave a reply')"
              no-resize
              type="text"
              debounce="500"
            />

            <div @click="saveFeedback" style="cursor: pointer">
              <i
                class="mdi mdi-send"
                style="font-size: 30px; color: #4494d1"
                v-if="!isLoading"
              ></i>
              <b-spinner v-else style="color:lightgray"></b-spinner>
            </div>
          </div>
        </div>
        <div class="ideaIssue_reply_footer">
          <div class="feedback-form-footer">
            <div class="feedback-form-footer-body">
              <div
                v-for="(item, index) in rewardablePoints"
                :key="index"
                class="ideaIssue_reply_feedback_feedback_reward"
                @click="rewardActiveIndex = index"
                :class="rewardActiveIndex === index ? 'reward__active' : ''"
              >
                {{ item }}
              </div>
            </div>
          </div>
        </div>
      </b-card>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import GQLForm from "@/lib/gqlform";

export default {
  props: {
    comment: {
      required: true,
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      isLoading: false,
      rewardActiveIndex: 0,
      rewardablePoints: [0, 5, 10, 25, 50, 100],
      feedbackForm: {
        description: "",
        value: 0,
      },
    };
  },
  computed: {
    ...mapGetters({
      filteredUser: "user/all",
      user: "auth/user",
      editingIdea: "idea/ideaInEdit",
    }),
    getUser() {
      if (this.comment && this.comment.user) {
        return this.filteredUser.find((user) => user.id === this.comment.user);
      }
      return null;
    },
    getConfirmMessage() {
      return this.$t("IdeaFeedbackClose");
    },
    getConfirmBtnStyle() {
      return `display:flex;flex-direction:row;background:#fff;border:none;color:#000;align-items:center;box-shadow: none;`;
    },
  },

  methods: {
    async saveFeedback() {
      this.isLoading = true;
      this.feedbackForm.value = this.rewardablePoints[this.rewardActiveIndex];
      //TODO: send comment reply here
      // const ideaIssueReplyForm = new GQLForm({
      //   authorId: this.item.author.id,
      //   typeAuthorId: input.typeAuthorId,
      //   ideaIssueId: this.item.id,
      //   value: input.value,
      //   description: input.description,
      //   status,
      // });
      const ideaIssueReplyForm = {
        ...this.feedbackForm,
        authorId: this.user.id,
        typeAuthorId: this.comment.user,
        ideaIssueId: this.comment.id,
        status: "FEEDBACK",
      };
      try {
        await this.$store.dispatch(
          "ideaIssueReply/create",
          new GQLForm({ ...ideaIssueReplyForm })
        );
      } catch (e) {
        console.log(e);
      }
      this.isLoading = false;
      this.$emit("savedReply", this.comment.id);
    },
    async saveEmptyFeedback() {
      this.isLoading = true;

      const ideaIssueCloseForm = new GQLForm({
        id: this.editingIdea.editIdeaId,
        improvementId: this.comment.id,
      });

      //TODO: Unset this comment,
      //TODO:  remove from editor, save content

      await this.$store.dispatch(
        "idea/closeImprovementFeedback",
        ideaIssueCloseForm
      );
      this.isLoading = false;
      this.$emit("savedReply", this.comment.id);
    },
  },
  async mounted() {
    await this.$store.dispatch("user/findAll", {
      filter: {
        data: {
          where: {
            field: "id",
            op: "eq",
            value: this.comment.user,
          },
        },
      },
    });
  },
};
</script>

<style lang="scss">
.ideaIssue_reply_body {
  padding: 5px 10px;
  display: flex;
  flex-direction: column;
  max-height: 150px;
  overflow: scroll;
  align-items: center;
  border-bottom: 1px solid lightgrey;
}
.feedback-form-body-input {
  font-size: 12px;
  outline: none;
  border: none;
  width: 100%;
  height: 100%;
  margin-right: 10px;
  background: #fff;
  &:active,
	:focus,
  :hover {
    background: #fff;
    resize: none;
    box-shadow: none !important;
  }
}
.feedback-form-footer-body {
  display: flex;
  margin: 10px;
}
.ideaIssue_reply_feedback_feedback_reward.reward__active {
  background: #4294d0;
  color: #fff;
}
.ideaIssue_reply_feedback_feedback_reward {
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
.feedback-form-header-body-author {
  display: flex;
  justify-content: space-between;
  margin: 10px;
}
.feedback-form-header-body-author-name {
  display: flex;
  align-self: center;
}
.ideaIssue_reply_body {
  margin: 0 10px;
  font-size: 12px;
  color: #707070;
  font-size: 14px;
  font-family: "FuturaLight";
}
.ideaIssue_reply_form_body-input {
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;
  color: #707070;
  padding-top: 15px;
}
.ideaIssue_reply_form_body-content {
  width: 100%;
}
.feedback-form-body-input::placeholder {
  display: flex;
  align-content: center;
  color: #4294d0;
}
</style>

