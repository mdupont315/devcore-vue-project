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
      :title="$t('Create New') + ' ' + $t('Idea')"
      @click="togglePopOver"
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
            type="PROCESS"
            :item="item"
						section="ideas"
            @done="togglePopOver"
          ></idea-form>
        </b-card-body>
      </b-card>
    </b-popover>
  </div>
</template>
<script>
import { /* mapState, */ mapGetters } from "vuex";
import Form from "./Form";
import { Idea } from "@/models";

export default {
  data: () => {
    return {
      option: false,
      showPopOver: false,
      item: {},
    };
  },
  computed: {
    ...mapGetters({
      currentProcess: "process/current",
    }),
    process: {
      get() {
        return this.currentProcess("ideas")
          ? this.currentProcess("ideas").process
          : null;
      },
    },
  },
  components: {
    "idea-form": Form,
  },
  mounted() {},
  methods: {
    togglePopOver() {
      this.item = new Idea();
      console.log(this.item);
      this.showPopOver = !this.showPopOver;
      this.$store.dispatch("app/showOverlay", {
        show: this.showPopOver,
        onClick: this.togglePopOver,
      });
    },
  },
};
</script>
