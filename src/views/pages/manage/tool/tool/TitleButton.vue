<template>
  <div class="ml-3" v-if="$can('core/companyTool/create')">
    <b-button
      size="sm"
      class="text-uppercase"
      variant="primary"
      :title="$t('Create New') + ' ' + $t('Tool')"
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
          <tool-form @done="togglePopOver"></tool-form>
        </b-card-body>
      </b-card>
    </b-popover>
  </div>
</template>
<script>
import ClickOutside from "vue-click-outside";
import Form from "./Form";
export default {
  data: () => {
    return {
      option: false,
      showPopOver: false
    };
  },
  directives: {
    ClickOutside
  },
  components: {
    "tool-form": Form
  },
  methods: {
    togglePopOver() {
      this.showPopOver = !this.showPopOver;
      this.$store.dispatch("app/showOverlay", {
        show: this.showPopOver,
        onClick: this.togglePopOver
      });
    }
  }
};
</script>