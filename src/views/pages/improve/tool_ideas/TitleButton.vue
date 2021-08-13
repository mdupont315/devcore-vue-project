<template>
  <div
    v-if="$can('improve/idea/create') && process && process.stages.length > 0"
    class="ml-3"
  >
    <b-button
      id="btnNew"
      v-b-tooltip.hover
      size="sm"
      class="text-uppercase"
      variant="primary"
      :disabled="!getCurrentToolHasValues"
      :style="
        getCurrentToolHasValues ? 'cursor:pointer' : 'cursor: not-allowed'
      "
      :title="
        getCurrentToolHasValues
          ? $t('Create New') + ' ' + $t('Idea')
          : $t('Tool Required')
      "
      @click.stop="togglePopOver"
    >
      <i class="mdi mdi-plus"></i>
      {{ $t("New") }}
    </b-button>
    <b-popover
      ref="popover"
      target="btnNew"
      :show.sync="showPopOver"
      placement="bottom"
      class="form-popover"
    >
      <b-card no-body style="width: 550px">
        <b-card-body>
          <idea-form
            :key="'ideaForm_' + intent"
            type="TOOL"
						section="toolIdeas"
						:item="item"
            @done="togglePopOver"
          ></idea-form>
        </b-card-body>
      </b-card>
    </b-popover>
  </div>
</template>
<script>
import { /* mapState, */ mapGetters } from "vuex";
import Form from "../ideas/Form";
import { Idea } from "@/models";

export default {
  data: () => {
    return {
      intent: new Date().getUTCMilliseconds(),
      option: false,
      showPopOver: false,
      item: {},
    };
  },
  computed: {
    ...mapGetters({
      currentProcess: "process/current",
      currentTool: "companyTool/current",
    }),
    getCurrentToolHasValues() {
      return Boolean(this.currentTool("toolIdeas"));
    },
    process: {
      get() {
        return this.currentProcess("toolIdeas")
          ? this.currentProcess("toolIdeas").process
          : null;
      },
    },
  },
  components: {
    "idea-form": Form,
  },
  methods: {
    togglePopOver() {
      this.item = new Idea();
      this.item.type = "TOOL";
      this.intent = new Date().getUTCMilliseconds();

      this.showPopOver = !this.showPopOver;

      this.$store.dispatch("app/showOverlay", {
        show: this.showPopOver,
        onClick: this.togglePopOver,
      });
    },
  },
};
</script>
