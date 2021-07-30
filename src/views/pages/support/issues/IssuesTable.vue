<template>
  <div>
    <div
      v-if="currentItem"
      class="overlay"
      :class="{ 'top-all': this.showInnerOverlayOnTop }"
      @click="overlayClick"
    ></div>
    <inner-overlay
      v-if="isEditing"
      @click="toggleOverlay"
      class="inner-overlay-create"
    >
    </inner-overlay>
    <div class="text-right float-right">
      <confirm-button
        variant="transparent text-danger"
        @confirm="() => deleteAll()"
      >
        <i class="mdi mdi-delete"></i>
        {{ $t("Delete all") }}
      </confirm-button>
    </div>
    <b-table
      sort-icon-left
      sort-by="name"
      :busy="loading"
      class="t02"
      primary-key="id"
      hover
      :fields="fields"
      :items="items"
      :show-empty="true"
      :empty-text="$t('There are no records for the given criteria')"
      :tbody-tr-class="(item, type) => (isRowEditing(item) ? 'editing' : '')"
      @row-unhovered="nullifyHoverRowId"
      @row-hovered="setHoverRowId(item, $event)"
      ref="issueEffect_table"
    >
      <template v-slot:table-colgroup>
        <col style="width: 10%" />
        <col style="width: 10%" />
        <col style="width: 10%" />
        <col style="width: 35%" />
        <col style="width: 10%" />
        <col style="width: 15%" />
        <col style="width: 10%" />
      </template>
      <template v-slot:empty="scope">
        <p class="alert alert-warning text-center">{{ scope.emptyText }}</p>
      </template>
      <template v-slot:table-busy>
        <div class="text-center text-primary my-2">
          <b-spinner class="align-middle"></b-spinner>
        </div>
      </template>

      <!-- project -->
      <template v-slot:cell(user)="row">{{
        row.item.anonymous ? $t("Anonymous") : row.item.author.fullName
      }}</template>

      <!-- project -->
      <template v-slot:cell(project)="row">{{
        row.item.project.name
      }}</template>

      <!--    Created  -->
      <template v-slot:cell(created)="row"
        ><div>
          {{ formatDate(row.item.createdAt) }}
        </div></template
      >
      <!-- description -->
      <template v-slot:cell(description)="row">
        <div>
          {{ row.item.description }}
        </div></template
      >
      <!-- loss -->
      <template v-slot:cell(loss)="row">
        <span :class="{ 'text-danger': row.item.effectedMoneyTotalValue != 0 }">
          {{ getEffectedMoneyTotal(row.item) }}</span
        >
      </template>

      <!-- effect -->
      <template v-slot:cell(effect)="row" class="actions" v-if="$can('support/issueEffect/manage')">
        <b-spinner v-if="isLoading" />
        <div v-else>
          <div v-if="hoverRowId !== row.item.id">
            <div v-if="row.item.effect">
              {{ getEffectTitle(row.item.effect) }}
            </div>
            <div v-else>{{ $t("No Issue Effect") }}</div>
          </div>
          <div
            v-else
            class="issueEffect-actions__container"
            :class="{ 'show-when-hovered': isCurrentRowActive(row.item) }"
          >
            <issuesEffectAdd
              :issue="row.item"
              :items="getIssueEffectTemplates"
              @setTemplate="setTemplate"
              @unsetTemplate="unsetTemplate"
              @toggle="toggleItem"
              :openState="issueEffectAddOpen"
              :tableWidth="tableWidth"
            ></issuesEffectAdd>
          </div>
        </div>
      </template>

      <!-- actions -->
      <template v-slot:cell(actions)="row" class="text-right">
        <div
          class="text-right p-1 px-0"
          style="display: flex; align-items: center"
        >
          <!-- Issue Effect Actions -->
          <div
            class="issueEffect-actions__container"
            :class="{ 'show-when-hovered': isCurrentRowActive(row.item) }"
          >
            <!-- feedback -->
            <issuesEffectFeedback
              :issue="row.item"
              @toggle="toggleItem"
              @save="saveItem"
              @close="issueEffectFeedbackOpen = false"
              :openState="issueEffectFeedbackOpen"
            ></issuesEffectFeedback>

            <!-- edit -->
            <issuesEffectComment
              :issue="row.item"
              @toggle="toggleItem"
              @save="saveItem"
              @close="issueEffectCommentOpen = false"
              :openState="issueEffectCommentOpen"
            ></issuesEffectComment>
          </div>
          <!-- trashcan -->
          <div class="issueEffect-remove__container">
            <confirm-button
              variant="btn-white"
              size="md"
              @confirm="() => deleteItem(row.item)"
              @showConfirm="toggleIssueRemoveOpen"
              @cancel="overlayClick"
            >
              <div class="text-center">
                <b-tooltip
                  :target="() => $refs.issueEffectRemoveIcon"
                  variant="primary"
                  ><span class="issue-effect-tooltip-title">{{
                    $t("issueEffectRemove")
                  }}</span></b-tooltip
                >
              </div>
              <icoIssueTrashcan
                @click="toggleIssueRemove(row.item)"
                ref="issueEffectRemoveIcon"
                :class="{
                  removeIcon__active:
                    editType === 'issueRemove' && !isCurrentRowActive(row.item),
                }"
                class="issue-Effect__RemoveIcon"
                width="40px"
                height="40px"
              ></icoIssueTrashcan>
            </confirm-button>
          </div>
        </div>
      </template>
    </b-table>
  </div>
</template>
<script>
import GQLForm from "@/lib/gqlform";
import moment from "moment";
import icoIssueTrashcan from "@/assets/img/icons/svg/ico-issue-trashcan.svg?inline";

import issuesEffectAdd from "./effect/IssuesTemplateAdd.vue";
import issuesEffectFeedback from "./effect/IssuesTemplateFeedback.vue";
import issuesEffectComment from "./effect/IssuesTemplateComment.vue";
import { /* mapState, */ mapGetters } from "vuex";

export default {
  components: {
    icoIssueTrashcan,
    issuesEffectAdd,
    issuesEffectFeedback,
    issuesEffectComment,
  },
  props: {
    items: {
      type: Array,
      required: false,
      default: () => [],
    },
    item: {
      type: Object,
      required: false,
      default: () => null,
    },
    loading: {
      required: false,
      type: Boolean,
      default: () => false,
    },
  },

  data: () => {
    return {
      selectedTemplate: null,
      isLoading: false,
      hoverRowId: null,
      rewardActiveIndex: 0,
      issueEffectForm: {
        id: null,
        feedback: null,
        comment: null,
      },
      rewardablePoints: [0, 5, 10, 25, 50, 100],
      editType: null,
      issueEffectFeedbackOpen: false,
      issueEffectCommentOpen: false,
      issueEffectAddOpen: false,
      issueEffectAdd: false,
      issueRemoveOpen: false,
      deleting: false,
      currentItem: null,
      form: {},
      issues: [],
      issueEffectTemplateActiveIndex: null,
      tableWidth: null,
    };
  },

  computed: {
    ...mapGetters({
      showInnerOverlayOnTop: "app/show_inner_overlay_on_top",
      user: "auth/user",
      effectTemplates: "issueEffect/all",
    }),

    getIssueEffectTemplates: {
      get() {
        console.log(this.effectTemplates);
        return this.effectTemplates ?? [];
      },
    },

    isEditing() {
      if (this.editType === "issueFeedback") {
        return this.issueEffectFeedbackOpen;
      } else if (this.editType === "issueComment") {
        return this.issueEffectCommentOpen;
      } else if (this.editType === "issueAdd") {
        return this.issueEffectAddOpen;
      }
      return false;
    },
    fields: {
      get() {
        return [
          { key: "user", label: this.$t("User"), sortable: true },
          {
            key: "project",
            label: this.$t("Project"),
            sortable: true,
          },
          {
            key: "created",
            label: this.$t("Created"),
            sortable: true,
          },

          {
            key: "description",
            label: this.$t("Description"),
            sortable: true,
          },
          {
            key: "loss",
            label: this.$t("Estimated loss"),
            sortable: true,
          },
          {
            key: "effect",
            label: this.$t("Issue effect"),
            sortable: true,
          },

          { key: "actions", label: "", class: "actions" },
        ];
      },
    },
  },
  async mounted() {
    this.isLoading = true;
    console.log("MOUNTED");
    await this.$store.dispatch("issueEffect/findAll");
    await this.$store.dispatch("companyRole/findAll");

    this.tableWidth = this.$refs.issueEffect_table?.$el.clientWidth ?? 1582;
    this.isLoading = false;
  },
  methods: {
    getEffectedMoneyTotal(item) {
      return this.$currency(item.effectedMoneyTotalValue / 100 || 0);
    },
    getEffectTitle(item) {
      if (item && item.title) {
        return item.title;
      }
      return this.$t("No Issue Effect");
    },
    nullifyHoverRowId() {
      if (
        this.issueEffectAddOpen ||
        this.issueEffectCommentOpen ||
        this.issueEffectFeedbackOpen
      ) {
        return;
      }
      this.hoverRowId = null;
    },
    setHoverRowId(row, issue) {
      if (issue && issue.id) {
        this.hoverRowId = issue.id;
      }
    },
    isCurrentRowActive(item) {
      if (item && this.currentItem) {
        return item.id !== this.currentItem.id;
      }
      return true;
    },

    toggleIssueRemoveOpen(openState) {
      if (openState) this.editType = "issueRemove";
      if (!openState) this.editType = "";
      this.issueRemoveOpen = openState;
    },
    closeOtherIssueEffectModals(type) {
      this.issueEffectCommentOpen = false;
      this.issueEffectFeedbackOpen = false;
      this.issueEffectAddOpen = false;
      this.issueRemoveOpen = false;
      switch (type) {
        case "issueRemove":
          this.issueRemoveOpen = true;
          break;
        case "issueAdd":
          this.issueEffectAddOpen = true;
          break;
        case "issueFeedback":
          this.issueEffectFeedbackOpen = true;
          break;
        case "issueComment":
          this.issueEffectCommentOpen = true;
          break;
      }
    },
    toggleOverlay() {
      console.log("overlay");
      this.editType === "issueComment"
        ? this.toggleIssueComment()
        : this.toggleIssueFeedback();
    },
    toggleIssueRemove(item) {
      console.log(this.issueRemoveOpen);
      this.editType = !this.issueRemoveOpen ? "issueRemove" : null;
      if (!this.issueRemoveOpen) this.toggleItem(item, "issueRemove");
    },

    toggleIssueFeedback(item) {
      this.editType = !this.issueEffectFeedbackOpen ? "issueFeedback" : null;
      console.log(this.editType);
      if (!this.issueEffectFeedbackOpen) this.toggleItem(item, "issueFeedback");
    },

    toggleIssueComment(item) {
      console.log(this.editType);
      this.editType = !this.issueEffectCommentOpen ? "issueComment" : null;
      if (!this.issueEffectCommentOpen) this.toggleItem(item, "issueComment");
      console.log(this.editType);
    },
    async setTemplate(templateId) {
      const { id } = this.currentItem;
      const newTemplate = new GQLForm({
        id,
        templateId,
      });
      console.log("newTemplate");
      console.log(newTemplate);

      await this.$store.dispatch("issue/setEffectTemplate", newTemplate);
      await this.$store.dispatch("issueEffect/findAll");
    },
    async unsetTemplate(templateId) {
      const { id } = this.currentItem;
      const newTemplate = new GQLForm({
        id,
        templateId,
      });

      const response = await this.$store.dispatch(
        "issue/unsetEffectTemplate",
        newTemplate
      );
      await this.$store.dispatch("issueEffect/findAll");
      return response;
    },
    async saveItem(input) {
      console.log(input);
    },
    async saveIssueFeedback() {
      /*      const { id } = this.currentItem;
      const value = rewardablePoints[rewardActiveIndex];
      const { feedback } = this.issueFeedbackForm;
      console.log(this.user);
      const issueFeedbackForm = new GQLForm({
        id,
        value,
        feedback,
      }); */
    },
    async saveIssueComment() {
      /*    const { comment } = this.issueFeedbackForm;
      const { id } = this.currentItem;

      const issueCommentForm = new GQLForm({
        id,
        comment,
      }); */
    },
    toggleItem(item, type) {
      this.closeOtherIssueEffectModals(type);

      if (
        !item ||
        (this.currentItem &&
          this.currentItem.id === item.id &&
          !this.issueEffectAddOpen &&
          !this.issueEffectFeedbackOpen &&
          !this.issueEffectCommentOpen &&
          this.editType !== "issueRemove")
      ) {
        this.currentItem = null;
      } else {
        this.currentItem = item;
      }
    },
    overlayClick() {
      if (
        this.currentItem &&
        !this.issueEffectCommentOpen &&
        !this.issueEffectFeedbackOpen &&
        !this.issueEffectAddOpen &&
        !this.issueRemoveOpen
      ) {
        this.toggleItem(null);
      } else {
        this.editType = "";
        this.hoverRowId = null;
        this.issueEffectCommentOpen = false;
        this.issueEffectFeedbackOpen = false;
        this.issueEffectAddOpen = false;
        this.issueRemoveOpen = false;
      }
    },

    formatDate(time) {
      return time ? moment(time).format("DD/MM/YYYY HH:mm:ss") : "N/A";
    },

    isRowEditing(row) {
      return (
        this.currentItem &&
        row &&
        this.currentItem.id === (row.item ? row.item.id : row.id)
      );
    },
    async deleteAll() {
      const deleteForm = new GQLForm({
        ids: this.items.map((i) => i.id),
      });
      await this.$store.dispatch("issue/deleteMany", deleteForm);
      this.$parent.$emit("deletedAll", {});
    },
    async deleteItem(item) {
      const deleteForm = new GQLForm({
        id: item.id,
      });
      await this.$store.dispatch("issue/delete", deleteForm);
      this.$parent.$emit("deleted", item);
    },
    async checkItem(item) {
      const checkForm = new GQLForm({
        id: item.id,
        checked: item.checked,
      });
      await this.$store.dispatch("issue/check", checkForm);
    },
  },
};
</script>
<style>
</style>
<style scoped>
.issue-effect-tooltip-title {
  font-size: 9px;
  line-height: 11px;
  letter-spacing: 1.5px;
  align-content: center;
  text-transform: uppercase;
}

.issue-Effect__RemoveIcon:hover {
  background: #4294d0;
  border-radius: 50%;
  outline: none;
  cursor: pointer;
}

.issue-Effect__RemoveIcon {
  border-radius: 50%;
  outline: none;
  fill: #000;
}

.issueEffect_add_form_templates_item-edit {
  flex-grow: 1;
  font-weight: 400;
  text-decoration: underline;
}

.issue-Effect__RemoveIcon:hover path {
  fill: #fff;
  background: #4294d0;
}

.inner-overlay-create {
  width: 100vw;
  height: 100vh;
  z-index: 1;
  position: fixed;
}

.issue-Effect__RemoveIcon.removeIcon__active {
  position: relative;
  z-index: 999;
  background: #4294d0;
}
.issue-Effect__RemoveIcon.removeIcon__active > path {
  fill: #fff;
}

.issueEffect-actions__container {
  display: flex;
}

@media (pointer: fine) {
  .b-table > tbody > tr:not(:hover) .show-when-hovered {
    visibility: hidden;
  }
  .b-table > tbody > tr:hover .show-when-not-hovered {
    visibility: hidden;
  }
}
</style>
