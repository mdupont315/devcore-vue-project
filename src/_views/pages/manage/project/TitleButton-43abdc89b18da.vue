<template>
  <div class="ml-3" v-if="$can('core/project/create') && process && process.stages.length > 0">
    <b-button
      size="sm"
      class="text-uppercase"
      variant="primary"
      :title="$t('action.create',{name:$t('project')})"
      v-b-tooltip.hover
      id="btnNew"
      @click="togglePopOver"
    >
      <i class="mdi mdi-plus"></i>
      {{ $t('New')}}
    </b-button>
    <b-popover
      target="btnNew"
      :show.sync="showPopOver"
      placement="bottom"
      class="form-popover"
      ref="popover"
    >
      <b-card no-body style="width:300px">
        <b-card-body>
          <project-form @done="togglePopOver" v-model="item"></project-form>
        </b-card-body>
      </b-card>
    </b-popover>
  </div>
</template>
<script>
import { /*mapState,*/ mapGetters } from "vuex";
import Form from "./Form";
//import { Project } from "@/models";
export default {
  data: () => {
    return {
      option: false,
      intent: null,
      showPopOver: false,
      item: null
    };
  },
  components: {
    "project-form": Form
  },
  computed: {
    ...mapGetters({
      currentProcess: "process/current"
    }),
    process: {
      get: function() {
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