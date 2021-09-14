<template>
  <div>
    <b-card
      class="border shadow-sm mb-3 px-3 pt-3 pb-0"
      style="position: relative"
    >
      <inner-overlay
        v-if="showPopOverNew || showPopOverFeedback"
        style="z-index: 1"
        @click="closePopovers"
      ></inner-overlay>
      <b-card-body
        class="card-footer border-0 pl-0"
        style="display: flex; justify-content: space-between"
      >
        <div class="text-justify" style="display: flex">
          {{ item.description }}
        </div>
        <div
          class="text-justify"
          style="cursor: pointer; display: flex"
          v-if="item.files && item.files.length > 0"
        >
          <i class="mdi mdi-folder-open-outline" style="margin-right: 10px"></i>
          <a
            style="line-height: 17px"
            v-if="item.files[0]"
            class="link title text-gray"
            :href="item.files[0].url"
            >{{ item.files[0].title }}</a
          >
        </div>
      </b-card-body>
      <b-card-footer class="bg-white pl-0 border-0">
        <author-time
          :user="item.author"
          :anonymous="item.anonymous"
          :time="item.createdAt"
          class="d-inline-block"
        ></author-time>
        <div
          class="float-right"
          style="position: relative; top: -10px; display: flex"
        >
          <confirm-button
            class="d-inline-block"
            variant="transparent"
            btn-class="text-danger p-0 border-0"
            btn-style="outline:none!important;box-shadow:none!important"
            @confirm="deleteItem"
          >
            <i class="mdi mdi-close" style="font-size: 2rem"></i>
            <small class="d-block text-gray" style="line-height: 1em">{{
              $t("Delete")
            }}</small>
          </confirm-button>
          <improvement-feedback
            v-if="!item.replied"
            style="margin-left: 20px; max-height: 46px"
            :item="item"
            refTarget="improvementFeedbackIcon"
            :textPlaceholder="$t('Improvement feedback')"
            type="improvementFeedback"
            @toggle="togglePopOverFeedback"
            @save="saveImprovementReply"
            @close="closeImprovementForFeedback"
            :openState="showPopOverFeedback"
          >
            <small
              class="d-block text-gray"
              style="line-height: 1em; align-self: center"
              >{{ $t("Feedback") }}</small
            >
          </improvement-feedback>
          <!--   <b-button
            ref="btnFeedback"
            variant="transparent"
            class="text-success p-0 border-0 ml-4"
            style="outline: none !important; box-shadow: none !important"
            @click="createFeedback"
          >
            <i class="mdi mdi-check" style="font-size: 2rem"></i>
            <small class="d-block text-gray" style="line-height: 1em">{{
              $t("Feedback")
            }}</small>
          </b-button> -->
          <b-button
            ref="btnNew"
            variant="transparent"
            class="text-success p-0 border-0 ml-4"
            style="
              outline: none !important;
              box-shadow: none !important;
              height: 100%;
            "
            @click="startCreation"
          >
            <i class="mdi mdi-check" style="font-size: 2rem"></i>
            <small class="d-block text-gray" style="line-height: 1em">{{
              $t("Create revision")
            }}</small>
          </b-button>
        </div>
      </b-card-footer>
    </b-card>
    <!--     <b-popover
      ref="popover"
      v-click-outside
      :target="() => this.$refs['btnFeedback']"
      :show.sync="showPopOverFeedback"
      placement="top"
      class="form-popover"
    >
      <b-card no-body style="width: 400px">
        <b-card-body>
          <issuesEffectFeedback
            :issue="row.item"
            @toggle="toggleItem"
            @save="saveIssueReply"
            @close="issueEffectFeedbackOpen = false"
            :openState="issueEffectFeedbackOpen"
          ></issuesEffectFeedback>
        </b-card-body>
      </b-card>
    </b-popover> -->

    <b-popover
      ref="popover"
      v-click-outside
      :target="() => this.$refs['btnNew']"
      :show.sync="showPopOverNew"
      placement="top"
      class="form-popover"
    >
      <b-card no-body style="width: 400px">
        <b-card-body>
          <idea-form
            :item="newIdea"
            @done="loadIdea"
            @reload="reloadDetail"
            :formFrom="'improveIdea'"
          ></idea-form>
        </b-card-body>
      </b-card>
    </b-popover>
  </div>
</template>
<script>
import { Idea } from "@/models";
import IdeaFrom from "./Form";
import feedbackForm from "../../../../components/global/FeedbackForm.vue";
import GQLForm from "@/lib/gqlform";

export default {
  components: {
    "idea-form": IdeaFrom,
    "improvement-feedback": feedbackForm,
    /*     issuesEffectFeedback, */
  },
  props: {
    item: {
      type: Object,
      required: true,
    },
    idea: {
      type: Object,
      required: true,
    },
  },
  data: () => ({
    currentFile: null,
    showPopOverNew: false,
    showPopOverFeedback: false,
    newIdea: {},
  }),

  methods: {
    async closeImprovementForFeedback() {
      const improvementCloseForm = new GQLForm({
				id: this.idea.id,
        improvementId: this.item.id,
      });
      await this.$store.dispatch(
        "idea/closeImprovementFeedback",
        improvementCloseForm
      );
      this.closePopovers();
    },
    async saveImprovementReply(input) {
      console.log(input);
      const status = "FEEDBACK";

      const ideaissueReplyForm = new GQLForm({
        authorId: this.item.author.id,
        ideaIssueId: this.item.id,
        value: input.value,
        description: input.description,
        status,
      });
      await this.$store.dispatch("ideaIssueReply/create", ideaissueReplyForm);
      this.togglePopOverFeedback();
    },
    async reloadDetail() {
      this.$emit("reload", this.item);
    },
    async deleteItem() {
      this.$emit("confirm", this.item);
    },

    async loadIdea() {
      console.log("LOAD");
      await this.$store.dispatch("idea/findById", {
        id: this.idea.id,
        force: true,
      });
    },
    closePopovers() {
      this.showPopOverNew = false;
      this.showPopOverFeedback = false;
    },
    togglePopOverFeedback() {
      this.showPopOverFeedback = !this.showPopOverFeedback;
    },

    async startCreation() {
      this.$nextTick(() => {
        this.newIdea = new Idea();
        this.newIdea.parent = this.idea.parent;
        //this.newIdea.file = this.item.files[0];
        this.newIdea.title = `${this.idea.title}(${this.idea.version + 1})`;
        this.newIdea.description = this.item.description;
        this.newIdea.processId = this.idea.processId;
        this.newIdea.sourceId = this.item.id;
        this.newIdea.companyToolId = this.idea.companyToolId;
        this.newIdea.type = this.idea.type;
        this.newIdea.sourceType = "idea_issue";
      });
      setTimeout(() => {
        this.showPopOverNew = true;
      }, 500);
    },
  },
};
</script>
