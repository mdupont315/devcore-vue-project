<template>
  <div :key="refreshKey">
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
    >
      <template v-slot:table-colgroup>
        <col style="width: 10%" />
        <col style="width: 10%" />
        <col style="width: 10%" />
        <col style="width: 32%" />
        <col style="width: 8%" />
        <col style="width: 8%" />
        <col style="width: 8%" />
        <col style="width: 14%" />
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
      <template v-slot:cell(description)="row">{{
        row.item.description
      }}</template>

      <!-- loss -->
      <template v-slot:cell(loss)="row">
        <span :class="{ 'text-danger': row.item.moneyTotalValue != 0 }">
          {{ $currency(row.item.moneyTotalValue / 100 || 0) }}</span
        >
      </template>

      <!-- checked -->
      <template v-slot:cell(checked)="row">
        <div>
          <b-form-checkbox
            v-model="row.item.checked"
            @input="checkItem(row.item)"
            checked
            :value="true"
            :unchecked-value="false"
          ></b-form-checkbox>
        </div>
      </template>

      <!-- effect -->
      <template v-slot:cell(effect)="row" class="actions">
        <div class="buttons" style="justify-content: flex-start">
          <b-button
            size="xs"
            variant="action"
            class="btn-primary btn-block text-uppercase text-bold"
            style="font-size: 1.2rem; 3px 10px;white-space:nowrap;min-width:min-content;max-width:91px;display:flex;justify-content:center"
            >ADD</b-button
          >
        </div>
      </template>

      <!-- actions -->
      <template v-slot:cell(actions)="row" class="text-right">
        <div class="text-right p-1 px-0" style="display: flex">
          <!-- feedback -->
          <confirm-button
            variant="btn-white"
            size="md"
            @confirm="() => deleteItem(row.item)"
          >
            <div class="text-center">
              <b-tooltip
                :target="() => $refs.issueEffectFeedbackIcon"
                variant="primary"
                ><span class="issue-effect-tooltip-title">{{
                  $t("issueEffectFeedback")
                }}</span></b-tooltip
              >
            </div>
            <icoIssueFeedback
              ref="issueEffectFeedbackIcon"
              class="issue-Effect__FeedbackIcon"
              width="40px"
              height="40px"
            ></icoIssueFeedback>
          </confirm-button>

          <!-- edit -->
          <confirm-button
            variant="btn-white"
            size="md"
            @confirm="() => deleteItem(row.item)"
          >
            <div class="text-center">
              <b-tooltip
                :target="() => $refs.issueEffectEditIcon"
                variant="primary"
                ><span class="issue-effect-tooltip-title">{{
                  $t("issueEffectEdit")
                }}</span></b-tooltip
              >
            </div>

            <icoIssueEdit
              ref="issueEffectEditIcon"
              class="issue-Effect__EditIcon"
              width="40px"
              height="40px"
            ></icoIssueEdit>
          </confirm-button>

          <!-- trashcan -->
          <confirm-button
            variant="btn-white"
            size="md"
            @confirm="() => deleteItem(row.item)"
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
              ref="issueEffectRemoveIcon"
              class="issue-Effect__RemoveIcon"
              width="40px"
              height="40px"
            ></icoIssueTrashcan>
          </confirm-button>

          <!--    <i class="mdi mdi-trash-can"></i> -->
        </div>
      </template>
    </b-table>
  </div>
</template>
<script>
import GQLForm from "@/lib/gqlform";
import moment from "moment";
import icoIssueFeedback from "@/assets/img/icons/svg/ico-issue-feedback.svg?inline";
import icoIssueEdit from "@/assets/img/icons/svg/ico-issue-edit.svg?inline";
import icoIssueTrashcan from "@/assets/img/icons/svg/ico-issue-trashcan.svg?inline";

export default {
  components: {
    icoIssueFeedback,
    icoIssueEdit,
    icoIssueTrashcan,
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
  /* 	mounted(){
		this.setIssues();
	}, */
  data: () => {
    return {
      deleting: false,
      currentItem: null,
      currentRowDetails: null,
      currentDetailsItem: null,
      form: {},
      issues: [],
      refreshKey: Math.random(),
    };
  },
  computed: {
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
            key: "checked",
            label: this.$t("Checked"),
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
  methods: {
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
      console.log(item);
      const deleteForm = new GQLForm({
        id: item.id,
      });
      await this.$store.dispatch("issue/delete", deleteForm);
      console.log(item);
      //this.refreshKey = Math.random();
      this.$parent.$emit("deleted", item);
    },
    async checkItem(item) {
      console.log(item);
      const checkForm = new GQLForm({
        id: item.id,
        checked: item.checked,
      });
      console.log(checkForm);
      await this.$store.dispatch("issue/check", checkForm);
    },
  },
};
</script>
<style scoped>
.issue-effect-tooltip-title {
  font-size: 9px;
  line-height: 11px;
  letter-spacing: 1.5px;
  align-content: center;
  text-transform: uppercase;
}

.issue-Effect__FeedbackIcon:hover,
.issue-Effect__EditIcon:hover,
.issue-Effect__RemoveIcon:hover {
  background: #4294d0;
  border-radius: 50%;
  outline: none;
}

.issue-Effect__FeedbackIcon,
.issue-Effect__EditIcon,
.issue-Effect__RemoveIcon {
  border-radius: 50%;
  outline: none;
  fill: #000;
}
</style>
