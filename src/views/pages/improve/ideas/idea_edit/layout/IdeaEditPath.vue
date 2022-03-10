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
                <div class="form-group">
                  <div
                    class="idea_edit_path_container-body-process-select-title"
                  >
                    INSTRUCTION TITLE
                  </div>
                  <b-form-input
                    id="title"
                    v-model.trim="form.title"
                    v-validate="'required|min:4'"
                    v-autofocus
                    :disabled="form.busy"
                    :placeholder="$t('Idea title')"
                    type="text"
                    name="title"
                    autocomplete="off"
                    autofocus
                    :state="$validateState('title', form)"
                  ></b-form-input>
                  <label for="title">{{ $t("Idea title") }}</label>
                  <b-form-invalid-feedback>{{
                    $displayError("title", form)
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
                    v-model="form.description"
                    v-autoresize
                    v-validate="''"
                    no-resize
                    :disabled="form.busy"
                    :placeholder="$t('Idea description')"
                    style="min-height: 50px; max-height: 180px"
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
            <b-card-footer>
              <b-row>
                <loading-button
                  v-if="
                    idea.status === 'NEW' &&
                    $can('improve/idea/change_status', idea)
                  "
                  variant="primary"
                  size="lg"
                  :loading="form.busy || loading"
                  style="width: 120px !important"
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
                  :loading="form.busy || loading"
                  style="height: 40px"
                  @click="updateStatus"
                  >{{ $t("Adopt") }}</loading-button
                >
                <b-col>
                  <loading-button
                    :disabled="vErrors.any() || form.busy"
                    :loading="form.busy"
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
                    :confirm-title="$t('Delete') + ' ' + form.title + '?'"
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
import GQLForm from "@/lib/gqlform";
export default {
  props: {
    idea: {
      type: Object,
      required: false,
    },
  },
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
  async mounted() {
    this.form.id = this.idea.id;
		this.form.processId = this.idea.processId;
    this.form.type = "idea";
    this.form.stageId = this.idea.stageId;
    this.form.operationId = this.idea.operationId;
    this.form.phaseId = this.idea.phaseId;
    this.form.description = this.idea.description;
    this.form.title = this.idea.title;
  },
  data: () => ({
    section: "ideas",
    loading: false,
    form: new GQLForm({
      id: undefined,
      processId: null,
      stageId: null,
      operationId: null,
      phaseId: null,
      description: null,
      title: null,
			type: null
    }),
  }),

  methods: {
    async save() {
      await this.$validator.validateAll();
      if (!this.vErrors.any()) {
        this.$validator.reset();
        this.$emit("save", this.form);
      }
    },
    async updateStatus() {
      this.loading = true;
      const editForm = new GQLForm({
        id: this.idea.id,
        status: this.idea.status === "NEW" ? "TESTING" : "ADOPTED",
      });
      await this.$store.dispatch(`idea/changeStatus`, editForm);
      this.$store.dispatch(`idea/findByProcess`, {
        id: this.idea.processId,
        force: true,
      });
      this.closeIdeaEdit();
      this.loading = false;
      // this.closed();
    },
    async deleteItem() {
      this.form.busy = true;
      const editForm = new GQLForm({
        id: this.idea.id,
      });
      await this.$store.dispatch(`idea/delete`, editForm);
      this.$store.dispatch(`idea/findByProcess`, {
        id: this.idea.processId,
        force: true,
      });
      this.$store.dispatch("process/findById", {
        id: this.idea.processId,
        force: true,
      });
      this.form.busy = false;
    },
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
