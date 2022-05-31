<template>
  <div class="idea_edit_path_container">
    <div class="idea_edit_path_container-header">
      <div class="idea_edit_path_container-header-title">
        {{ $t("Edit idea") }}
      </div>
      <div class="idea_edit_path_container-header-close"></div>

      <div
        v-if="!ideaContentIsDirty"
        class="ideaEdit_path_noEdit_content"
        @click="closeIdeaEdit"
      >
        <i class="ri-close-line table-modal-close"></i>
      </div>

      <confirm-button
        v-else
        class="ideaEdit_path_Edit_content"
        @confirm="closeIdeaEdit"
        :customButton="true"
        :confirmPlacement="'left'"
        :confirmMessage="$t('Unsaved Idea Data')"
      >
        <i class="ri-close-line table-modal-close"></i>
      </confirm-button>
    </div>
    <div class="idea_edit_path_container-body">
      <div
        v-if="idea.hasReviews"
        class="bg-gray d-flex flex-column justify-content-center"
        style="min-height: 200px"
      >
        <report-chart
          :idea="idea"
          class="ideaEditPath-report-chart"
        ></report-chart>
      </div>
      <div class="idea_edit_path_container-body-process">
        <b-form
          class="idea_edit_path_container-body-process-select hide-labels"
          @keyup="$validator.validateAll()"
          @submit.prevent="save"
          v-if="mutateForm"
        >
          <!--  -->
          <b-card-body
            class="p-0 ideaEditPath-form-fields"
            :class="
              idea.hasReviews
                ? 'ideaEdit-form-hasReviews'
                : 'ideaEdit-form-noReviews'
            "
          >
            <div class="form-group" style="max-height: calc(82vh - 160px)">
              <div class="form-group">
                <div class="idea_edit_path_container-body-process-select-title">
                  {{ $t("Instruction title") }}
                </div>
                <b-form-input
                  id="title"
                  class="idea_edit_path_select_title"
                  v-model.trim="mutateForm.title"
                  v-validate="'required|min:4'"
                  v-autofocus
                  :disabled="mutateForm.busy"
                  :placeholder="$t('Idea title')"
                  type="text"
                  name="title"
                  autocomplete="off"
                  autofocus
                  :state="$validateState('title', mutateForm)"
                ></b-form-input>
                <label for="title">{{ $t("Idea title") }}</label>
                <b-form-invalid-feedback>{{
                  $displayError("title", mutateForm)
                }}</b-form-invalid-feedback>
              </div>

              <div
                class="form-label-group select required"
                style="margin-top: 0"
              >
                <div class="idea_edit_path_container-body-process-select-title">
                  {{ $t("stage") }}
                </div>
                <v-select
                  class="idea_edit_path_select___stage"
                  v-model="mutateForm.stageId"
                  v-validate="'required'"
                  label="title"
                  data-vv-name="stage_id"
                  :placeholder="$t('Stage')"
                  :reduce="(stage) => stage.id"
                  :options="process.process.stages"
                  :class="{
                    'is-invalid':
                      $validateState('stage_id', mutateForm) === false,
                    'is-valid': $validateState('stage_id', mutateForm) === true,
                  }"
                  @input="changeStage"
                ></v-select>
                <label for="stage">{{ $t("Stage") }}</label>
                <b-form-invalid-feedback>{{
                  $displayError("stage_id", mutateForm)
                }}</b-form-invalid-feedback>
              </div>
              <div
                v-if="mutateForm.stageId"
                class="form-label-group select required"
              >
                <div class="idea_edit_path_container-body-process-select-title">
                  {{ $t("operation") }}
                </div>
                <v-select
                  class="idea_edit_path_select___operation"
                  v-model="mutateForm.operationId"
                  v-if="mutateForm.stageId"
                  v-validate="''"
                  label="title"
                  data-vv-name="operation_id"
                  :placeholder="$t('Operation')"
                  :reduce="(operation) => operation.id"
                  :options="operations"
                  :class="{
                    'is-invalid':
                      $validateState('operation', mutateForm) === false,
                    'is-valid':
                      $validateState('operation', mutateForm) === true,
                  }"
                  @input="changeOperation"
                ></v-select>
                <label for="operation">{{ $t("Operation") }}</label>
                <b-form-invalid-feedback>{{
                  $displayError("operation_id", mutateForm)
                }}</b-form-invalid-feedback>
              </div>

              <div
                v-if="mutateForm.operationId"
                class="form-label-group select required"
              >
                <div class="idea_edit_path_container-body-process-select-title">
                  {{ $t("phase") }}
                </div>
                <v-select
                  class="idea_edit_path_select___phase"
                  v-if="mutateForm.operationId"
                  v-model="mutateForm.phaseId"
                  v-validate="''"
                  label="title"
                  data-vv-name="phase_id"
                  :placeholder="$t('Phase')"
                  :reduce="(phase) => phase.id"
                  :options="phases"
                  @input="changePhase"
                  :class="{
                    'is-invalid': $validateState('phase', mutateForm) === false,
                    'is-valid': $validateState('phase', mutateForm) === true,
                  }"
                ></v-select>
                <label for="operation">{{ $t("Operation") }}</label>
                <b-form-invalid-feedback>{{
                  $displayError("operation_id", mutateForm)
                }}</b-form-invalid-feedback>
              </div>
              <div class="form-group">
                <div class="idea_edit_path_container-body-process-select-title">
                  {{ $t("roles") }}
                </div>
                <role-selector
                  v-if="roleIntent"
                  name="idea_roles"
                  id="idea_roles"
                  class="idea_edit_path_select_idea_roles"
                  autocomplete="idea_roles"
                  :placeholder="$t('Roles')"
                  :disabled="mutateForm.busy"
                  v-model="mutateForm.companyRoleIds"
                  :show-field="true"
                  :state="$validateState('companyRoleIds', mutateForm)"
                  :items="selectablePathRoles"
                  :show-add-btn="false"
                  :key="roleIntent"
                ></role-selector>
              </div>
              <div class="form-label-group select">
                <div class="idea_edit_path_container-body-process-select-title">
                  {{ $t("Tools") }}
                </div>

                <idea-tool-selector
                  v-if="toolIntent"
                  name="tools"
                  class="idea_edit_path_select_tools"
                  id="tools"
                  autocomplete="tools"
                  :placeholder="$t('Tools')"
                  :disabled="mutateForm.busy"
                  v-model="mutateForm.companyToolIds"
                  :show-field="true"
                  :state="$validateState('companyRoleIds', mutateForm)"
                  :items="allTools"
                  :show-add-btn="false"
                  :key="toolIntent"
                ></idea-tool-selector>
              </div>

              <div
                class="form-group"
                style="max-height: 200px; overflow: hidden"
              >
                <div class="idea_edit_path_container-body-process-select-title">
                  {{ $t("Instruction description") }}
                </div>
                <b-form-textarea
                  id="description"
                  class="idea_edit_path_select_description"
                  v-model="mutateForm.description"
                  v-autoresize
                  v-validate="''"
                  no-resize
                  size="sm"
                  :disabled="mutateForm.busy"
                  :placeholder="$t('Idea description')"
                  name="description"
                  :state="$validateState('description', mutateForm)"
                ></b-form-textarea>
                <label for="description">{{ $t("Idea description") }}</label>
                <b-form-invalid-feedback>{{
                  $displayError("description", mutateForm)
                }}</b-form-invalid-feedback>
              </div>
            </div>
          </b-card-body>
          <b-card-footer class="ideaEditPath-form-actions">
            <b-col
              style="
                display: flex;
                justify-content: space-evenly;
                margin-top: 10px;
                flex-direction: row;
                padding: 10px 0px;
                height: 60px;
                gap: 12px;
              "
            >
              <loading-button
                v-if="
                  idea.status === 'NEW' &&
                  $can('improve/idea/change_status', idea)
                "
                :disabled="vErrors.any() || isLoading"
                variant="primary"
                size="lg"
										:style="{'cursor': isLoading ? 'not-allowed' : 'pointer' }"
                style="flex-grow: 1; width: 30%; border-radius: 3px"
                :loading="false"
                @click="updateStatus"
                >{{ $t("Test") }}</loading-button
              >
              <loading-button
                v-if="
                  idea.status === 'TESTING' &&
                  $can('improve/idea/change_status', idea)
                "
                variant="primary"
                size="lg"
                :loading="false"
                style="flex-grow: 1; width: 30%; border-radius: 3px"
								:style="{'cursor': isLoading ? 'not-allowed' : 'pointer' }"
                :disabled="vErrors.any() || isLoading"
                @click="updateStatus"
                >{{ $t("Adopt") }}</loading-button
              >
              <loading-button
                :disabled="vErrors.any() || isLoading"
                :loading="false"
                size="lg"
										:style="{'cursor': isLoading ? 'not-allowed' : 'pointer' }"
                block
                style="flex-grow: 1; width: 30%; border-radius: 3px"
                type="submit"
                >{{ $t("Save") }}</loading-button
              >
              <confirm-button
                buttonVariant="outline-danger"
                size="lg"
                :isDisabled="isLoading"
										:style="{'cursor': isLoading ? 'not-allowed' : 'pointer' }"
                :btnClass="
                  isLoading
                    ? 'ideaEdit_path_remove_button-disabled'
                    : 'ideaEdit_path_remove_button-enabled'
                "
                :confirm-title="$t('Delete') + ' ' + mutateForm.title + '?'"
                :confirmPlacement="'top'"
                style="
                  width: 30%;
                  flex-grow: 1;
                  border-radius: 3px;
                  text-align: center;
                "
                :confirm-message="$t('This action cannot be undone!')"
                @confirm="deleteItem"
              >
                <div class="ideaEditPath-remove-idea-button">
                  {{ $t("Remove") }}
                </div>
              </confirm-button>
            </b-col>
          </b-card-footer>
        </b-form>
      </div>
    </div>
  </div>
</template>

	<script>
import { mapGetters } from "vuex";
import IdeaReportChart from "../../IdeaReportChart.vue";

export default {
  components: {
    "report-chart": IdeaReportChart,
  },
  props: {
    idea: {
      type: Object,
      required: false,
    },
    value: {
      type: Object,
      required: false,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
    ideaContentIsDirty: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    ...mapGetters({
      currentProcess: "process/current",
      allTools: "companyTool/all",
      allRoles: "companyRole/all",
    }),

    processPath: {
      get() {
        return this.currentProcess("ideas");
      },
    },

    getParentRoles: {
      get() {
        const parentRoles =
          this.idea.parent?.companyRoles.map((role) => role.id) ??
          this.selectablePathRoles;
        return parentRoles;
      },
    },
    getSelectableRoles: {
      get() {
        return this.allRoles;
        // if (this.getParentRoles.length > 0) {
        //   return this.allRoles.filter((role) =>
        //     this.getParentRoles.includes(role.id)
        //   );
        // } else {
        //   return this.allRoles;
        // }
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
    process: {
      get() {
        return this.currentProcess(this.section);
      },
    },
    stages: {
      get() {
        return this.process.process.stages || [];
      },
    },
    operations: {
      get() {
        if (!this.mutateForm.stageId || !this.stages) {
          return [];
        }

        const stageWithId = this.stages.find(
          (i) => i.id == this.mutateForm.stageId
        );
        return stageWithId?.operations || [];
      },
    },
    phases: {
      get() {
        if (!this.mutateForm.operationId || !this.operations) {
          return [];
        }

        return (
          this.operations.find((i) => i.id == this.mutateForm.operationId)
            .phases || []
        );
      },
    },
  },

  data: () => ({
    section: "ideas",
    hasChanges: false,
    selectablePathRoles: [],
    roleIntent: null,
    toolIntent: null,
  }),
  mounted() {
    this.selectablePathRoles = this.getSelectableRoles;
    this.roleIntent = Math.random();
    this.toolIntent = Math.random();
  },
  methods: {
    getSelectableProcessPathRoles() {
      if (this.processPath.phase) {
        return this.processPath.phase.companyRoles.map((x) => x.id);
      } else if (this.processPath.operation) {
        return this.processPath.operation.companyRoles.map((x) => x.id);
      } else if (this.processPath.stage) {
        return this.processPath.stage.companyRoles.map((x) => x.id);
      } else {
        return this.allRoles.map((x) => x.id);
      }
    },
    async save() {
      await this.$validator.validateAll();
      if (!this.vErrors.any()) {
        this.$validator.reset();
        this.$emit("save");
      }
    },
    async updateStatus() {
      this.$emit("updateStatus");
    },
    async deleteItem() {
      this.$emit("deleteIdea");
    },
    // setSelectableRoles(path) {
    //   if (!path || !path.stageId) return;

    //   const stage = this.process.process.stages.find(
    //     (x) => x.id === path.stageId
    //   );
    //   if (path.stageId) {
    //     this.selectablePathRoles = stage.companyRoles;
    //   }
    //   if (path.operationId) {
    //     const operation = stage.operations.find(
    //       (x) => x.id === path.operationId
    //     );
    //     this.selectablePathRoles = operation.companyRoles;
    //   }

    //   if (path.phaseId) {
    //     const operation = stage.operations.find(
    //       (x) => x.id === path.operationId
    //     );
    //     const phase = operation.phases.find((x) => x.id === path.phaseId);
    //     this.selectablePathRoles = phase.companyRoles;
    //   }

    //   this.roleIntent = Math.random();
    // },
    changeStage() {
      this.mutateForm.operationId = null;
      this.mutateForm.phaseId = null;
      if (this.value.stageId) {
        //   this.setSelectableRoles({ stageId: this.value.stageId });
      }
    },
    changeOperation() {
      this.mutateForm.phaseId = null;
      if (this.value.operationId) {
        // this.setSelectableRoles({
        //   operationId: this.value.operationId,
        //   stageId: this.value.stageId,
        // });
      }
    },
    changePhase() {
      if (this.value.phaseId) {
        // this.setSelectableRoles({
        //   phaseId: this.value.phaseId,
        //   operationId: this.value.operationId,
        //   stageId: this.value.stageId,
        // });
      }
    },
    closeIdeaEdit() {
      this.$emit("close");
    },
  },
};
</script>


<style scoped>
.form-label-group {
  margin: 15px 0;
}

.ideaEditPath-form-actions {
  padding: 0;
  border: none;
}

.idea_edit_path_container-body {
  height: 100%;
  overflow: hidden;
}

.idea_edit_path_container {
  display: flex;
  flex-direction: column;
  /* min-height: 82vh; */
  /* background: #fff; */

  max-height: 95%;
}

.ideaEditPath-form-fields {
  overflow-y: scroll;
  display: flex;
  width: 100%;
  ms-overflow-style: none;
  scrollbar-width: none;
}

.ideaEditPath-form-fields > .form-group {
  width: 100%;
}

.idea_edit_path_container-header-title {
  padding: 20px;
}

.idea_edit_path_container-body-process-select-title {
  text-transform: uppercase;
}

.idea_edit_path_select_description {
  border: none;
  border-bottom: 1px solid lightgray;
  max-height: 150px;
  margin-left: 0px;
  overflow: scroll;
  font-family: "FuturaBQ";
  scrollbar-width: none;
}

.idea_edit_path_container-header-title {
  font-size: 16px;
}

.idea_edit_path_container-body-process-select-title {
  margin-left: 5px;
  /* font-family: FuturaBold; */
}

.idea_edit_path_container {
  border-radius: 5px;
  width: 25%;
  min-width: 300px;
  margin: 20px 20px 0px 0px;
}

.idea_edit_path_container-header {
  display: flex;
  justify-content: space-between;
  height: 60px;
  border-bottom: 1px solid lightgray;
  background: #fff;
  border-top-right-radius: 3px;
  border-top-left-radius: 3px;
}
.idea_edit_path_container-header > button {
  margin: 20px 20px 10px 20px;
}

.idea_edit_path_container-body-process-select {
  list-style-type: none;
  border-radius: 3px;
  background: #fff;
  padding: 20px 20px 7px 20px;
}

.idea_edit_path_container-body-process-select-title {
  padding: 10px 0;
}
.idea_edit_path_container-body-process {
  height: 100%;
}
</style>

<style>
.ideaEdit_path_noEdit_content {
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
.ideaEdit_path_Edit_content {
  width: 60px;
  margin-top: 15px;
  margin-right: 15px;
  height: 30px;
  font-size: 24px;
  color: lightgray;
  margin-left: 30px;
  cursor: pointer;
}
.v-select .vs__open-indicator {
  fill: lightgray;
}

.v-select .vs__clear {
  fill: #fff;
}
.ideaEdit_path_remove_button-enabled > .ideaEditPath-remove-idea-button:hover {
  height: 100%;
  place-items: center;
  display: flex;
  place-content: center;
  border: none;
}

.ideaEditPath-remove-idea-button {
  padding: 0;
  height: 100%;
  display: flex;
  place-items: center;
  place-content: center;
}

.idea_edit_path_select___phase
  > .vs__dropdown-toggle
  > .vs__selected-options
  > .vs__selected,
.idea_edit_path_select___operation
  > .vs__dropdown-toggle
  > .vs__selected-options
  > .vs__selected,
.idea_edit_path_select___stage
  > .vs__dropdown-toggle
  > .vs__selected-options
  > .vs__selected {
  color: #4294d0 !important;
}

.idea_edit_path_select___stage > .vs__dropdown-toggle > ul > li {
  color: #4294d0 !important;
}

.idea_edit_path_select_idea_roles > .input-wrapper > div > .items {
  /* background: #fff; */
  border-top: 1px solid #fff !important;
  border-left: 1px solid #fff !important;
  border-right: 1px solid #fff !important;
  border-bottom: 1px solid lightgray;
  margin-left: -10px;
}
.idea_edit_path_select_idea_roles > .input-wrapper > div > .counter {
  color: #4294d0;
  z-index: 1;
}

.idea_edit_path_select_tools,
.idea_edit_path_select_idea_roles {
  margin-left: -5px;
}

.idea_edit_path_select_tools > .input-wrapper > div > .items {
  /* background: #fff; */
  border-top: 1px solid #fff !important;
  border-left: 1px solid #fff !important;
  border-right: 1px solid #fff !important;
  border-bottom: 1px solid lightgray;
  margin-left: -10px;
}
.idea_edit_path_select_tools > .input-wrapper > div > .counter {
  color: #4294d0;
  z-index: 1;
}

.idea_edit_path_select_title {
  border-top: 1px solid #fff !important;
  border-left: 1px solid #fff !important;
  border-right: 1px solid #fff !important;
  background: #fff;
}
.idea_edit_path_select_title:focus,
.idea_edit_path_select_description:focus {
  box-shadow: none !important;
  border-bottom: 1px solid lightgray;
}

.idea_edit_path_select___phase > div,
.idea_edit_path_select___operation > div,
.idea_edit_path_select___stage > div {
  background: #fff !important;
  border-top: 1px solid #fff !important;
  border-left: 1px solid #fff !important;
  border-right: 1px solid #fff !important;
  border-bottom: 1px solid lightgray;
  margin-left: -10px;
}

.idea_edit_path_select_title,
.idea_edit_path_select_description {
  margin-left: -5px;
}

@media screen and (max-height: 900px) {
  .ideaEditPath-report-chart > div > .idea-report {
    max-height: 350px !important;
    min-height: 350px !important;
  }
  .ideaEdit-form-hasReviews {
    max-height: 20vh;
  }
  .ideaEdit-form-noReviews {
    max-height: 57vh;
  }
}
@media screen and (min-height: 900px) {
  .ideaEditPath-report-chart > div > .idea-report {
    max-height: 250px !important;
    min-height: 250px !important;
  }
  .ideaEdit-form-hasReviews {
    max-height: 27vh;
  }
  .ideaEdit-form-noReviews {
    max-height: 64vh;
  }
}
</style>
