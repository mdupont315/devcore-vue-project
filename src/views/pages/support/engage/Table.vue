<template>
  <div class="engage_table_container">
    <!-- page content -->
    <b-table
      sort-icon-left
      sort-by="name"
      class="t01"
      hover
      fixed
      style="background: #fff"
      :fields="fields"
      :items="getMilestoneUsers"
      table-class="engage_table"
      :show-empty="true"
      :empty-text="$t('There are no records for the given criteria')"
    >
      <template v-slot:table-colgroup>
        <col style="width: 25%" />
        <col style="width: 25%" />
        <col style="width: 25%" />
        <col style="width: 25%" />
      </template>
      <template v-slot:empty="scope">
        <p class="alert alert-warning text-center">{{ scope.emptyText }}</p>
      </template>
      <template v-slot:table-busy>
        <div class="text-center text-primary my-2">
          <b-spinner class="align-middle"></b-spinner>
        </div>
      </template>

      <!-- name -->
      <template v-slot:cell(name)="row">
        <div v-if="row.item.user">
          {{ row.item.user.firstName }} {{ row.item.user.lastName }}
        </div>
      </template>

      <!-- engageScore -->
      <template v-slot:cell(score)="row">
        <div v-if="row.item.engageScore">{{ row.item.engageScore }}</div>
      </template>

      <!-- reward -->
      <template v-slot:cell(reward)="row">
        <div v-if="row.item">{{ getValueRank(row.item) }}</div>
      </template>

      <!-- action -->
      <template v-slot:cell(action)="row">
        <div v-if="row.item">
          <loading-button
            type="submit"
            size="lg"
            @click="reward(row)"
            :variant="row.item.rewarded ? 'outline-primary' : 'success'"
            :disabled="filter.busy || row.item.rewarded || vErrors.any()"
            :style="row.item.rewarded ? 'cursor:not-allowed' : 'cursor:pointer'"
            :loading="filter.busy && isLoadingRow(row)"
            :block="true"
            >{{ getRowItemRewarded(row.item) }}</loading-button
          >
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
  },
  data: () => {
    return {
      store: "milestone",
      loadingId: null,
      filter: {
        busy: false,
      },
    };
  },
  computed: {
    getMilestoneUsers() {
      const milestoneUsers = [];
      console.log(this.items);
      this.items.forEach((item) => milestoneUsers.push(...item.users));
      return milestoneUsers;
    },
    fields: {
      get() {
        return [
          {
            key: "name",
            label: this.$t("Username"),
            sortable: true,
            thClass: "engage_table_header",
          },
          {
            key: "score",
            label: this.$t("currentValue"),
            sortable: true,
            thClass: "engage_table_header",
          },
          {
            key: "reward",
            label: this.$t("rewardAchieved"),
            sortable: true,
            thClass: "engage_table_header",
          },
          {
            key: "action",
            label: this.$t("rewardGiven"),
            class: "action",
            thClass: "engage_table_header",
          },
        ];
      },
    },
  },
  methods: {
    isLoadingRow(row) {
      return this.loadingId == row.index;
    },
    getRowItemRewarded(item) {
      return item.rewarded ? this.$t("Confirmed") : this.$t("Confirm");
    },
    getValueRank(item) {
      console.log(item);
      const { milestoneId } = item;
      let title = "";

      if (this.items.length > 0) {
        const milestone = this.items.find((x) => x.id === milestoneId);
        title = milestone ? milestone.title : "";
      }
      return title;
    },

    async reward(row) {
      console.log(row);
      this.loadingId = row.index;
      if (!row.item.rewarded) {
        this.filter.busy = true;
        const rewardForm = new GQLForm({
          id: row.item.userId,
          rewarded: !row.item.rewarded,
          milestoneId: row.item.milestoneId,
        });
        await this.$store.dispatch("milestone/reward", rewardForm);
        this.filter.busy = false;
      }
    },
  },
};
</script>

<style>
.engage_table_header {
  height: 60px;
  color: #4294d0;
  z-index: 1 !important;
  width: 100%;
}
.engage_table {
  /*  max-width: 97%; */
}
.engage_table_header > div {
  line-height: 35px;
  color: #4294d0;
}

.engage_container_content > .container-fluid > .b-table-sticky-header {
  /*   padding: 0 20px;
  max-height: 40%; */
}

.engage_table_container {
  background: #fff;
  border-radius: 5px;
  height: 100%;
  padding: 0 20px;
  overflow-y: scroll;
  /*   height: 100%;
  background: #fff;
  margin: 20px 20px 0 20px;
	    max-height: 310px;
    overflow: hidden;
  padding-right: 15px;
  padding-left: 15px;
	border-radius: 5px; */
}
</style>
