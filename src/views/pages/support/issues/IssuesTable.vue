<template>
  <div ref="issueEffect_table-container">
    <inner-overlay
      v-if="currentItem || issueDescriptionExpanded"
      class="overlay-inner"
      :class="{ 'top-all': this.showInnerOverlayOnTop }"
      @click="overlayClick"
      style="transform: translate3d(0px, 0px, 0px)"
    >
      <!--   position: fixed;
        top: 0;
        bottom: 0;
        width: 100vw;
        height: 120vh; -->
    </inner-overlay>
    <div class="text-right float-right">
      <confirm-button
        variant="transparent text-danger"
        @confirm="() => deleteAll()"
        :showOverlay="true"
        test="wtf"
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
      :items="getItems"
      :show-empty="true"
      :empty-text="$t('There are no records for the given criteria')"
      :tbody-tr-class="
        (item, type) =>
          isRowEditing(item)
            ? `issueTable-row editing issueTable-row-${getItemIdOrNull(item)}`
            : `issueTable-row issueTable-row-${getItemIdOrNull(item)}`
      "
      @row-unhovered="nullifyHoverRowId"
      @row-hovered="setHoverRowId(item, $event)"
      ref="issueEffect_table"
    >
      <template v-slot:table-colgroup>
        <col style="width: 10%" />
        <col style="width: 10%" />
        <col style="width: 10%" />
        <col style="width: 38%" />
        <col style="width: 3%" />
        <col style="width: 6%" />
        <col style="width: 6%" />
        <col style="width: 6%" />
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
      <template v-slot:cell(user)="row">
        <div>
          <div v-if="row.item.author">
            {{
              row.item.anonymous ? $t("Anonymous") : row.item.author.fullName
            }}
          </div>
        </div>
      </template>

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
        <div :ref="`issue_description_${row.item.id}`">
          <div
            style="max-height: 20px; overflow: hidden"
            :id="`issues_table-description-${row.item.id}`"
          >
            <component :is="processedHtml(row.item, false)" />
          </div>
          <div @click="setExpandIssueDescription(row.item)">
            <div
              style="
                color: #4294d0;
                text-decoration: underline;
                cursor: pointer;
              "
            >
              <div
                class="issues_table-description-expand"
                v-show="
                  isTextOverArea(row.item.id) || row.item.comments.length > 0
                "
              >
                {{ $t("View all") }}
              </div>
            </div>
          </div>
          <b-popover
            ref="popover"
            v-if="currentItem && currentItem.id == row.item.id"
            :target="() => $refs[`issue_description_${row.item.id}`]"
            triggers="click"
            boundary="window"
            placement="top"
            :show.sync="issueDescriptionExpanded"
            class="form-popover"
            custom-class="issueDescription-form-popover"
          >
            <b-card no-body style="min-width: 320px; padding: 20px">
              <component :is="processedHtml(row.item, true)" />
            </b-card>
          </b-popover>
        </div>
      </template>

      <!-- comment -->
      <template v-slot:cell(comment)="row">
        <!-- edit -->
        <issuesEffectComment
          :issue="row.item"
          @toggle="toggleItem"
          @save="saveIssueReply"
          @close="issueEffectCommentOpen = false"
          :openState="issueEffectCommentOpen && isCurrentItemRowId(row.item.id)"
        ></issuesEffectComment
      ></template>
      <!-- loss -->
      <template v-slot:cell(loss)="row">
        <span :class="{ 'text-danger': row.item.effectedMoneyTotalValue != 0 }">
          {{ getEffectedMoneyTotal(row.item) }}</span
        >
      </template>

      <!-- effect -->
      <template v-slot:cell(effect)="row" class="actions">
        <div v-if="$can('support/issueEffect/manage')" style="min-width: 100px">
          <b-spinner v-if="isLoading" />
          <div v-else>
            <div v-if="hoverRowId !== row.item.id && !currentItem">
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
                ref="issueEffect_table-container-row"
                :key="row.item.id"
                :issue="row.item"
                :items="getIssueEffectTemplates"
                @toggleOverlay="overlayClick"
                @setTemplate="setTemplate"
                @unsetTemplate="unsetTemplate"
                @selectionClosed="setDefaultEffect"
                @toggle="toggleItem"
                :openState="issueEffectAddOpen"
                :tableWidth="tableWidth"
              ></issuesEffectAdd>
            </div>
          </div>
        </div>
        <div v-else>{{ $t("No Issue Effect") }}</div>
      </template>

      <!-- actions -->
      <template v-slot:cell(actions)="row" class="text-right">
        <div
          class="text-right p-1 px-0"
          style="display: flex; align-items: center; justify-content: right"
        >
          <!-- Issue Effect Actions -->

          <div
            v-if="$can('support/issue/manage')"
            class="issueEffect-actions__container"
            :class="{ 'show-when-hovered': isCurrentRowActive(row.item) }"
          >
            <!-- feedback -->
            <issues-effect-feedback
              v-show="!row.item.replied"
              :item="row.item"
              :user="row.item.author"
              :textPlaceholder="$t('Issue feedback')"
              refTarget="issueEffectFeedbackIcon"
              type="issueFeedback"
              :offset="-38"
              @toggle="toggleItem"
              @save="saveIssueReply"
              @close="closeIssueForFeedback"
              :openState="issueEffectFeedbackOpen"
              :itemDescription="row.item.description"
            ></issues-effect-feedback>
          </div>
          <!-- trashcan -->
          <div class="issueEffect-remove__container">
            <confirm-button
              variant="btn-white"
              size="md"
              :isSelected="isCurrentItemRowId(row.item.id)"
              :showOverlay="false"
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
import icoIssueTrashcan from "@/assets/img/icons/svg/ico-trashcan.svg?inline";

import issuesEffectAdd from "./effect/IssuesTemplateAdd.vue";
import feedbackForm from "../../../../components/global/FeedbackForm.vue";
import issuesEffectComment from "./effect/IssuesTemplateComment.vue";
import { /* mapState, */ mapGetters } from "vuex";

export default {
  components: {
    icoIssueTrashcan,
    issuesEffectAdd,
    "issues-effect-feedback": feedbackForm,
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
      tableScrollTop: 0,
      issueDescriptionExpanded: null,
      selectedTemplate: null,
      isLoading: false,
      hoverRowId: null,
      rewardActiveIndex: 0,
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
      allUsers: "user/all",
      effectTemplates: "issueEffect/all",
    }),

    getItems: {
      get() {
        return this.items;
      },
    },
    getIssueEffectTemplates: {
      get() {
        return this.effectTemplates ?? [];
      },
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
            key: "comment",
            label: this.$t("Comment"),
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
    await this.$store.dispatch("issueEffect/findAll");
    await this.$store.dispatch("companyRole/findAll");
    await this.$store.dispatch("user/findAll");

    this.tableWidth = this.$refs.issueEffect_table?.$el.clientWidth ?? 1582;
    this.isLoading = false;

  },
  methods: {

    isCurrentItemRowId(id) {
      if (this.currentItem) {
        return this.currentItem.id === id;
      }
      return false;
    },
    isTextOverArea(id) {
      const el = document.getElementById(`issues_table-description-${id}`);
      if (!el) return false;
      return el.firstChild.getBoundingClientRect().height >= 40;
    },

    setExpandIssueDescription(item) {
      if (!this.currentItem) {
        this.currentItem = item;
        this.closeOtherIssueEffectModals("issueExpand");
      } else {
        this.closeOtherIssueEffectModals("");
      }
    },
    /**
     * item = issue
     * extended = include issue comments
     */
    processedHtml(item, extended) {
      if (!item) return "";

      let html = `<div style='color:#000'>${item.description}</div>`;
      if (item.comments.length > 0 && extended) {
        item.comments.map((i) => {
          html += `<div style='color:#4294d0'>${i.description}</div>`;
        });
      }

      return {
        template: "<div class='issue-description-content'>" + html + "</div>",
        props: {
          comments: {
            type: null,
            default: () => {
              return item.comments;
            },
          },
        },
      };
    },
    getItemIdOrNull(item) {
      if (item) {
        return item.id;
      }
    },
    setDefaultEffect() {
      if (this.currentItem) {
        this.currentItem.effect = this.getIssueEffectTemplates.find(
          (x) => x.id == this.currentItem.effectTemplateId
        );
        this.issueEffectAddOpen = false;
      }
    },
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
      if (issue && issue.id && !this.currentItem) {
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
      this.issueDescriptionExpanded = false;
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
        case "issueExpand":
          this.issueDescriptionExpanded = true;
          break;
      }
    },
    toggleOverlay() {
      this.editType === "issueComment"
        ? this.toggleIssueComment()
        : this.toggleIssueFeedback();
    },
    toggleIssueRemove(item) {
      this.editType = !this.issueRemoveOpen ? "issueRemove" : null;
      if (!this.issueRemoveOpen) this.toggleItem(item, "issueRemove");
    },

    toggleIssueFeedback(item) {
      this.editType = !this.issueEffectFeedbackOpen ? "issueFeedback" : null;
      if (!this.issueEffectFeedbackOpen) this.toggleItem(item, "issueFeedback");
    },

    toggleIssueComment(item) {
      this.editType = !this.issueEffectCommentOpen ? "issueComment" : null;
      if (!this.issueEffectCommentOpen) this.toggleItem(item, "issueComment");
    },
    async setTemplate(templateId) {
      const { id } = this.currentItem;
      const newTemplate = new GQLForm({
        id,
        templateId,
      });

      await this.$store.dispatch("issue/setEffectTemplate", newTemplate);
      await this.$store.dispatch("issueEffect/findAll", { force: true });
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
    async saveIssueReply(input) {
      const status = this.issueEffectCommentOpen ? "COMMENT" : "FEEDBACK";
      const { id } = this.currentItem;
      const { description } = input;
      const { value } = input;
      const ideaissueReplyForm = new GQLForm({
        authorId: this.currentItem.author.id,
        typeAuthorId: input.typeAuthorId,
        issueId: id,
        value: value,
        status,
        description,
      });
      await this.$store.dispatch("ideaIssueReply/create", ideaissueReplyForm);
      await this.$store.dispatch("issue/findById", {
        id: this.currentItem.id,
        force: true,
      });
      this.closePopovers();
    },
    async closeIssueForFeedback() {
      const issueCloseForm = new GQLForm({
        id: this.currentItem.id,
      });
      await this.$store.dispatch("issue/closeFeedback", issueCloseForm);
      this.issueEffectCommentOpen = false;
      this.issueEffectFeedbackOpen = false;
    },
    closePopovers() {
      this.issueEffectCommentOpen = false;
      this.issueEffectFeedbackOpen = false;
    },
    scrollToPosAndSetParentPadding(item) {
      if (item && item.id) {
        const element = document.getElementsByClassName(
          `issueTable-row-${item.id}`
        )[0];
        const reduceWindow = Math.abs(
          window.innerHeight -
            element.getBoundingClientRect().bottom -
            614 -
            200 -
            140
        );

        this.$emit("issuesTableOffsetTop", reduceWindow);
        this.$nextTick(() => {
          element.scrollIntoView({
            behavior: "smooth",
          });
        });
      } else if (this.currentItem) {
        const element = document.getElementsByClassName(
          `issueTable-row-${this.currentItem.id}`
        )[0];

        this.$emit("issuesTableOffsetTop", 0);
        this.$nextTick(() => {
          element.scrollIntoView({
            behavior: "smooth",
          });
        });
      }
    },
    toggleItem(item, type) {
      this.closeOtherIssueEffectModals(type);
      if (type == "issueAdd") {
        this.scrollToPosAndSetParentPadding(item);
      } else {
        this.scrollToPosAndSetParentPadding();
      }

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
      this.setDefaultEffect();
      this.issueDescriptionExpanded = false;
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
        this.issueDescriptionExpanded = false;
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
        ids: this.getItems.map((i) => i.id),
      });
      await this.$store.dispatch("issue/deleteMany", deleteForm);
      this.$parent.$emit("deletedAll", {});
    },
    async deleteItem(item) {
      const deleteForm = new GQLForm({
        id: item.id,
      });
      await this.$store.dispatch("issue/delete", deleteForm);
      this.issueRemoveOpen = false;
      this.currentItem = null;
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
.issueTable-row {
  height: 60px;
  max-height: 60px;
}

.issueDescription-form-popover[x-placement="top"] {
  top: -10px !important;
}

.issueDescription-form-popover[x-placement="bottom"] {
  top: 10px !important;
}
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
  z-index: 1;
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
