
<template>
  <div>
    <b-form
      v-if="form"
      class="hide-labels"
      @submit.prevent="saveItem"
      @keyup="$validator.validateAll()"
    >
      <b-card no-body class="d-block">
        <b-card-body class="p-0" :class="{ 'p-3': mode === 'edit' }">
          <div class="form-group">
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
          <div
            v-if="form.type === 'TOOL'"
            class="form-label-group select required"
          >
            <v-select
              v-model="form.companyToolId"
              v-validate="'required'"
              label="name"
              data-vv-name="tool"
              :placeholder="$t('Tool')"
              :reduce="(tool) => tool.id"
              :options="tools"
              class="text-capitalize"
              :class="{
                'is-invalid': $validateState('tool', form) === false,
                'is-valid': $validateState('tool', form) === true,
              }"
            ></v-select>
            <label for="stage">{{ $t("Tool") }}</label>
            <b-form-invalid-feedback>{{
              $displayError("tool", form)
            }}</b-form-invalid-feedback>
          </div>
          <div class="form-label-group select required">
            <v-select
              v-model="form.stageId"
              v-validate="'required'"
              label="title"
              :disabled="form.status != 'NEW'"
              data-vv-name="stage"
              :placeholder="$t('Stage')"
              :reduce="(stage) => stage.id"
              :options="process.process.stages"
              class="text-capitalize"
              :class="{
                'is-invalid': $validateState('stage', form) === false,
                'is-valid': $validateState('stage', form) === true,
              }"
              @input="changeStage"
            ></v-select>
            <label for="stage">{{ $t("Stage") }}</label>
            <b-form-invalid-feedback>{{
              $displayError("stage_id", form)
            }}</b-form-invalid-feedback>
          </div>
          <div v-if="form.stageId" class="form-label-group select required">
            <v-select
              v-model="form.operationId"
              v-validate="''"
              label="title"
              :disabled="form.status != 'NEW'"
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

          <div v-if="form.operationId" class="form-label-group select required">
            <v-select
              v-model="form.phaseId"
              v-validate="''"
              label="title"
              :disabled="form.status != 'NEW'"
              data-vv-name="phase"
              :placeholder="$t('Phase')"
              :reduce="(phase) => phase.id"
              :options="phases"
              class="text-capitalize"
              :class="{
                'is-invalid': $validateState('phase', form) === false,
                'is-valid': $validateState('phase', form) === true,
              }"
            ></v-select>
            <label for="phase">{{ $t("Phase") }}</label>
            <b-form-invalid-feedback>{{
              $displayError("phase", form)
            }}</b-form-invalid-feedback>
          </div>
          <div class="form-label-group select required">
            <!--  <wysiwyg
              id="description"
              class="wysiwyg_editor"
              style="max-height: 440px"
              :disabled="form.busy"
              v-model="form.description"
              v-autoresize
              :placeholder="$t('Idea description')"
              name="description"
              :state="$validateState('description', form)"
              v-validate="''"
            /> -->

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
          <!-- <div>
            <file-field
              v-model="form.file"
              :placeholder="$t('Upload guide')"
              :title="currentFile ? currentFile.title : $t('Upload guide')"
              :current-file="currentFile"
              @input="fileChanged"
            />
          </div> -->
        </b-card-body>
        <b-card-footer :class="{ 'px-0': mode === 'create' }">
          <loading-button
            :disabled="vErrors.any() || form.busy"
            :loading="form.busy"
            size="lg"
            block
            type="submit"
            >{{ $t("Save changes") }}</loading-button
          >
        </b-card-footer>
      </b-card>
    </b-form>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import GQLForm from "@/lib/gqlform";

export default {
  props: {
    item: null,
    section: {
      required: false,
      type: String,
      default: () => "ideas",
    },
    formFrom: {
      required: false,
      type: String,
      default: () => "idea",
    },
    type: {
      required: false,
      type: String,
      default: () => "PROCESS",
    },
    issueIdea: {
      required: false,
      type: Object,
    },
  },

  data: () => ({
    input: null,
    currentFile: null,
    storeName: "idea",
    form: new GQLForm({
      id: undefined,
      title: null,
      processId: null,
      stageId: null,
      operationId: null,
      phaseId: null,
      description: null,
      companyToolId: null,
			removeFileIds: [],
      file: [],
      removeFile: false,
      sourceId: null,
      sourceType: null,
      status: "NEW",
      type: "PROCESS",
    }),
  }),

  computed: {
    ...mapGetters({
      currentProcess: "process/current",
      currentTool: "companyTool/current",
      tools: "companyTool/all",
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
    currentProcessSection: {
      get() {
        return (
          this.process.phase ||
          this.process.operation ||
          this.process.stage ||
          this.process.process
        );
      },
    },
    currentProcessSectionName: {
      get() {
        if (this.process.phase) {
          return "phase";
        }
        if (this.process.operation) {
          return "operation";
        }
        if (this.process.stage) {
          return "stage";
        }
        if (this.process.process) {
          return "process";
        }
        return null;
      },
    },
    mode: {
      get() {
        if (this.item && this.item.id) {
          return "edit";
        } else {
          return "create";
        }
      },
    },
  },
  async mounted() {
    this.input = this.item;
    if (this.item && this.item.file) this.currentFile = this.item.file;

    if (
      this.mode === "create" &&
      this.currentTool("toolIdeas") &&
      this.section == "toolIdeas"
    ) {
      this.form.companyToolId = this.currentTool("toolIdeas").id;
    }

    if (this.process) {
      await this.$store.dispatch("process/findById", {
        id: this.process.process.id,
      });
    }
    this.initForm();
    this.storeName = this.form.type === "PROCESS" ? "idea" : "toolIdea";
  },

  methods: {
    initForm() {
      if (this.section === "issues" && this.issueIdea) {
        this.form.processId = this.issueIdea.processId;
        this.form.stageId = this.issueIdea.stageId;
        this.form.operationId = this.issueIdea.operationId;
        this.form.phaseId = this.issueIdea.phaseId;
        return;
      }
      if (!this.input.id) {
        this.input.type = this.input.type || "PROCESS";
        this.input.processId = this.input.processId || this.process.process.id;
        this.input.stageId =
          this.input.stageId || this.process.stage
            ? this.process.stage?.id
            : null;
        this.input.operationId =
          this.input.operationId || this.process.operation
            ? this.process.operation?.id
            : null;
        this.input.phaseId =
          this.input.phaseId || this.process.phase
            ? this.process.phase?.id
            : null;
      }

      Object.keys(this.input || {})
        .filter((key) => key in this.form)
        .forEach((key) => (this.form[key] = this.input[key]));

      this.form.type = this.input.type;
      this.form.stageId = this.input.stageId;
      this.form.operationId = this.input.operationId;
      this.form.phaseId = this.input.phaseId;

      //Issues
      if (this.section === "issues") {
        this.form.stageId = this.input.stageId;
        this.form.operationId = this.input.operationId;
        this.form.phaseId = this.input.phaseId;
      }
      //Improve Idea
      if (this.input.sourceType && this.input.sourceType === "idea_issue") {
        const typeName = this.input.parent.__typename;
        if (typeName === "ProcessPhase") {
          this.form.stageId = this.input.parent.operation.stageId;
          this.form.phaseId = this.input.parent.id;
          this.form.operationId = this.input.parent.operationId;
        } else if (typeName === "ProcessOperation") {
          this.form.operationId = this.input.parent.id;
          this.form.stageId = this.input.parent.stageId;
        } else {
          this.form.stageId = this.input.parent.id;
        }
      }
    },
    changeStage() {
      this.form.operationId = null;
      this.form.phaseId = null;
    },
    changeOperation() {
      this.form.phaseId = null;
    },
    cancel() {
      this.$emit("cancel");
    },
    fileChanged() {
      if (!this.form.files) {
        this.form.removeFile = true;
        this.currentFile = null;
      } else {
        this.form.removeFile = false;
      }
    },
    async saveItem() {
      await this.$validator.validateAll();

      if (!this.vErrors.any()) {
        this.$validator.reset();

        try {
          if (this.mode === "edit") {
            await this.$store.dispatch(`${this.storeName}/update`, this.form);
          } else {
            await this.$store.dispatch(`${this.storeName}/create`, this.form);
            await this.$store.dispatch(`${this.storeName}/setIdeaTab`, {
              tab: "New",
            });
          }

          this.$emit("done");
          if (this.formFrom === "improveIdea") {
            //reload details page
            this.$emit("reload");
          }
          if (this.section == "issues") {
            return;
          }

          await this.$store.dispatch("process/setCurrentProcess", {
            section: this.section,
            process: this.process.process,
            stage: this.stages?.filter((x) => x.id === this.form.stageId)[0],
            operation: this.operations?.filter(
              (x) => x.id === this.form.operationId
            )[0],
            phase: this.phases?.filter((x) => x.id === this.form.phaseId)[0],
          });

          //Find created idea to UI
          await this.$store.dispatch("process/findById", {
            id: this.form.processId,
            force: true,
          });
          await this.$store.dispatch(`${this.storeName}/findByProcess`, {
            id: this.form.processId,
            force: true,
          });
        } catch (e) {
          console.log(e);
					await this.$validator.reset();
        }
      }
    },
  },
};
</script>
