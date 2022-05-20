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
      v-if="!customButton"
      class="confirm-buttom-general"
      v-bind="$attrs"
      :variant="buttonVariant"
      :disabled="isDisabled"
      block
      :class="btnClass"
      :style="btnStyle"
      @click="toggleConfirm"
    >
      <slot name="default" />
    </b-button>
    <div
      v-else
      ref="button"
      class="confirm-buttom-custom"
      v-bind="$attrs"
      :class="btnClass"
      :style="btnStyle"
      @click="toggleConfirm"
    >
      <slot></slot>
    </div>
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
            <strong class="h6 text-bold" style="font-size: 14px">{{
              confirmTitle
            }}</strong>
          </b-card-header>
          <b-card-body>
            <p class="m-0" style="font-size: 14px">{{ confirmMessage }}</p>
          </b-card-body>
          <b-card-footer>
            <b-button
              :class="confirmClass"
              style="font-size: 14px"
              block
              @click="confirm"
              >{{ confirmText }}</b-button
            >
            <b-button
              variant="link"
              class="text-dark"
              size="sm"
              block
              @click="cancel"
            >
              <small style="font-size: 14px">{{ cancelText }}</small>
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
    customButton: {
      required: false,
      default: () => false,
    },
    buttonVariant: {
      required: false,
      default: () => "outline-primary",
    },
    isDisabled: {
      required: false,
      default: () => false,
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

.confirm-buttom-custom {
  font-size: 24px;
  color: lightgray;
  margin-left: 30px;
  cursor: pointer;
}

.ideaEdit_path_remove_button-disabled:hover {
	cursor:not-allowed;
	background: #fff
}
</style>
