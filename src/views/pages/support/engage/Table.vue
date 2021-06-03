<template>
  <div class="container-fluid">
    <!-- page content -->
    <b-card style="height: 100%">
      <b-table
        sort-icon-left
        sort-by="name"
        :busy="filter.busy"
        class="t01"
        hover
        :fields="fields"
        :items="getMilestoneUsers"
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
            <b-button
              size="xs"
              :variant="row.item.rewarded ? 'outline-primary' : 'success'"
              :style="row.item.rewarded ? 'cursor:not-allowed' : 'cursor:pointer'"
              :disabled="row.item.rewarded"
              class="btn-block text-uppercase text-bold"
              style="font-size: 1.2rem; padding: 3px; min-width: min-content"
              @click="reward(row)"
              >{{ getRowItemRewarded(row.item) }}
            </b-button>
          </div>
        </template>
      </b-table>
    </b-card>
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
          { key: "name", label: this.$t("Username"), sortable: true },
          {
            key: "score",
            label: this.$t("currentValue"),
            sortable: true,
          },
          {
            key: "reward",
            label: this.$t("rewardAchieved"),
            sortable: true,
          },
          { key: "action", label: this.$t("rewardGiven"), class: "action" },
        ];
      },
    },
  },
  methods: {
    getRowItemRewarded(item) {
      return item.rewarded ? this.$t("Confirmed") : this.$t("Confirm");
    },
    getValueRank(item) {
      const { engageScore } = item;

      const deductedPosition = () => {
        const scores = sorted.map((obj) => obj.requiredScore);
        for (let i = 0; i < scores.length; i++) {
          if (
            (i === 0 && scores[i] > engageScore) ||
            (i === scores.length - 1 && scores[i] < engageScore) ||
            (scores[i] < engageScore && engageScore < scores[i + 1])
          ) {
            return scores[i];
          }
        }
      };

      const sorted = [...this.items].sort((a, b) =>
        a.requiredScore > b.requiredScore ? 1 : -1
      );

      return sorted.find((rank) => rank.requiredScore === deductedPosition())
        .reward;
    },
    overlayClick() {
      console.log("overlayClick");
    },
    async reward(row) {
      if (!row.item.rewarded) {
        const checkForm = new GQLForm({
          id: row.item.userId,
          rewarded: !row.item.rewarded,
        });
        await this.$store.dispatch("milestone/reward", checkForm);
      }
    },
  },
};
</script>

<style scoped>
.container-fluid {
  height: 100%;
}
</style>
