<template>
  <div class="idea_edit_path_container">
    <div class="idea_edit_path_container-header">
      <div class="idea_edit_path_container-header-title">
        {{ $t("Edit idea") }}
      </div>
      <div class="idea_edit_path_container-header-close"></div>
      <b-button
        style="overflow: hidden; min-width: 100px"
        @click="closeIdeaEdit"
      >
        <span> {{ $t("close") }} </span>
      </b-button>
    </div>
    <div class="idea_edit_path_container-body">
      <div
        v-if="idea.hasReviews"
        class="bg-gray d-flex flex-column justify-content-center"
        style="min-height: 200px"
      >
        <report-chart :idea="idea"></report-chart>
      </div>
      <div class="idea_edit_path_container-body-process">
        <b-form
          class="idea_edit_path_container-body-process-select hide-labels"
          @keyup="$validator.validateAll()"
          @submit.prevent="save"
          v-if="mutateForm"
        >
          <b-card no-body class="d-block">
            <b-card-body
              class="p-0 ideaEditPath-form-fields"
              :style="idea.hasReviews ? 'max-height:35vh;' : 'max-height:60vh'"
            >
              <div class="form-group">
                <div class="form-label-group select required">
                  <div
                    class="idea_edit_path_container-body-process-select-title"
                  >
                    {{ $t("stage") }}
                  </div>
                  <v-select
                    v-model="mutateForm.stageId"
                    v-validate="'required'"
                    label="title"
                    data-vv-name="stage_id"
                    :placeholder="$t('Stage')"
                    :reduce="(stage) => stage.id"
                    :options="process.process.stages"
                    class="text-capitalize"
                    :class="{
                      'is-invalid':
                        $validateState('stage_id', mutateForm) === false,
                      'is-valid':
                        $validateState('stage_id', mutateForm) === true,
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
                  <div
                    class="idea_edit_path_container-body-process-select-title"
                  >
                    {{ $t("operation") }}
                  </div>
                  <v-select
                    v-model="mutateForm.operationId"
                    v-if="mutateForm.stageId"
                    v-validate="''"
                    label="title"
                    data-vv-name="operation_id"
                    :placeholder="$t('Operation')"
                    :reduce="(operation) => operation.id"
                    class="text-capitalize"
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
                  <div
                    class="idea_edit_path_container-body-process-select-title"
                  >
                    {{ $t("phase") }}
                  </div>
                  <v-select
                    v-if="mutateForm.operationId"
                    v-model="mutateForm.phaseId"
                    v-validate="''"
                    label="title"
                    data-vv-name="phase_id"
                    :placeholder="$t('Phase')"
                    :reduce="(phase) => phase.id"
                    class="text-capitalize"
                    :options="phases"
                    :class="{
                      'is-invalid':
                        $validateState('phase', mutateForm) === false,
                      'is-valid': $validateState('phase', mutateForm) === true,
                    }"
                  ></v-select>
                  <label for="operation">{{ $t("Operation") }}</label>
                  <b-form-invalid-feedback>{{
                    $displayError("operation_id", mutateForm)
                  }}</b-form-invalid-feedback>
                </div>
                <div class="form-group">
                  <div
                    class="idea_edit_path_container-body-process-select-title"
                  >
                    {{ $t("roles") }}
                  </div>
                  <role-selector
                    v-if="mutateForm.companyRoleIds"
                    name="idea_roles"
                    id="idea_roles"
                    autocomplete="idea_roles"
                    :placeholder="$t('roles')"
                    :disabled="mutateForm.busy"
                    v-model="mutateForm.companyRoleIds"
                    :show-field="true"
                    style="z-index: 1; position: relative"
                    :state="$validateState('companyRoleIds', mutateForm)"
                    :items="getSelectableRoles"
                    :show-add-btn="false"
                  ></role-selector>
                </div>
                <!-- <div class="form-label-group select">
                  <div
                    class="idea_edit_path_container-body-process-select-title"
                  >
                    {{ $t("tool") }}
                  </div>
                  <v-select
                    v-model="mutateForm.companyToolId"
                    label="name"
                    data-vv-name="tool"
                    :placeholder="$t('Tool')"
                    :reduce="(tool) => tool.id"
                    :options="tools"
                    class="text-capitalize"
                    :class="{
                      'is-invalid':
                        $validateState('tool', mutateForm) === false,
                      'is-valid': $validateState('tool', mutateForm) === true,
                    }"
                  ></v-select>
                  <label for="stage">{{ $t("Tool") }}</label>
                  <b-form-invalid-feedback>{{
                    $displayError("tool", mutateForm)
                  }}</b-form-invalid-feedback>
                </div> -->
                <div class="form-group">
                  <div
                    class="idea_edit_path_container-body-process-select-title"
                  >
                    {{ $t("Instruction title") }}
                  </div>
                  <b-form-input
                    id="title"
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

                <div class="form-group">
                  <div
                    class="idea_edit_path_container-body-process-select-title"
                  >
                    {{ $t("Instruction description") }}
                  </div>
                  <b-form-textarea
                    id="description"
                    v-model="mutateForm.description"
                    v-autoresize
                    v-validate="''"
                    no-resize
                    :disabled="mutateForm.busy"
                    :placeholder="$t('Idea description')"
                    style="min-height: 250px; max-height: 250px"
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
                  justify-content: space-between;
                  flex-direction: row;
                  padding: 10px 0px;
                "
              >
                <loading-button
                  v-if="
                    idea.status === 'NEW' &&
                    $can('improve/idea/change_status', idea)
                  "
                  variant="primary"
                  size="lg"
                  style="
                    overflow: hidden;
                    height: 40px;
                    margin-right: 10px;
                    width: 100%;
                  "
                  :loading="isLoading"
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
                  :loading="isLoading"
                  style="
                    overflow: hidden;
                    height: 40px;
                    margin-right: 10px;
                    width: 100%;
                  "
                  @click="updateStatus"
                  >{{ $t("Adopt") }}</loading-button
                >
                <loading-button
                  :disabled="vErrors.any() || isLoading"
                  :loading="isLoading"
                  size="lg"
                  style="height: 40px; width: 100%"
                  block
                  type="submit"
                  >{{ $t("Save") }}</loading-button
                >
                <confirm-button
                  variant="outline-danger"
                  size="lg"
                  class="pl-2"
                  style="height: 40px; width: 100%"
                  :confirm-title="$t('Delete') + ' ' + mutateForm.title + '?'"
                  :confirmPlacement="'top'"
                  :confirm-message="$t('This action cannot be undone!')"
                  :btnStyle="'background:#fff;height:41px;width:100%;color:#cc454b;padding:0'"
                  @confirm="deleteItem"
                >
                  <div class="ideaEditPath-remove-idea-button">
                    {{ $t("Remove") }}
                  </div>
                </confirm-button>
              </b-col>
            </b-card-footer>
          </b-card>
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
  },

  computed: {
    ...mapGetters({
      currentProcess: "process/current",
      allTools: "companyTool/all",
      allRoles: "companyRole/all",
    }),

    getParentRoles: {
      get() {
        const parentRoles =
          this.idea.parent?.companyRoles.map((role) => role.id) ?? [];
        return parentRoles;
      },
    },
    getSelectableRoles: {
      get() {
        return this.allRoles.filter((role) =>
          this.getParentRoles.includes(role.id)
        );
      },
    },
    mutateForm: {
      get() {
        console.log("mutateForm", this.value);
        return this.value;
      },
      set(value) {
        console.log(value);
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
    selectableIdeaRoles: [],
		hasChanges: false
  }),
  methods: {
    async save() {
      console.log(this.value.changes);
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
    changeStage() {
      this.mutateForm.operationId = null;
      this.mutateForm.phaseId = null;
    },
    changeOperation() {
      this.mutateForm.phaseId = null;
    },
    closeIdeaEdit() {
      this.$emit("close");
    },
  },
};
</script>


<style scoped>
.ideaEditPath-form-actions {
  padding: 0;
}
.idea_edit_path_container-body {
  height: 100%;
}

.idea_edit_path_container {
  display: flex;
  flex-direction: column;
}

.ideaEditPath-form-fields {
  overflow-y: scroll;
}

.idea_edit_path_container-header-title {
  padding: 20px;
}

.idea_edit_path_container-header-title,
.idea_edit_path_container-header-close,
.idea_edit_path_container-body-process-select-title {
  text-transform: uppercase;
}

.idea_edit_path_container {
  overflow: hidden;
  height: 100%;
  margin-left: 20px;
  border-radius: 5px;
  width: 25%;
  min-width: 300px;
}

.idea_edit_path_container-header {
  display: flex;
  justify-content: space-between;
  height: 60px;
  border-bottom: 1px solid lightgray;
  background: #fff;
}
.idea_edit_path_container-header > button {
  margin: 20px 20px 10px 20px;
}

.idea_edit_path_container-body-process-select {
  list-style-type: none;
  padding: 20px;
  height: calc(100% - 60px);
  border-radius: 3px;
  background: #fff;
}

.idea_edit_path_container-body-process-select-title {
  padding: 10px 0;
}
</style>

<style>
.ideaEditPath-remove-idea-button:hover {
  height: 100%;
  place-items: center;
  display: flex;
  place-content: center;
  background: #cc454b;
  color: #fff;
}
</style>
