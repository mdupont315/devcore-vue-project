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
          v-if="form"
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
                    v-model="form.stageId"
                    v-validate="'required'"
                    label="title"
                    data-vv-name="stage_id"
                    :placeholder="$t('Stage')"
                    :reduce="(stage) => stage.id"
                    :options="process.process.stages"
                    class="text-capitalize"
                    :class="{
                      'is-invalid': $validateState('stage_id', form) === false,
                      'is-valid': $validateState('stage_id', form) === true,
                    }"
                    @input="changeStage"
                  ></v-select>
                  <label for="stage">{{ $t("Stage") }}</label>
                  <b-form-invalid-feedback>{{
                    $displayError("stage_id", form)
                  }}</b-form-invalid-feedback>
                </div>
                <div
                  v-if="form.stageId"
                  class="form-label-group select required"
                >
                  <div
                    class="idea_edit_path_container-body-process-select-title"
                  >
                    OPERATION
                  </div>
                  <v-select
                    v-model="form.operationId"
                    v-validate="''"
                    label="title"
                    data-vv-name="operation_id"
                    :placeholder="$t('Operation')"
                    :reduce="(operation) => operation.id"
                    class="text-capitalize"
                    :options="operations"
                    :class="{
                      'is-invalid': $validateState('operation', form) === false,
                      'is-valid': $validateState('operation', form) === true,
                    }"
                    @input="changeOperation"
                  ></v-select>
                  <label for="operation">{{ $t("Operation") }}</label>
                  <b-form-invalid-feedback>{{
                    $displayError("operation_id", form)
                  }}</b-form-invalid-feedback>
                </div>

                <div
                  v-if="form.operationId"
                  class="form-label-group select required"
                >
                  <div
                    class="idea_edit_path_container-body-process-select-title"
                  >
                    PHASE
                  </div>
                  <v-select
                    v-model="form.phaseId"
                    v-validate="''"
                    label="title"
                    data-vv-name="phase_id"
                    :placeholder="$t('Phase')"
                    :reduce="(phase) => phase.id"
                    class="text-capitalize"
                    :options="phases"
                    :class="{
                      'is-invalid': $validateState('phase', form) === false,
                      'is-valid': $validateState('phase', form) === true,
                    }"
                  ></v-select>
                  <label for="operation">{{ $t("Operation") }}</label>
                  <b-form-invalid-feedback>{{
                    $displayError("operation_id", form)
                  }}</b-form-invalid-feedback>
                </div>

                <div class="form-label-group select required">
                  <b-form-textarea
                    id="description"
                    v-model="form.description"
                    v-autoresize
                    v-validate="''"
                    :disabled="form.busy"
                    :placeholder="$t('Idea description')"
                    style="max-height: 150px"
                    name="description"
                    :state="$validateState('description', form)"
                  ></b-form-textarea>
                  <label for="description">{{ $t("Idea description") }}</label>
                  <b-form-invalid-feedback>{{
                    $displayError("description", form)
                  }}</b-form-invalid-feedback>
                </div>
              </div>
            </b-card-body>
          </b-card>
        </b-form>
      </div>
    </div>
  </div>
</template>

	<script>
import { mapGetters } from "vuex";
import GQLForm from "@/lib/gqlform";
export default {
  computed: {
    ...mapGetters({
      currentProcess: "process/current",
    }),

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
        if (!this.form.stageId || !this.stages) {
          return [];
        }

        const stageWithId = this.stages.find((i) => i.id == this.form.stageId);

        return stageWithId?.operations || [];
      },
    },
    phases: {
      get() {
        if (!this.form.operationId || !this.operations) {
          return [];
        }

        return (
          this.operations.find((i) => i.id == this.form.operationId).phases ||
          []
        );
      },
    },
  },
  data: () => ({
    section: "ideas",
    form: new GQLForm({
      id: undefined,
      processId: null,
      stageId: null,
      operationId: null,
      phaseId: null,
      description: null,
    }),
  }),

  methods: {
    changeStage() {
      this.form.operationId = null;
      this.form.phaseId = null;
    },
    changeOperation() {
      this.form.phaseId = null;
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
  width: 100%;
  margin: 0 10px;
  border-radius: 5px;
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
</style>
