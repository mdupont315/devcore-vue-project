<template>
  <div class="buttons">
    <div v-if="deleting" class="overlay" :class="{'top-all':true}" @click="overlayClick"></div>
    <b-button v-if="showEditButton" :class="btnEditClass" @click="editItem">
      <i class="mdi mdi-pencil"></i>
    </b-button>
    <confirm-button
      v-if="showDeleteButton"
      :class="btnDeleteClass"
      :btn-class="btnDeleteClass"
      :confirm-text="$t('Delete')"
      :confirm-title="deleteTitle"
      :confirm-message="deleteMessage"
      :confirm-placement="deleteConfirmPlacement"
      :confirm-boundary="deleteConfirmBoundary"
      @showConfirm="showConfirm"
      @confirm="deleteItem"
    >
      <i class="mdi mdi-close"></i>
    </confirm-button>
  </div>
</template>
<script>
import GQLForm from "@/lib/gqlform";
import ConfirmButton from "../ConfirmButton";

export default {
  name: "TableToolsButtons",
  components: {
    "confirm-button": ConfirmButton
  },
  props: {
    item: {
      type: Object,
      required: true
    },
    store: {
      type: String,
      required: true
    },
    showEditButton: {
      type: Boolean,
      required: false,
      default: true
    },
    showDeleteButton: {
      type: Boolean,
      required: false,
      default: true
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
      default: () => "btn-xs btn-action btn-edit"
    },
    btnDeleteClass: {
      required: false,
      default: () => "btn-xs btn-action btn-delete"
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
    overlayClick() {
      if (this.deleting) {
        this.cancelDelete();
      }
    },
    async editItem() {
      this.$emit("editItem", this.item);
    },
    async showConfirm(confirming) {
      this.$store.dispatch("app/toggleInnerOverlay");
      this.$emit("deleting", confirming);
    },
    async deleteItem() {
      try {
        await this.$store.dispatch(
          `${this.store}/delete`,
          new GQLForm({ id: this.item.id }, null)
        );
      } finally {
        this.$store.dispatch("app/toggleInnerOverlay");
        this.$emit("deleted", this.item);
      }
    }
  }
};
</script>