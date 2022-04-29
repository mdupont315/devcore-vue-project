<template>
  <div v-if="$can('core/project/create') && process && process.stages.length > 0" class="ml-3">
    <b-button
      id="btnNew"
      v-b-tooltip.hover
      size="sm"
      class="text-uppercase"
      variant="primary"
      :title="$t('action.create',{name:$t('project')})"
      @click="togglePopOver"
    >
      <i class="mdi mdi-plus"></i>
      {{ $t('New')}}
    </b-button>
    <b-popover
      ref="popover"
      target="btnNew"
      :show.sync="showPopOver"
      placement="bottom"
      class="form-popover"
    >
      <b-card no-body style="width:300px">
        <b-card-body>
          <project-form v-model="item" @done="togglePopOver"></project-form>
        </b-card-body>
      </b-card>
    </b-popover>
  </div>
</template>
<script>
import { /* mapState, */ mapGetters } from "vuex";
import Form from "./Form";
// import { Project } from "@/models";
export default {
  components: {
    "project-form": Form
  },
  data: () => {
    return {
      option: false,
      intent: null,
      showPopOver: false,
      item: null
    };
  },
  computed: {
    ...mapGetters({
      currentProcess: "process/current"
    }),
    process: {
      get() {
        return this.currentProcess("projects")
          ? this.currentProcess("projects").process
          : null;
      }
    }
  },
  methods: {
    async togglePopOver() {
      this.intent = Math.random();
      this.item = {};
      this.showPopOver = !this.showPopOver;
      this.$store.dispatch("app/showOverlay", {
        show: this.showPopOver,
        onClick: this.togglePopOver
      });
    }
  }
};
</script>
