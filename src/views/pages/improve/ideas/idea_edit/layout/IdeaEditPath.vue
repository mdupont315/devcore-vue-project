<template>
  <div class="idea_edit_path_container">
    <div class="idea_edit_path_container-header">
      <div class="idea_edit_path_container-header-title">Edit instruction</div>
      <div class="idea_edit_path_container-header-close">
        <button @click="closeIdeaEdit">Close</button>
      </div>
    </div>
    <div class="idea_edit_path_container-body">
      <div class="idea_edit_path_container-body-process">
        <b-form
          class="idea_edit_path_container-body-process-select hide-labels"
          @keyup="$validator.validateAll()"
          @submit.prevent="save"
          v-if="mutateForm"
        >
          <b-card no-body class="d-block">
            <b-card-body class="p-0">
              <div class="form-group">
                <div class="form-label-group select required">
                  <div
                    class="idea_edit_path_container-body-process-select-title"
                  >
                    STAGE
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
                    OPERATION
                  </div>
                  <v-select
                    v-model="mutateForm.operationId"
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
                    PHASE
                  </div>
                  <v-select
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
                    INSTRUCTION TITLE
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
                    INSTRUCTION DESCRIPTION
                  </div>
                  <b-form-textarea
                    id="description"
                    v-model="mutateForm.description"
                    v-autoresize
                    v-validate="''"
                    no-resize
                    :disabled="mutateForm.busy"
                    :placeholder="$t('Idea description')"
                    style="min-height: 50px; max-height: 180px"
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
            <b-card-footer>
              <b-row>
                <loading-button
                  v-if="
                    idea.status === 'NEW' &&
                    $can('improve/idea/change_status', idea)
                  "
                  variant="primary"
                  size="lg"
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
                  style="height: 40px"
                  @click="updateStatus"
                  >{{ $t("Adopt") }}</loading-button
                >
                <b-col>
                  <loading-button
                    :disabled="vErrors.any() || isLoading"
                    :loading="isLoading"
                    size="lg"
                    style="height: 40px; min-width: 85px"
                    block
                    type="submit"
                    >{{ $t("Save") }}</loading-button
                  ></b-col
                >
                <b-col>
                  <confirm-button
                    variant="outline-danger"
                    size="lg"
                    class="pl-2"
                    style="height: 40px"
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
              </b-row>
            </b-card-footer>
          </b-card>
        </b-form>
      </div>
    </div>
  </div>
</template>

	<script>
import { mapGetters } from "vuex";
export default {
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
			default: false
		}
  },
  computed: {
    ...mapGetters({
      currentProcess: "process/current",
    }),

    mutateForm: {
      get() {
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
  }),

  methods: {
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
.idea_edit_path_container {
  background: #fff;
  height: 100%;
  margin-left: 15px;
  border-radius: 5px;
  flex-grow: 1;
  width: 25%;
  min-width: 300px;
}

.idea_edit_path_container-header {
  display: flex;
  justify-content: space-between;
  height: 60px;
  border-bottom: 1px solid lightgray;
  padding: 20px;
}

.idea_edit_path_container-body-process-select {
  list-style-type: none;
  padding: 20px;
  height: calc(100% - 60px);
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
