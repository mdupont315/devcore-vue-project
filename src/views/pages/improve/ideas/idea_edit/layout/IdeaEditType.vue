
<template>
  <transition name="idea_edit_content_container_type" mode="out-in">
    <div class="idea_edit_content_container_type" v-show="visible">
      <div class="idea_edit_type_container-header">
        <div class="idea_edit_type_container-header-title">
          {{
            value && value.id ? $t("Edit Content Area") : $t("New Content Area")
          }}
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
        @submit.prevent="save"
        v-if="value && mutateForm"
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
                <div
                  @click="setIsPrimary()"
                  style="
                    padding-right: 45px;
                    position: absolute;
                    z-index: 1;
                    cursor: pointer;
                    margin-left: -50px;
                  "
                >
                  {{ $t("first page") }}
                </div>
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
                  $validateState('name', mutateForm) === false || !isUnique,
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

          <div v-if="!value.id && mutateForm" class="form-group required">
            <div class="idea_edit_contentType_container-title">
              {{ $t("Content Template") }}
            </div>
            <v-select
              v-model="mutateForm.markup"
              label="title"
              name="markup"
              :placeholder="$t('Content Template')"
              class="idea_edit_content_type_select_idea_templates"
              data-vv-name="contentType"
              :reduce="(obj) => obj.content"
              :options="getContentTemplates"
              :clearable="false"
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
              <div v-if="mutateForm.isPrimary">
                <b-popover
                  target="idea_content_type_info_info_text-info"
                  triggers="hover"
                  placement="top"
                  boundary="window"
                >
                  <div class="idea_content-type_disabled-info_text">
                    {{ $t("home page has all roles") }}
                  </div>
                </b-popover>

                <div
                  id="idea_content_type_info_info_text-info"
                  class="idea_content_type_info_info_text-info"
                >
                  <i
                    class="mdi mdi-information idea_content_type_info_info_icon"
                  ></i>
                </div>
              </div>
            </div>

            <role-selector
              v-if="roleIntent"
              :key="roleIntent"
              :isDisabled="mutateForm.isPrimary"
              name="idea_content_roles"
              id="idea_content_roles"
              :class="{ is_roles_disabled: mutateForm.isPrimary }"
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
              :isDisabled="isRemoveButtonDisabled()"
              :style="{
                cursor:
                  vErrors.any() ||
                  isLoading ||
                  !mutateForm ||
                  mutateForm.markup === null ||
                  !mutateForm.id
                    ? 'not-allowed'
                    : 'pointer',
              }"
              :btnClass="
                isLoading ||
                !mutateForm ||
                mutateForm.markup === null ||
                !mutateForm.id
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
    comparisonForm: null,
    hasEdits: false,
  }),
  mounted() {


    this.selectablePathRoles = this.getSelectableRoles;
    this.roleIntent = Math.random();

    // default idea markup content type as default
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
        this.$emit("input", value);
      },
    },
    // hasEdits: {
    //   get() {
    //     console.log(this.value.id);
    //     if (this.value.id) {
    //       const content = this.ideaContents.find((x) => x.id === this.value.id);
    //       if (!content) return false;
    //       const flatFieldsEqual = this.objectsAreEqual(
    //         emptyIdeaArea(content),
    //         emptyIdeaArea(this.value.fields)
    //       );
    //       const listFieldsEqual = this.listsAreEqual(
    //         content.companyRoles.map((role) => role.id),
    //         this.value.fields.companyRoles
    //       );
    //       console.log(content);
    //       console.log(this.value.fields);

    //       return !listFieldsEqual || !flatFieldsEqual;
    //     }

    //     return false;
    //   },
    // },
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
    mutateForm: {
      deep: true,
      handler(newVal) {
        console.log(newVal);
        if (newVal) {
          this.hasEdits = this.checkEdits();
          if (!this.comparisonForm && newVal) {
            this.comparisonForm = newVal.fields;
          }
        }
      },
    },
    "mutateForm.id": {
      handler(newVal) {
        this.comparisonForm = null;
      },
    },
    "mutateForm.isPrimary": {
      handler(newVal) {
        if (newVal) {
          this.mutateForm.fields.companyRoles = this.allRoles;
          this.roleIntent = Math.random();
        }
      },
    },
  },
  methods: {
    isRemoveButtonDisabled() {
      if (this.mutateForm || this.mutateForm.markup) {
        return this.vErrors.any() || this.isLoading || !this.mutateForm.id;
      }
      return true;
    },
    checkEdits() {
      if (this.value && this.value.id) {
        const content = this.ideaContents.find((x) => x.id === this.value.id);

        if (!content) return false;

        // create comparison object
        const compareObj = ({ companyRoles, markup, name }) => ({
          companyRoles,
          markup,
          name,
        });
        const flatFieldsEqual = this.objectsAreEqual(
          emptyIdeaArea(compareObj({ ...content, name: content.contentType })),
          emptyIdeaArea(compareObj(this.value.fields))
        );
        const listFieldsEqual = this.listsAreEqual(
          content.companyRoles.map((role) => role.id ?? role),
          this.value.fields.companyRoles.map((role) => role.id ?? role)
        );

        return !listFieldsEqual || !flatFieldsEqual;
      }

      return false;
    },
    setIsPrimary() {
      this.mutateForm.isPrimary = !this.mutateForm.isPrimary;
    },
    validate() {
      this.$validator.validateAll();
    },
    async save() {
      await this.$validator.validateAll();
      if (!this.vErrors.any()) {
        await this.$validator.reset();
        this.$emit("save");
      }
    },
    async remove() {
      await this.$validator.reset();
      this.$emit("remove");
    },
    async closeIdeaEdit() {
      await this.$validator.reset();
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
input[type="checkbox"] {
  cursor: pointer;
}
.idea_edit_content_type_select_idea_roles {
  &.is_roles_disabled > .input-wrapper > div > .counter {
    color: lightgrey;
    cursor: not-allowed;
    z-index: 1;
  }
  & > .input-wrapper > div > .counter {
    color: #4294d0;
    z-index: 1;
  }
}
.idea_edit_content_type_select_idea_templates {
  > div > input {
    color: red;
  }
}
.ideaEdit_type_noEdit_content {
  width: 36px;
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
  border-top-left-radius: 3px;
  border-bottom-left-radius: 3px;
  overflow: hidden;
}

.idea_edit_content_container_type-enter-active,
.idea_edit_content_container_type-leave-active {
  transition: 500ms;
}
.idea_edit_content_container_type-enter-to {
  max-width: calc((100vw - 240px) * 0.25);
}

.idea_edit_content_container_type-leave-to {
  max-width: 0;
}

.idea_edit_content_container_type-leave {
  max-width: calc((100vw - 240px) * 0.25);
  // position: absolute;
}

.idea_edit_content_container_type-enter {
  max-width: 0;
  // position: absolute;
}

.ideaEdit_type_Edit_content > div {
  width: 36px;
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
  align-items: center;
  display: flex;
  height: 38px;
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
