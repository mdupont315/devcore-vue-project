<template>
  <div class="buttons">
    <div class="overlay" :class="{'top-all':true}" v-if="deleting" @click="overlayClick"></div>
    <b-button :class="btnEditClass" v-if="showEditButton" @click="editItem">
      <i class="mdi mdi-pencil"></i>
    </b-button>
    <confirm-button
      :class="btnDeleteClass"
      :btnClass="btnDeleteClass"
      v-if="showDeleteButton"
      :confirmText="$t('Delete')"
      :confirmTitle="deleteTitle"
      :confirmMessage="deleteMessage"
      :confirmPlacement="deleteConfirmPlacement"
      :confirmBoundary="deleteConfirmBoundary"
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
  name: "table-tools-buttons",
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
      default: function() {
        return this.$t("Delete item?");
      }
    },
    deleteMessage: {
      type: String,
      required: false,
      default: function() {
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
  components: {
    "confirm-button": ConfirmButton
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
          this.store + "/delete",
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