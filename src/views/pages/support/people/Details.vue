<template>
  <div class="people-report user-details">
    <b-row>
      <b-col cols="3" class="pr-0">
        <strong>{{ $t('Project') }}</strong>
        <v-select
          class="v-3 text-capitalize"
          label="name"
          v-validate="''"
          :clearable="false"
          v-model="currentProjectId"
          :placeholder="$t('Project')"
          :reduce="project => project.id"
          :options="projects"
          @input="changeProject"
        >
          <template #open-indicator="{ attributes }">
            <span v-bind="attributes">
              <span class="arrow-indicator"></span>
            </span>
          </template>
        </v-select>
      </b-col>
      <b-col cols="6" class="pl-0">
        <b-table
          v-if="currentProject"
          :fields="fields"
          :items="currentProject.stages"
          class="t03"
          :tbody-tr-class="getRowClass"
        >
          <template v-slot:cell(stage)="row">{{ row.item.stage.title }}</template>
          <template v-slot:cell(ideas)="row">{{ row.item.totalIdeas }}</template>
          <template v-slot:cell(savings)="row">{{ $currency(row.item.userValue/100) }}</template>
          <template v-slot:cell(average)="row">{{ $currency((row.item.totalAverage)/100) }}</template>
        </b-table>
      </b-col>
      <b-col cols="3">
        <report-chart
          ref="report"
          v-if="this.currentProject"
          :project="this.currentProject"
          :user="item.user"
        />
      </b-col>
    </b-row>
  </div>
</template>
<script>
import UserReportChart from "./UserReportChart";
export default {
  components: {
    "report-chart": UserReportChart
  },
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  data: () => {
    return {
      deleting: false,
      currentItem: null,
      currentRowDetails: null,
      currentDetailsItem: null,
      currentProjectId: null,
      projects: [],
      currentProject: null
    };
  },
  computed: {
    fields: {
      get: function() {
        return [
          { key: "stage", label: this.$t("Stage"), sortable: false },
          {
            key: "ideas",
            label: this.$t("Ideas"),
            sortable: false
          },
          {
            key: "savings",
            label: this.$t("Savings"),
            sortable: false
          },
          {
            key: "average",
            label: this.$t("Average savings"),
            sortable: false
          }
        ];
      }
    }
  },
  mounted() {
    this.projects = this.item.projects
      .map(p => {
        return p.project;
      })
      .sort((a, b) => (a.name < b.name ? -1 : 1));
    if (this.projects[0]) {
      this.changeProject(this.projects[0] ? this.projects[0].id : null);
    }
  },
  methods: {
    getRowClass(item) {
      return {
        "text-success": Number(item.userValue) > (Number(item.totalAverage) + 10000),
        "text-warning":
          item.totalAverage + 10000 >= item.userValue ||
          item.userValue <= item.totalAverage - 10000,
        "text-danger": item.totalAverage - 10000 > item.userValue
      };
    },
    async changeProject(projectId) {
      this.currentProjectId = this.projects.find(p => p.id == projectId);
      this.currentProject = this.item.projects.find(
        p => p.projectId == projectId
      );
      this.$nextTick(() => {
        if (this.$refs["report"]) {
          this.$refs["report"].drawReport();
        }
      });
    },
    isRowEditing(row) {
      return (
        this.currentItem &&
        row &&
        this.currentItem.id === (row.item ? row.item.id : row.id)
      );
    }
  }
};
</script>