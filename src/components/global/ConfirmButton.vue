<template>
  <div class="confirm-button-wrapper">
    <div
      class="overlay"
      :class="{'top-all':true}"
      v-if="showConfirmMessage && showOverlay"
      @click="overlayClick"
    ></div>
    <b-button v-bind="$attrs" block ref="button" :class="btnClass" :style="btnStyle" @click="toggleConfirm">
      <slot name="default" />
    </b-button>
    <b-popover
      :target="()=>$refs.button"
      :show.sync="showConfirmMessage"
      :placement="confirmPlacement"
      :boundary="confirmBoundary"
    >
      <slot name="confirm">
        <b-card no-body style="width:200px" class="text-center light">
          <b-card-header>
            <strong class="h6 text-bold">{{ confirmTitle }}</strong>
          </b-card-header>
          <b-card-body>
            <p class="m-0">{{ confirmMessage }}</p>
          </b-card-body>
          <b-card-footer>
            <b-button  @click="confirm" :class="confirmClass" block>{{ confirmText }}</b-button>
            <b-button variant="link" class="text-dark" size="sm" @click="cancel" block>
              <small>{{ cancelText }}</small>
            </b-button>
          </b-card-footer>
        </b-card>
      </slot>
    </b-popover>
  </div>
</template>
<script>
export default {
  name: "confirm-button",
  props: {
    btnClass: {
      required: false
    },
    btnStyle: {
      required: false
    },
    confirmTitle: {
      type: String,
      required: false,
      default: function() {
        return this.$t("Are you sure?");
      }
    },
    confirmMessage: {
      type: String,
      required: false,
      default: function() {
        return this.$t("Do you want to perform this action?");
      }
    },
    confirmText: {
      type: String,
      required: false,
      default: function() {
        return this.$t("Ok");
      }
    },
    cancelText: {
      type: String,
      required: false,
      default: function() {
        return this.$t("Cancel");
      }
    },
    confirmPlacement: {
      required: false,
      default: () => "bottom"
    },
    confirmBoundary: {
      required: false
    },
    showOverlay: {
      type: Boolean,
      required: false,
      default: () => true
    },
    confirmClass:{
        required:false,
        default:()=>'btn-danger'
    },
    contentClass:{
      required:false
    }
  },
  data: () => ({
    showConfirmMessage: false
  }),
  methods: {
    toggleConfirm() {
      this.showConfirmMessage = !this.showConfirmMessage;
      this.$emit("showConfirm", this.showConfirmMessage);
    },
    cancel() {
      this.showConfirmMessage = false;
      this.$emit("showConfirm", this.showConfirmMessage);
      this.$emit("cancel")
    },
    overlayClick() {
      this.cancel();
    },
    confirm() {
      this.$emit("confirm");
      this.showConfirmMessage=false;
    }
  }
};
</script>