<template>
  <div>
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
        <col style="width: 15%" />
        <col style="width: 15%" />
        <col style="width: 10%" />
        <col style="width: 50%" />
        <col style="width: 100px" />
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

      <!-- Process path -->
      <!--    <template v-slot:cell(processPath)="row"
        ><div v-for="(path, index) in formatProcessPath(row.item.parent)" :key="index">
         <span style="font-size:8px" v-if="index !== 0">></span> {{ path }}
        </div></template
      > -->
      <!-- description -->
      <template v-slot:cell(description)="row">{{
        row.item.description
      }}</template>
      <!-- loss -->
      <template v-slot:cell(loss)="row">
        <span :class="{ 'text-danger': row.item.totalValue != 0 }">{{
          $currency(row.item.totalValue / 100 || 0)
        }}</span>
      </template>
      <!-- actions -->
      <template v-slot:cell(actions)="row" class="text-right">
        <div class="text-right float-right p-1 px-0" style="width: 45px">
          <confirm-button
            variant="btn-danger btn-white btn-delete"
            size="md"
            @confirm="() => deleteItem(row.item)"
          >
            <i class="mdi mdi-trash-can"></i>
          </confirm-button>
        </div>
      </template>
    </b-table>
  </div>
</template>
<script>
import GQLForm from "@/lib/gqlform";

export default {
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
      deleting: false,
      currentItem: null,
      currentRowDetails: null,
      currentDetailsItem: null,
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
          /*    {
            key: "processPath",
            label: this.$t("Process path"),
            sortable: true,
          }, */

          {
            key: "loss",
            label: this.$t("Estimated loss"),
            sortable: true,
          },
          {
            key: "description",
            label: this.$t("Description"),
            sortable: true,
          },

          { key: "actions", label: "", class: "actions" },
        ];
      },
    },
  },
  methods: {
    formatProcessPath(path) {
      let stagePath = null;
      let operationPath = null;
      let phasePath = null;
      if (path.__typename === "ProcessPhase") {
        phasePath = path.title;
        operationPath = path.operation.title;
        stagePath = path.operation.stage.title;
        return [stagePath, operationPath, phasePath];
      } else if (path.__typename === "ProcessOperation") {
        operationPath = path.title;
        stagePath = path.stage.title;
        return [stagePath, operationPath];
      } else {
        stagePath = path.title;
        return [stagePath];
      }
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
    },
    async deleteItem(item) {
      const deleteForm = new GQLForm({
        id: item.id,
      });
      await this.$store.dispatch("issue/delete", deleteForm);
    },
  },
};
</script>
