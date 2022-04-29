<template>
  <div v-if="$can('core/company/create')" class="ml-3">
   
    <b-button
      id="btnNew"
      v-b-tooltip.hover
      size="sm"
      class="text-uppercase"
      variant="primary"
      :title="$t('Create New') + ' ' + $t('Company')"
      @click="togglePopOver"
    >
      <i class="mdi mdi-plus"></i>
      {{ $t('New')}}
    </b-button>
    <!-- <lable v-if='user.can("core/company/manage")'>SUPER ADMIN</lable> -->
    <b-popover
      ref="popover"
      target="btnNew"
      :show.sync="showPopOver"
      placement="bottom"
      class="form-popover"
    >
      <b-card no-body style="width:300px">
        <b-card-body>
          <area-form @done="togglePopOver"></area-form>
        </b-card-body>
      </b-card>
    </b-popover>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import ClickOutside from "vue-click-outside";
import Form from "./Form";

export default {
  directives: {
    ClickOutside
  },
  components: {
    "area-form": Form
  },
  data: () => {
    return {
      option: false,
      showPopOver: false
    };
  },
  computed: {
    ...mapGetters({
      loaded: "app/loaded",
      user: "auth/user",
    })
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