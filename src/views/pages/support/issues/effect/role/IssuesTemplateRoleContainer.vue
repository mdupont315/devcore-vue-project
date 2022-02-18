<template>
  <div
    class="issues-template-role-container"
    id="issues-template-role-container"
  >
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
      this.$emit("deleteIdentifier", identifier);
    },
  },
  components: {
    "issue-effect-role-card": IssuesTemplateRoleCard,
    "issue-effect-role-form": IssuesTemplateRoleForm,
  },
};
</script>
<style>
.issueEffectAddForm-form-popover[x-placement="top"]
  > .popover-body
  > .card
  > div
  > div
  > .issues-template-card-container
  > .issues-template-card-container-items
  > .issues-template-role-container {
  align-self: flex-end;
}

.issueEffectAddForm-form-popover[x-placement="bottom"]
  > .popover-body
  > .card
  > div
  > div
  > .issues-template-card-container
  > .issues-template-card-container-items
  > .issues-template-role-container {
  align-self: flex-start;
}
</style>
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
  z-index: 100;
  max-height: 100%;
  background: transparent;
  max-width: 310px;
  /*  height: 100%; */
}
</style>
