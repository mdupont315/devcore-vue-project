
<template>
  <transition name="idea_edit_content_container_type" mode="out-in">
    <div class="idea_edit_content_container_type" v-if="visible">
      <div class="idea_edit_type_container-header">
        <div class="idea_edit_type_container-header-title">
          {{ !value.id ? $t("New Content Area") : $t("Edit Content Area") }}
        </div>
        <div class="idea_edit_type_container-header-close"></div>

        <div
          v-if="!hasEdits"
          class="ideaEdit_type_noEdit_content"
          @click="closeIdeaEdit"
        >
          <i class="ri-close-line table-modal-close"></i>
        </div>

        <confirm-button
          v-else
          class="ideaEdit_type_Edit_content"
          @confirm="closeIdeaEdit"
          :customButton="true"
          :confirmPlacement="'left'"
          :confirmMessage="$t('Unsaved Idea Data')"
        >
          <i class="ri-close-line table-modal-close"></i>
        </confirm-button>
      </div>
      <b-form
        class="idea_edit_type_container-body hide_labels"
        @keyup="validate"
        @submit.prevent="save"
        v-if="value"
      >
        <b-card-body class="p-0 ideaEditType-form-fields">
          <div class="form-group">
            <div class="idea_edit_contentType_container-title">
              <div>{{ $t("Name") }}</div>
              <div
                style="
                  display: flex;
                  align-self: center;
                  justify-content: normal;
                "
              >
                <div style="margin-right: 20px">{{ $t("first page") }}</div>
                <b-form-checkbox
                  v-model="mutateForm.isPrimary"
                  name="check-button"
                  style="cursor: pointer; transform: translate(0px, -3px)"
                  size="lg"
                  switch
                />
              </div>
            </div>

            <b-form-input
              id="name"
              class="idea_edit_type_select_title"
              v-validate="'required|min:4'"
              v-model="mutateForm.name"
              v-autofocus
              :disabled="mutateForm.busy"
              :placeholder="$t('Name')"
              type="text"
              name="name"
              data-vv-name="name"
              autocomplete="off"
              autofocus
              :class="{
                'is-invalid':
                  $validateState('name', mutateForm) === false || !isUnique ,
                'is-valid':
                  $validateState('name', mutateForm) === true && isUnique,
              }"
            ></b-form-input>
            <b-form-invalid-feedback>{{
              $displayError("name", mutateForm)
            }}</b-form-invalid-feedback>
            <b-form-invalid-feedback v-if="!isUnique">
              {{
                $t("validation.messages.unique", [$t("Name")])
              }}</b-form-invalid-feedback
            >
          </div>

          <div v-if="!value.id" class="form-group required">
            <div class="idea_edit_contentType_container-title">
              {{ $t("Content Template") }}
            </div>
            <v-select
              v-model="mutateForm.markup"
              label="title"
              v-validate="''"
              name="markup"
              :placeholder="$t('Content Template')"
              class="idea_edit_content_type_select_idea_templates"
              data-vv-name="contentType"
              :reduce="(obj) => obj.content"
              :options="getContentTemplates"
              :class="{
                'is-invalid': mutateForm.markup === null,
                'is-valid': mutateForm.markup !== null,
              }"
            ></v-select>
            <b-form-invalid-feedback>
              {{ $t("validation.messages.required", [$t("Content Template")]) }}
            </b-form-invalid-feedback>
          </div>

          <div class="form-group">
            <div class="idea_edit_type_container-body-process-select-title">
              {{ $t("Role access") }}
            </div>
            <role-selector
              v-if="roleIntent"
              :key="roleIntent"
              name="idea_content_roles"
              id="idea_content_roles"
              class="idea_edit_content_type_select_idea_roles"
              autocomplete="idea_content_roles"
              :placeholder="$t('Role access')"
              v-model="mutateForm.companyRoles"
              :items="[...allRoles]"
              :show-field="true"
              :show-add-btn="false"
            ></role-selector>
          </div>
        </b-card-body>
        <b-card-footer
          style="border-top: none; margin: 10px 0; padding: 0; display: flex"
        >
          <b-col>
            <loading-button
              :disabled="
                vErrors.any() || isLoading || mutateForm.markup === null
              "
              :loading="isLoading"
              size="lg"
              :style="{
                cursor:
                  vErrors.any() || isLoading || mutateForm.markup === null
                    ? 'not-allowed'
                    : 'pointer',
              }"
              block
              style="border-radius: 3px; flex-grow: 1"
              type="submit"
              >{{ $t("Save") }}</loading-button
            >
          </b-col>
          <b-col>
            <confirm-button
              buttonVariant="outline-danger"
              size="lg"
							:isDisabled="vErrors.any() || isLoading || mutateForm.markup === null"
              :style="{
                cursor:
                  vErrors.any() || isLoading || mutateForm.markup === null
                    ? 'not-allowed'
                    : 'pointer',
              }"
              :btnClass="
                isLoading
                  ? 'ideaEdit_path_remove_button-disabled'
                  : 'ideaEdit_path_remove_button-enabled'
              "
              :confirm-title="$t('Delete') + ' ' + mutateForm.name + '?'"
              :confirmPlacement="'top'"
              style="flex-grow: 1; border-radius: 3px; text-align: center"
              :confirm-message="$t('This action cannot be undone!')"
              @confirm="remove"
            >
              <div class="ideaEditPath-remove-idea-button">
                {{ $t("Remove") }}
              </div>
            </confirm-button></b-col
          >
        </b-card-footer>
      </b-form>
    </div>
  </transition>
</template>

<script>
import { mapGetters } from "vuex";
import actionpoints from "./templates/actionpoints.json";
import manual from "./templates/manual.json";
import empty from "./templates/empty.json";
import { isEqual, differenceWith, toPairs, xor } from "lodash";

const emptyIdeaArea = ({ contentType = "" }) => {
  return {
    contentType,
  };
};

export default {
  props: {
    value: {
      type: Object,
      required: false,
    },
    categories: {
      type: Array,
      required: true,
      default: () => [],
    },
    visible: {
      type: Boolean,
      default: () => false,
    },
    primary: {
      type: Object,
      default: () => {},
    },
    isLoading: {
      type: Boolean,
      default: () => false,
    },
  },
  data: () => ({
    selectablePathRoles: [],
    roleIntent: null,
    selectedRoles: [],
  }),
  mounted() {
    this.selectablePathRoles = this.getSelectableRoles;
    this.roleIntent = Math.random();
  },

  computed: {
    ...mapGetters({
      allRoles: "companyRole/all",
      ideaContents: "ideaContent/all",
    }),
    isUnique: {
      get() {
        let names = this.categories.map((category) => {
          return {
            name: category.contentType.toUpperCase(),
            id: category.id,
          };
        });

        if (this.value.id) {
          names = names.filter((x) => x.id !== this.value.id);
        }

        const curName = this.mutateForm.name;
        if (!curName) return true;

        return (
          curName && !names.map((x) => x.name).includes(curName.toUpperCase())
        );
      },
    },
    mutateForm: {
      get() {
        return this.value;
      },
      set(value) {
				console.log("value")
				console.log(value)
        this.$emit("input", value);
      },
    },
    hasEdits: {
      get() {
        if (this.value.id) {
          const content = this.ideaContents.find((x) => x.id === this.value.id);
          if (!content) return false;
          const flatFieldsEqual = this.objectsAreEqual(
            emptyIdeaArea(content),
            emptyIdeaArea(this.value.fields)
          );
          const listFieldsEqual = this.listsAreEqual(
            content.companyRoles.map((role) => role.id),
            this.value.fields.companyRoles
          );

          return !listFieldsEqual || !flatFieldsEqual;
        }

        return false;
      },
    },
    getContentTemplates: {
      get() {
        return [
          {
            title: "Empty",
            content: JSON.stringify(empty),
          },
          {
            title: "Action points",
            content: JSON.stringify(actionpoints),
          },
          {
            title: "Manual",
            content: JSON.stringify(manual),
          },
        ];
      },
    },
    getSelectableRoles: {
      get() {
        return this.allRoles;
      },
    },
    isPrimaryContent: {
      get() {
        if (!this.value || !this.primary.id) return false;
        return this.value._fields.id == this.primary._fields.id;
      },
    },
  },
  watch: {
    "mutateForm.markup": {
      handler() {
        this.validate();
      },
    },
    "mutateForm.isPrimary": {
      handler(newVal) {
        if (newVal) {
          this.mutateForm.fields.companyRoles = this.allRoles;
					this.roleIntent = Math.random()
        }
      },
    },
  },
  methods: {
    validate() {
      this.$validator.validateAll();
    },
    async save() {
      if (!this.vErrors.any()) {
        this.$validator.reset();
        this.$emit("save");
      }
    },
    async remove() {
      await this.$validator.reset();
      this.$emit("remove");
    },
    closeIdeaEdit() {
      this.$emit("close");
    },
    objectsAreEqual(a, b) {
      const changes = differenceWith(toPairs(a), toPairs(b), isEqual);
      return changes.length === 0;
    },
    listsAreEqual(a, b) {
      return a.length === b.length && xor(a, b).length === 0;
    },
  },
};
</script>


<style lang="scss">
.idea_edit_content_type_select_idea_roles > .input-wrapper > div > .counter {
  color: #4294d0;
  z-index: 1;
}
.idea_edit_content_type_select_idea_templates {
  > div > input {
    color: red;
  }
}
.ideaEdit_type_noEdit_content {
  width: 36px;
  margin-right: 15px;
  height: 30px;
  font-size: 24px;
  color: lightgray;
  margin-left: 30px;
  cursor: pointer;
  text-align: center;
}

.idea_edit_type_container-body {
  list-style-type: none;
  border-radius: 3px;
  height: 100%;
  background: #fff;
  padding: 20px;
  height: calc(100% - 60px);
}
.ideaEditType-form-fields > .form-group {
  width: 100%;
}
.ideaEditType-form-fields {
  overflow-y: scroll;
  display: flex;
  height: calc(100% - 50px);
  width: 100%;
  scrollbar-width: none;
  flex-direction: column;
}
.idea_edit_type_container-header-title {
  display: flex;
  align-items: center;
  margin-left: 20px;
  height: calc(100% - 60px);
}

.idea_edit_content_container_type {
  background: #fff;
  position: absolute;
  right: 0;
  height: calc(80vh);
  bottom: 65px;
  width: calc((100vw - 240px) * 0.25);
  border-radius: 5px;
  overflow: hidden;
}

.idea_edit_content_container_type-enter-active,
.idea_edit_content_container_type-leave-active {
  transition: 500ms;
}
.idea_edit_content_container_type-enter-to {
  max-width: calc((100vw - 240px) * 0.25);
}

.idea_edit_content_container_type-enter {
  max-width: 0;
 // position: absolute;
}
.idea_edit_content_container_type-leave-to {
  max-width: 0;
}
.ideaEdit_type_Edit_content > div {
  width: 36px;
  margin-top: 15px;
  margin-right: 15px;
  height: 30px;
  font-size: 24px;
  color: lightgray;
  margin-left: 30px;
  cursor: pointer;
  text-align: center;
}
.idea_edit_contentType_container-title {
  text-transform: uppercase;
  padding: 10px 0;
  font-size: 12px;
  margin-left: 5px;
  display: flex;
  justify-content: space-between;
}

.idea_edit_type_select_title {
  color: #4294d0;
  border-top: 1px solid #fff !important;
  border-left: 1px solid #fff !important;
  border-right: 1px solid #fff !important;
  background: #fff;
  padding-left: 5px;
}

.idea_edit_type_container-header {
  display: flex;
  justify-content: space-between;
  height: 60px;
  border-bottom: 1px solid lightgray;
  background: #fff;
  border-top-right-radius: 3px;
  border-top-left-radius: 3px;
  align-items: center;
}

.idea_edit_type_container-body-process-select-title {
  padding: 10px 0;
  text-transform: uppercase;
  font-size: 12px;
  margin-left: 5px;
}

.idea_edit_content_type_select_idea_templates {
  font-size: 14px;
  margin-left: -5px;
  > div {
    background: #fff !important;
    border-top: 1px solid #fff !important;
    border-left: 1px solid #fff !important;
    border-right: 1px solid #fff !important;
    border-bottom: 1px solid lightgray;
    margin-left: -3px;
  }
}

.idea_edit_content_type_select_idea_roles {
  font-size: 14px;
  margin-left: -5px;
  & > .input-wrapper > div {
    & > .items {
      line-height: 2px;
      border-top: 1px solid #fff !important;
      border-left: 1px solid #fff !important;
      border-right: 1px solid #fff !important;
      border-bottom: 1px solid lightgray;
      margin-left: -10px;
    }
  }
}
</style>
