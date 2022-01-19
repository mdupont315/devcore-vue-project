<template>
  <div class="confirm-button-wrapper" v-click-outside="outsideClicked">
    <div
      v-if="showConfirmMessage && showOverlay"
      class="overlay"
      :class="{ 'top-all': true }"
      @click="overlayClick"
    ></div>
    <b-button
      ref="button"
      class="confirm-buttom-general"
      v-bind="$attrs"
      block
      :class="btnClass"
      :style="btnStyle"
      @click="toggleConfirm"
    >
      <slot name="default" />
    </b-button>
    <b-popover
      :target="() => $refs.button"
      :show.sync="showConfirmMessage"
      :placement="confirmPlacement"
      :boundary="confirmBoundary"
			:custom-class="popoverCustomClass"
    >
      <slot name="confirm">
        <b-card no-body style="width: 200px" class="text-center light">
          <b-card-header>
            <strong class="h6 text-bold">{{ confirmTitle }}</strong>
          </b-card-header>
          <b-card-body>
            <p class="m-0">{{ confirmMessage }}</p>
          </b-card-body>
          <b-card-footer>
            <b-button :class="confirmClass" block @click="confirm">{{
              confirmText
            }}</b-button>
            <b-button
              variant="link"
              class="text-dark"
              size="sm"
              block
              @click="cancel"
            >
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
  name: "ConfirmButton",
  props: {
    btnClass: {
      required: false,
    },
    btnStyle: {
      required: false,
    },
    popoverCustomClass: {
      required: false,
    },
    confirmTitle: {
      type: String,
      required: false,
      default() {
        return this.$t("Are you sure?");
      },
    },
    confirmMessage: {
      type: String,
      required: false,
      default() {
        return this.$t("Do you want to perform this action?");
      },
    },
    confirmText: {
      type: String,
      required: false,
      default() {
        return this.$t("Ok");
      },
    },
    cancelText: {
      type: String,
      required: false,
      default() {
        return this.$t("Cancel");
      },
    },
    confirmPlacement: {
      required: false,
      default: () => "bottom",
    },
    confirmBoundary: {
      required: false,
    },
    showOverlay: {
      required: false,
      default: () => true,
    },
    confirmClass: {
      required: false,
      default: () => "btn-danger",
    },
    contentClass: {
      required: false,
    },
    isSelected: {
      required: false,
      default: () => false,
    },
  },
  data: () => ({
    showConfirmMessage: false,
  }),
  methods: {
    outsideClicked() {
      if (!this.showOverlay && this.isSelected) {
        this.showConfirmMessage = false;
      }
    },
    toggleConfirm() {
      this.showConfirmMessage = !this.showConfirmMessage;
      this.$emit("showConfirm", this.showConfirmMessage);
    },
    cancel() {
      this.showConfirmMessage = false;
      this.$emit("showConfirm", this.showConfirmMessage);
      this.$emit("cancel");
    },
    overlayClick() {
      this.cancel();
    },
    confirm() {
      this.$emit("confirm");
      this.showConfirmMessage = false;
    },
  },
};
</script>
<style>
.confirm-buttom-general:focus,
.confirm-buttom-general:active {
  -webkit-box-shadow: none;
  box-shadow: none;
}
</style>
