<template>
  <div class="ml-3" v-if="$can('core/company/create')">
   
    <b-button
      size="sm"
      class="text-uppercase"
      variant="primary"
      :title="$t('Create New') + ' ' + $t('Company')"
      v-b-tooltip.hover
      id="btnNew"
      @click="togglePopOver"
    >
      <i class="mdi mdi-plus"></i>
      {{ $t('New')}}
    </b-button>
    <!-- <lable v-if='user.can("core/company/manage")'>SUPER ADMIN</lable> -->
    <b-popover
      target="btnNew"
      :show.sync="showPopOver"
      placement="bottom"
      class="form-popover"
      ref="popover"
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
    "area-form": Form
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