<template>
  <div>
    <div class="d-flex justify-content-end">
      <confirm-button
        v-if="showDeleteButton"
        class="mr-2 max-width"
        :btn-class="btnDeleteClass"
        :confirm-text="$t('Delete')"
        :confirm-title="deleteTitle"
        :confirm-message="deleteMessage"
        :confirm-placement="deleteConfirmPlacement"
        :confirm-boundary="deleteConfirmBoundary"
        @showConfirm="showConfirm"
        @confirm="deleteItem"
      >
        <i class="mdi mdi-trash-can"></i>
      </confirm-button>

      <b-button
        v-if="showSaveButton"
        :class="btnEditClass"
        style="max-width:150px"
        :disabled="disableSaveButton"
        :loading="loading"
        @click="save"
      >
        <b-spinner v-if="loading" small></b-spinner>
        {{ $t('Save') }}
      </b-button>
      <b-button
        v-if="showCancelButton"
        :class="btnCancelClass"
        variant="link"
        :disabled="disableCancelButton"
        @click="cancel"
      >{{ $t('Cancel') }}</b-button>
    </div>
  </div>
</template>
<script>
import GQLForm from "@/lib/gqlform";

export default {
  name: "TableEditToolsButtons",
  props: {
    item: {
      type: Object,
      required: true
    },
    store: {
      type: String,
      required: true
    },
    loading: {
      type: Boolean,
      required: false
    },
    showSaveButton: {
      type: Boolean,
      required: false,
      default: true
    },
    disableSaveButton: {
      type: Boolean,
      required: false,
      default: false
    },
    showDeleteButton: {
      type: Boolean,
      required: false,
      default: true
    },
    disableDeleteButton: {
      type: Boolean,
      required: false,
      default: false
    },
    showCancelButton: {
      type: Boolean,
      required: false,
      default: true
    },
    disableCancelButton: {
      type: Boolean,
      required: false,
      default: false
    },
    deleteTitle: {
      type: String,
      required: false,
      default() {
        return this.$t("Delete item?");
      }
    },
    deleteMessage: {
      type: String,
      required: false,
      default() {
        return this.$t("This action cannot be undone!");
      }
    },
    btnEditClass: {
      required: false,
      default: () => "btn-sm btn-edit btn-primary px-5 flex-grow-1"
    },
    btnDeleteClass: {
      required: false,
      default: () =>
        "mr-2 btn-delete text-tertiary hover btn-danger btn-sm btn-white border-0"
    },
    btnCancelClass: {
      required: false,
      default: () => "text-gray flex-grow-0 btn-link btn-sm"
    },
    deleteConfirmPlacement: {
      required: false,
      default: () => "bottom"
    },
    deleteConfirmBoundary: {
      required: false
    }
  },
  data: () => ({
    deleting: false
  }),
  methods: {
    async save() {
      this.$emit("save", this.item);
    },
    async cancel() {
      this.$emit("cancel", this.item);
    },
    showConfirm(show) {
      this.$emit("deleting", show);
    },
    async deleteItem() {
      try {
        this.$emit("delete", this.item);
        await this.$store.dispatch(
          `${this.store}/delete`,
          new GQLForm({ id: this.item.id }, null)
        );
      } finally {
        this.deleting = false;
        this.$emit("deleted", this.item);
      }
    }
  }
};
</script>