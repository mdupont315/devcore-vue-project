<template>
  <div
    v-if="$can('improve/idea/create') && process && process.stages.length > 0"
    class="ml-3"
    style="display: flex; align-items: center"
  >
    <b-tooltip target="btnNew" triggers="hover" :key="tooltipIntent" >
      {{ $t("Create New") + " " + $t("Idea") }}
    </b-tooltip>
    <b-button
      id="btnNew"
      size="sm"
      class="text-uppercase"
      variant="primary"
      :title="$t('Create New') + ' ' + $t('Idea')"
      :disabled="!!ideaInEdit"
      @click="createNewIdea($event)"
    >
      <i class="mdi mdi-plus"></i>
      {{ $t("New") }}
    </b-button>
  </div>
</template>
<script>
import { /* mapState, */ mapGetters } from "vuex";
import { Idea } from "@/models";

export default {
  data: () => {
    return {
      option: false,
      showPopOver: false,
      item: {},
			tooltipIntent: Math.random()
    };
  },
  computed: {
    ...mapGetters({
      currentProcess: "process/current",
      ideaInEdit: "idea/ideaInEdit",
    }),

    process: {
      get() {
        console.log(this.currentProcess("ideas"));
        return this.currentProcess("ideas")
          ? this.currentProcess("ideas").process
          : null;
      },
    },
  },
  methods: {
    async createNewIdea(event) {
			event.preventDefault();
			this.tooltipIntent = Math.random();
      await this.$store.dispatch(`idea/setIdeaTab`, {
        tab: "New",
      });

      await this.$store.dispatch("idea/setIdeaInEdit", {
        editIdeaMeta: {
          editStartedAt: new Date().getTime(),
        },
        editIdeaMode: "CREATE",
        editIdeaId: "NEW",
      });
    },
    togglePopOver() {
      this.item = new Idea();
      this.showPopOver = !this.showPopOver;
      this.$store.dispatch("app/showOverlay", {
        show: this.showPopOver,
        onClick: this.togglePopOver,
      });
    },
  },
};
</script>
