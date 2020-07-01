<template>
  <div class="ml-3" v-if="$can('improve/idea/create') && process && process.stages.length > 0">
    <b-button
      size="sm"
      class="text-uppercase"
      variant="primary"
      :title="$t('Create New') + ' ' + $t('Idea')"
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
      <b-card no-body style="width:500px">
        <b-card-body>
          <idea-form @done="togglePopOver" type="PROCESS" :item="item"></idea-form>
        </b-card-body>
      </b-card>
    </b-popover>
  </div>
</template>
<script>
import { /*mapState,*/ mapGetters } from "vuex";
import Form from "./Form";
import { Idea } from "@/models";
export default {
  data: () => {
    return {
      option: false,
      showPopOver: false,
      item: {}
    };
  },
  computed: {
    ...mapGetters({
      currentProcess: "process/current"
    }),
    process: {
      get: function() {
        return this.currentProcess("ideas")
          ? this.currentProcess("ideas").process
          : null;
      }
    }
  },
  components: {
    "idea-form": Form
  },
  mounted(){
  },
  methods: {
    togglePopOver() {
      this.item = new Idea();
      this.showPopOver = !this.showPopOver;
      this.$store.dispatch("app/showOverlay", {
        show: this.showPopOver,
        onClick: this.togglePopOver
      });
    }
  }
};
</script>