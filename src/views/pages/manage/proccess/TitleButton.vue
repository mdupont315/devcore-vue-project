<template>
  <div v-if="$can('auth/user/create')" class="ml-3">
    <b-button
      id="btnNew"
      v-b-tooltip.hover
      size="sm"
      class="text-uppercase"
      variant="primary"
      :title="$t('Create New') + ' ' + $t('Process')"
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
          <process-form v-if="action==='process'" @done="togglePopOver"></process-form>
          <process-form v-if="action==='stage'" @done="togglePopOver"></process-form>
          <div v-if="!action">
            <a
              href
              class="text-undecorated text-dark font-13x d-block text-bold"
              @click.prevent="action='process'"
            >{{ $t('Process') }}</a>
            <div v-if="currentProcess">
              <hr />
              <a
                href
                class="text-undecorated text-dark font-13x d-block text-bold d-flex flex-row"
                @click.prevent="addStage"
              >
                <span>{{ $t('Stage') }}</span>
                <small
                  v-b-tooltip.hover
                  class="flex-grow-1 text-gray text-capitalize text-right text-overflow ml-5"
                  :title="currentProcess.title.capitalize()"
                >{{ currentProcess.title }}</small>
              </a>
            </div>
          </div>
        </b-card-body>
      </b-card>
    </b-popover>
  </div>
</template>
<script>
import { /* mapState, */ mapGetters } from "vuex";
import ProcessForm from "./Form";

export default {
  data: () => {
    return {
      action: false,
      showPopOver: false
    };
  },
  computed: {
    ...mapGetters({
      current: "process/current"
    }),
    currentProcess: {
      get() {
        return this.current("process") ? this.current("process").process : null;
      }
    }
  },
  components: {
    "process-form": ProcessForm
  },
  methods: {
    togglePopOver() {
      this.showPopOver = !this.showPopOver;
      this.action = null;
      this.$store.dispatch("app/showOverlay", {
        show: this.showPopOver,
        onClick: this.togglePopOver
      });
    },
    addStage() {
      window.vm.$emit("addStage");
      this.togglePopOver();
    }
  }
};
</script>
