<template>
  <div class="issues-template-role-container">
    <issue-effect-role-card
      v-if="!isEditing && item.companyRoleId"
      :input="item"
      :issue="issue"
      @edit="isEditing = !isEditing"
      :identifier="identifier"
      @remove="removeRoleCard"
    />
    <issue-effect-role-form
      v-else
      v-model="setRoleForm"
      :issue="issue"
      @edit="isEditing = !isEditing"
      :identifier="identifier"
      @remove="removeRoleCard"
    />
  </div>
</template>
<script>
import IssuesTemplateRoleCard from "./IssuesTemplateRoleCard.vue";
import IssuesTemplateRoleForm from "./IssuesTemplateRoleForm.vue";

export default {
  props: {
    item: {
      required: false,
      default: () => {},
    },
    issue: {
      required: false,
      default: () => {},
    },
    activeItem: {
      required: false,
      default: () => {},
    },
    identifier: {
      required: false,
    },
    action: {
      required: true,
      default: () => "select",
    },
    value: {
      required: true,
      default: () => {},
    },
  },
  watch: {
    setRoleForm: {
      handler(newVal) {
        this.$emit("input", newVal, this.identifier);
      },
      deep: true,
    },
    action: {
      handler(newVal) {
        if (newVal == "edit") this.isEditing = true;
      },
    },
  },
  computed: {
    setRoleForm: {
      get() {
        return this.value;
      },
      set(input) {
        console.log("role container");
        console.log(input);
        this.$emit("setForm", this.value, this.identifier);
      },
    },
  },

  mounted() {
    if (this.action === "select") {
      this.isEditing = false;
    } else {
      this.isEditing = true;
    }
  },
  data: () => ({
    isEditing: true,
  }),
  methods: {
    removeRoleCard(identifier) {
      console.log(identifier);
      console.log(this.item);
      this.isEditing = !this.isEditing;
      this.$emit("deleteIdentifier", identifier);
    },
  },
  components: {
    "issue-effect-role-card": IssuesTemplateRoleCard,
    "issue-effect-role-form": IssuesTemplateRoleForm,
  },
};
</script>
<style scoped>
.inner-overlay-create {
  position: absolute;
  width: 87vw;
  height: 100vh;
  overflow: hidden;
  left: -44%;
  top: -35vh;
}

.issues-template-role-container {
  max-height: 100%;
  max-width: 310px;
}
</style>
