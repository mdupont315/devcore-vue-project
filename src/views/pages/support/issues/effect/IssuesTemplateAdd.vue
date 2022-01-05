<template>
  <div style="justify-content: flex-start">
    <b-button
      size="xs"
      :ref="`issueEffectAddBtn${issue.id}`"
      variant="action"
      @click="toggleIssueOpenSelect"
      class="
        btn-primary btn-block
        text-uppercase text-bold
        issueEffectAddOpen-btn
      "
      ><div class="issue_effect_add">
        <div style="flex-grow: 2; padding: 10px">{{ $t("Add") }}</div>
        <div style="place-self: center">
          <div
            class="issue_effect_add_icon"
            :class="
              isSelectionOpen
                ? 'issue_effect_add_icon-open'
                : 'issue_effect_add_icon-close'
            "
          >
            <i class="mdi mdi-chevron-down issue_effect_add_icon_chevron"></i>
          </div>
        </div>
      </div>
    </b-button>

    <b-popover
      v-if="isSelectionOpen"
      ref="popover"
      :target="() => $refs[`issueEffectAddBtn${issue.id}`]"
      triggers="click"
      :show="openState && isSelectionOpen"
      :offset="tableWidth * 0.1"
      boundary="window"
      @click="closeIt"
      placement="top"
      class="form-popover"
      boundary-padding="100"
      custom-class="issueEffectAddForm-form-popover"
    >
      <b-card
        no-body
        style="background: transparent"
        v-if="openState"
        :style="{ width: tableWidth * 0.25 - 10 + 'px' }"
      >
        <div class="form-label-group select required">
          <div style="background: #fff">
            <!-- Viewing -->
            <div
              v-if="
                !issueEffectIsCreating &&
                !issueEffectIsSelecting &&
                !issueEffectIsEditing
              "
              class="issueEffect_add_form-new-issue-effect-view"
              @click="toggleIssueTemplateForm('create', null)"
            >
              <div style="display: flex; align-items: center">
                <icoChevronAdd width="22" height="22"></icoChevronAdd>

                <span class="issueEffect_add_form_newText">{{
                  $t("New Issue Effect")
                }}</span>
              </div>
            </div>

            <!-- Selecting -->
            <div v-else-if="issueEffectIsSelecting">
              <div class="issueEffect_add_form-new-issue-effect-select">
                <div
                  class="issueEffect_add_form-new-issue-effect-select-delete"
                >
                  <div
                    @click="toggleIssueTemplateForm('select', null)"
                    class="issueEffect_add_form-new-issue-effect-select-back"
                  >
                    <i class="mdi mdi-close" style="font-size: 20px"></i>
                  </div>

                  <confirm-button
                    class="issueEffect_add_form-new-issue-effect-select-remove"
                    @confirm="() => deleteItems(itemForm)"
                    :confirmPlacement="'left'"
                    :confirmMessage="$t('IssueEffectDeleteConfirmation')"
                    :showOverlay="false"
                    :btnStyle="'display:flex;flex-direction:row;background:#fff;border:none;color:#000;align-items:center;box-shadow: none;'"
                  >
                    <icoEffectDelete width="16" height="16" /><span>{{
                      $t("Issue Effect Templates Remove")
                    }}</span>
                  </confirm-button>
                </div>
                <div class="issueEffect_add_form-new-issue-effect-select-edit">
                  <div
                    class="issueEffect_add_form-new-issue-effect-select-header"
                  >
                    <b-button
                      variant="outline-primary"
                      style="width: 70px; height: 30px"
                      @click="toggleIssueTemplateForm('edit', itemForm)"
                    >
                      <icoEffectEdit width="16" height="16"
                    /></b-button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Editing -->
            <div v-else-if="issueEffectIsEditing">
              <div class="issueEffect_add_form-new-issue-effect-select">
                <div
                  class="issueEffect_add_form-new-issue-effect-select-delete"
                >
                  <div
                    @click="toggleIssueTemplateForm(formType, null)"
                    class="issueEffect_add_form-new-issue-effect-select-back"
                  >
                    <i class="mdi mdi-close" style="font-size: 20px"></i>
                  </div>

                  <div
                    class="issueEffect_add_form-new-issue-effect-select-remove"
                    @click="deleteItems(itemForm)"
                  >
                    <icoEffectDelete
                      width="16"
                      height="16"
                      ref="issueEffectTemplateRemoveIcon"
                    /><span>{{ $t("Issue Effect Templates Remove") }}</span>
                  </div>
                </div>
                <div
                  class="issueEffect_add_form-new-issue-effect-select-edit"
                  v-if="!issueEffectIsEditing"
                >
                  <div
                    class="issueEffect_add_form-new-issue-effect-select-header"
                  >
                    <b-button
                      variant="outline-primary"
                      style="width: 70px; height: 30px"
                    >
                      <icoEffectEdit width="16" height="16"
                    /></b-button>
                  </div>
                </div>
                <div v-else class="issueEffect_add_form-new-issue-effect-edit">
                  <div
                    class="issueEffect_add_form-new-issue-effect-edit-header"
                  >
                    <b-button @click="issueEffectAddRole">{{
                      $t("Add Another Role")
                    }}</b-button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Creating -->
            <div v-else>
              <div
                class="issueEffect_add_form-new-issue-effect-create-header"
                style="width: 100%"
              >
                <i
                  class="mdi mdi-close"
                  style="font-size: 20px"
                  @click="issueEffectIsCreating = false"
                ></i>
                <b-button @click="issueEffectAddRole">{{
                  $t("Add Another Role")
                }}</b-button>
              </div>
            </div>
            <div
              style="overflow: scroll; max-height: 230px"
              v-if="
                !issueEffectIsCreating &&
                !issueEffectIsSelecting &&
                !issueEffectIsEditing &&
                getItems.length > 0
              "
            >
              <div
                v-for="(item, index) in getItems"
                :key="index"
                class="issueEffect_add_form_templates"
                :class="
                  issue.id == item.issueActiveId
                    ? 'form_templates-active'
                    : 'form_templates-not-active'
                "
              >
                <div class="issueEffect_add_form_templates-item">
                  <div
                    class="issueEffect_add_form_templates-item-selected"
                    @click="toggleIssueTemplateForm('select', item, index)"
                  >
                    <div
                      style="flex-grow: 1; padding: 10px"
                      v-if="loadingIndex !== index"
                    >
                      <icoCheck width="10" height="10"></icoCheck>
                    </div>
                    <div
                      v-else
                      class="
                        issueEffect_add_form_templates-item-selected-spinner
                      "
                    >
                      <b-spinner small />
                    </div>

                    <div
                      class="issueEffect_add_form_templates-item-selected-title"
                    >
                      {{ item.title }}
                    </div>
                  </div>
                  <div
                    class="issueEffect_add_form_templates_item-edit"
                    @click="toggleIssueTemplateForm('edit', item, index)"
                  >
                    {{ $t("Edit") }}
                  </div>
                </div>
              </div>
            </div>
            <div v-else>
              <issue-effect-form
                v-if="issueEffectIsEditing || issueEffectIsCreating"
                v-model="itemForm"
                @saveAll="saveAll"
                :inputsAreNotValid="inputsAreNotValid"
                :issue="issue"
                :tableWidth="tableWidth"
              />
              <issue-effect-card
                v-else-if="getItems.length > 0"
                :input="itemForm"
                :issue="getIssue"
                @setSelectedTemplate="setIssueTemplate"
                @unsetSelectedTemplate="unsetIssueTemplate"
                :tableWidth="tableWidth"
              />
            </div>

            <issue-effect-card-container
              v-if="
                issueEffectIsCreating ||
                issueEffectIsEditing ||
                issueEffectIsSelecting
              "
              style="overflow: hidden"
              @toggleOverlay="toggleOverlay"
              :activeItem="itemForm"
              :tableWidth="tableWidth"
            >
              <issue-effect-role-container
                style="margin-bottom: 10px; margin-left: 10px"
                v-for="(item, index) in itemForm.templates"
                :identifier="index"
                :value="itemForm.templates[index]"
                @input="setRoleForm($event, index)"
                @deleteIdentifier="removeTemplateCard"
                :action="formType"
                :issue="issue"
                :key="index"
                :item="item"
              ></issue-effect-role-container>
            </issue-effect-card-container>
          </div>
        </div>
      </b-card>
    </b-popover>
  </div>
</template>
<script>
import icoCheck from "@/assets/img/icons/svg/ico-check.svg?inline";
import icoChevronAdd from "@/assets/img/icons/svg/ico-chevron-add.svg?inline";
import icoEffectDelete from "@/assets/img/icons/svg/ico-delete.svg?inline";
import icoEffectEdit from "@/assets/img/icons/svg/ico-issue-effect-edit.svg?inline";
import IssuesTemplateForm from "./IssuesTemplateForm.vue";
import IssuesTemplateCard from "./IssuesTemplateCard.vue";
import IssuesTemplateCardContainer from "./IssuesTemplateCardContainer.vue";
import IssuesTemplateRoleContainer from "./role/IssuesTemplateRoleContainer.vue";
import { mapGetters } from "vuex";
import GQLForm from "@/lib/gqlform";

const deserializeRoleForm = (data) => {
  const { id } = data;
  const { companyRoleId } = data;
  const { effectTime } = data;
  const { effectValue } = data;
  const { processId } = data;
  const { stageId } = data;
  const { operationId } = data;
  const { phaseId } = data;

  return {
    id,
    companyRoleId,
    effectTime,
    effectValue,
    processId,
    stageId,
    operationId,
    phaseId,
  };
};

export default {
  components: {
    icoCheck,
    icoChevronAdd,
    icoEffectDelete,
    icoEffectEdit,
    "issue-effect-role-container": IssuesTemplateRoleContainer,
    "issue-effect-card": IssuesTemplateCard,
    "issue-effect-form": IssuesTemplateForm,
    "issue-effect-card-container": IssuesTemplateCardContainer,
  },
  props: {
    items: {
      required: false,
      default: () => [],
    },
    issue: {
      required: false,
      default: () => {},
    },
    tableWidth: {
      required: false,
      default: () => 1582,
    },
    openState: {
      required: true,
      default: () => false,
    },
  },

  computed: {
    ...mapGetters({
      companyRoles: "companyRole/all",
      processes: "process/all",
      users: "user/all",
    }),

    getIssue() {
      return this.issue;
    },
    getItems() {
      // return master templates unless replacable with edited one

      if (this.issue.effect) {
        //get active from issue
        if (this.issue.effect.effectId) {
          const itemsFiltered = this.items.filter(
            (x) =>
              x.issueActiveId === null && x.id != this.issue.effect.effectId
          );

          const itemsUnique = itemsFiltered.filter(
            (x) => x.id != this.issue.effectTemplateId
          );

          const uniques = [...itemsUnique, this.issue.effect];
          return [
            ...new Set(
              uniques.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
              )
            ),
          ];
        } else {
          const active = this.items.find(
            (x) => x.issueActiveId == this.issue.id
          );
          if (active) {
            return [
              ...new Set(this.items.filter((x) => x.id != active.effectId)),
            ];
          }
          return [...new Set(this.items)];
        }
      }

      return [...new Set(this.items.filter((x) => x.issueActiveId === null))];
    },
  },
  watch: {
    itemForm: {
      deep: true,
      handler(newVal) {
        this.inputsAreNotValid = newVal.templates.some(
          (x) => !x.companyRoleId || !x.stageId || !x.stageId
        );
      },
    },
    isSelectionOpen: {
      handler(newVal) {
        if (!newVal) {
          this.$emit("selectionClosed");
        }
      },
    },
  },
  data: () => ({
    storeName: "issueEffect",
    isSelectionOpen: null,
    loadingIndex: null,
    inputsAreNotValid: false,
    isRemoving: false,
    defaultForm: {
      id: undefined,
      title: null,
      effectTime: null,
      effectValue: null,
      templates: [],
    },
    itemForm: new GQLForm({
      id: undefined,
      title: null,
      effectTime: null,
      effectValue: null,
      templates: [],
    }),
    formType: "create",
    issueEffectIsCreating: false,
    issueEffectIsEditing: false,
    issueEffectIsSelecting: false,
    issueEffectAddSelected: false,
    issueEffectAddOpen: false,
    roleForm: {
      id: undefined,
      companyRoleId: null,
      effectTime: null,
      effectValue: null,
      processId: null,
      stageId: null,
      operationId: null,
      phaseId: null,
    },
  }),
  methods: {

    closeIt() {
			console.log("Close")
    },
    toggleOverlay() {
      this.$emit("toggleOverlay");
    },
    async saveAll() {
      try {
        if (this.formType === "create") {
          await this.$store.dispatch(`${this.storeName}/create`, this.itemForm);
        } else {
          await this.$store.dispatch(`${this.storeName}/update`, this.itemForm);
        }
      } catch (e) {
        console.log(e);
      } finally {
        this.issueEffectIsEditing = false;
        this.issueEffectIsCreating = false;
      }
    },
    issueEffectAddRole() {
      this.itemForm.templates.push({
        ...this.roleForm,
      });
    },
    setRoleForm(form, identifier) {
      this.itemForm.templates[identifier] = form;
    },

    async toggleEffectForm(id) {
      if (id) {
        //Refetch edits
        this.itemForm = await this.$store.dispatch("issueEffect/findById", {
          id: id,
        });
        this.issueEffectIsEditing = false;
        this.issueEffectIsSelecting = true;
      } else {
        this.issueEffectIsCreating = false;
        this.isSelectionOpen = true;
      }
    },
    async removeTemplateCard(identifier) {
      const roleCard = this.itemForm.templates[identifier];
      if (roleCard && !roleCard.id) {
        this.itemForm.templates.splice(identifier, 1);
      } else {
        const deleteForm = new GQLForm({
          id: roleCard.id,
        });
        try {
          await this.$store.dispatch("issueEffect/deleteTemplate", deleteForm);
        } catch (e) {
          console.log(e);
        }
      }
    },
    async deleteItems(item) {
      if (item) {
        try {
          await this.$store.dispatch("issueEffect/delete", item);
        } catch (e) {
          console.log(e);
        } finally {
          await this.$store.dispatch("issue/findAll", { force: true });
          this.issueEffectIsEditing = false;
          this.issueEffectIsSelecting = false;
          this.itemForm.templates = [];
        }
      }
    },

    setIssueTemplate(id) {
      this.$emit("setTemplate", id);
    },
    unsetIssueTemplate(id) {
      this.$emit("unsetTemplate", id);
    },
    setIssueEffectTemplateActiveIndex(index) {
      this.$emit("selectedTemplate", this.getItems[index]);
    },
    async toggleIssueTemplateForm(type, item, loadingIndex = null) {
      this.loadingIndex = loadingIndex;
      this.initForm = null;
      let effect = this.defaultForm;
      if (item) {
        try {
          effect = await this.$store.dispatch("issueEffect/findById", {
            id: item.id,
          });
          this.issue.effect = effect;
        } catch (e) {
          console.log(e);
        }
      }
      await this.initItemForm(effect, type);

      this.loadingIndex = null;
    },
    async initItemForm(effect, type) {
      Object.keys(effect || {})
        .filter((key) => key in this.itemForm)
        .forEach((key) => {
          if (key !== "templates") {
            this.itemForm[key] = effect[key];
          } else {
            this.itemForm[key] = effect[key].map((t) => deserializeRoleForm(t));
          }

          this.toggleControls(type);
        });
    },
    async toggleIssueOpenSelect() {
      this.isSelectionOpen = !this.isSelectionOpen;
      if (this.isSelectionOpen) {
        this.issueEffectIsCreating = false;
        this.issueEffectIsEditing = false;
        this.issueEffectIsSelecting = false;
      }
      this.$emit("toggle", this.issue, "issueAdd");
    },
    toggleControls(type) {
      this.formType = type;
      if (type === "create") {
        this.issueEffectIsEditing = false;
        this.issueEffectIsSelecting = false;
        this.issueEffectIsCreating = !this.issueEffectIsCreating;
      }

      if (type === "edit") {
        this.issueEffectIsSelecting = false;
        this.issueEffectIsCreating = false;
        this.issueEffectIsEditing = !this.issueEffectIsEditing;
      }

      if (type === "select") {
        this.issueEffectIsEditing = false;
        this.issueEffectIsCreating = false;
        this.issueEffectIsSelecting = !this.issueEffectIsSelecting;
      }

      if (
        !this.issueEffectIsEditing &&
        !this.issueEffectIsCreating &&
        !this.issueEffectIsSelecting
      ) {
        this.formType = null;
      }
    },
  },
};
</script>

<style>
.issueEffectAddForm-form-popover[x-placement="top"] {
  top: -20px !important;
  justify-content: flex-end;
}

.issueEffectAddForm-form-popover[x-placement="bottom"] {
  top: 20px !important;
  justify-content: flex-start;
}
</style>
<style scoped>
.issueEffectAddOpen-btn {
  display: flex;
  font-size: 1.2rem;
  white-space: nowrap;
  min-width: min-content;
  max-width: 91px;
  height: 35px;
  align-items: center;
  justify-content: center;
}
.issue_effect_add {
  padding: 0 5px;
  display: flex;
  width: 100%;
}

.issue_effect_add_icon {
  background: #fff;
  color: rgb(66, 148, 208);
  width: 18px;
  height: 18px;
  border-radius: 50%;
  flex-grow: 1;
}

.issue_effect_add_icon_chevron {
  display: flex;
  transform: translate(0px, -2px);
  place-content: center;
}
/*
.issueEffectAddForm-form-popover > .arrow {
  display: none !important;
} */

.issueEffect_add_form_templates {
  display: flex;
  width: 100%;
  height: 30px;
  background: #fff;
  align-items: center;
  cursor: pointer;
}

.issueEffect_add_form-new-issue-effect-select {
  display: flex;
  width: 100%;
  border-radius: 3px;
  height: 40px;
  background: #fff;
  align-items: center;
  cursor: pointer;
  padding-left: 10px;
  width: 100%;
  padding: 20px 20px 0 20px;
}

.issueEffectAddForm-form-popover {
  background: transparent;
  min-height: 404px;
  max-width: 404px;
  border: none;
  display: flex;
  flex-direction: column;
}

.issueEffect_add_form-new-issue-effect-create,
.issueEffect_add_form-new-issue-effect-edit {
  display: flex;
  height: 40px;
  background: #fff;
  align-items: center;
  cursor: pointer;
  max-width: 120px;
  width: 100%;
}

.issueEffect_add_form-new-issue-effect-create {
  max-width: 120px;
}

.issueEffect_add_form_templates_item-edit {
  text-transform: uppercase;
  display: flex;
  padding: 10px;
  background: #fff;
  color: #000;
}

.issueEffect_add_form_templates_item-edit:hover {
  background: #4294d0;
  color: #fff;
}

.form_templates-active {
  background: #4294d0;
  color: #fff;
}

.issueEffect_add_form_newText {
  margin-left: 5px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 500;
}
.issueEffect_add_form_templates-item {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  letter-spacing: 1px;
  line-height: 12px;
  cursor: pointer;
}
.issueEffect_add_form_templates-item-selected {
  display: flex;
  width: 100%;
}
.issueEffect_add_form-new-issue-effect-create-header {
  padding: 20px 20px 0 20px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.issueEffect_add_form-new-issue-effect-edit-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
}

.issueEffect_add_form-new-issue-effect-select-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.issueEffect_add_form-new-issue-effect-view:hover,
.issueEffect_add_form_templates-item-selected:hover,
.issueEffect_add_form_templates_item-edit:hover {
  background: #4294d0;
  color: #fff;
}

.issueEffect_add_form-new-issue-effect-view {
  background: #fff;
  padding: 10px;
  cursor: pointer;
}
.issueEffect_add_form-new-issue-effect-select-header:hover
  > button
  > svg
  > path {
  fill: #fff;
}

.issueEffect_add_form-new-issue-effect-select-delete {
  display: flex;
  width: 100%;
  align-items: center;
}

.issueEffect_add_form-new-issue-effect-select-back {
  min-width: 60px;
}

.issueEffect_add_form_templates-item-selected-title {
  flex-grow: 20;
  font-weight: 500;
  padding: 10px;
  width: 100%;
}

.issue_effect_add_icon.issue_effect_add_icon-close {
  transform: rotate(180deg);
}
.issue_effect_add_icon.issue_effect_add_icon-open {
  transform: rotate(0deg);
}

.issueEffect_add_form_templates_item-edit {
  visibility: hidden;
}

.form_templates-active
  > .issueEffect_add_form_templates-item
  > .issueEffect_add_form_templates_item-edit,
.form_templates-not-active:hover
  > .issueEffect_add_form_templates-item
  > .issueEffect_add_form_templates_item-edit {
  visibility: visible;
}

.issueEffect_add_form_templates-item-selected-spinner {
  width: 33px;
  height: 100%;
  display: flex;
  align-items: center;
  position: relative;
  left: 10px;
}

.issueEffect_add_form-new-issue-effect-select-remove {
  display: flex;
  align-items: center;
  width: 100%;
  font-size: 12px;
}
</style>
