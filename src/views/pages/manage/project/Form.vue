<template>
  <div>
    <b-form
      v-if="ready"
      class="hide-labels"
      @submit.prevent="save"
      @keyup="$validator.validateAll()"
    >
      <b-row>
        <b-col class="col-12">
          <div class="form-label-group required">
            <b-form-input
              id="name"
              v-model.trim="form.name"
              v-validate="'required|min:4'"
              v-autofocus
              :disabled="form.busy"
              :placeholder="$t('Project name')"
              type="text"
              name="name"
              :state="$validateState('name', form)"
            ></b-form-input>
            <label for="name">{{ $t("Name") }}</label>
            <b-form-invalid-feedback>{{
              $displayError("name", form)
            }}</b-form-invalid-feedback>
          </div>
        </b-col>
        <b-col cols="12">
          <div class="form-group">
            <user-selector
              v-model="form.userIds"
              v-validate="'required|minlength:1'"
              :show-field="true"
              name="users"
              style="z-index: 1; position: relative"
              :state="$validateState('users', form)"
              :items="users"
              :show-add-btn="false"
            ></user-selector>
            <b-form-invalid-feedback>{{
              $displayError("users", form)
            }}</b-form-invalid-feedback>
          </div>
        </b-col>
        <b-col cols="12">
          <div class="form-group">
            <tool-selector
              ref="toolsDropDown"
              :key="toolDropwDownIntent"
              :show-field="true"
              :items="toolsForStage"
              :place-holder-text="$t('Test Tools')"
              :state="$validateState('tools', form)"
              :show-add-btn="false"
              v-model="form.companyToolIds"
              @input="refreshIdeas('tools')"
              name="tools"
              style="z-index: 1; position: relative"
            ></tool-selector>

            <b-form-invalid-feedback>{{
              $displayError("tools", form)
            }}</b-form-invalid-feedback>
          </div>
        </b-col>
        <b-col cols="12">
          <div class="form-group">
            <idea-selector
              ref="ideasDropDown"
              :key="ideaDropwDownIntent"
              :show-field="true"
              :place-holder-text="$t('Test Ideas')"
              :items="concatedTestingIdeas"
              :state="$validateState('ideas', form)"
              :show-add-btn="false"
              v-model="selectedProjectIdeas"
              @input="refreshIdeas('ideas')"
              name="ideas"
              style="z-index: 1; position: relative"
            ></idea-selector>
            <b-form-invalid-feedback>{{
              $displayError("ideas", form)
            }}</b-form-invalid-feedback>
          </div>
        </b-col>
        <b-col class="col-12">
          <div class="form-label-group required">
            <b-form-input
              id="budget"
              v-model.number="budget"
              v-validate="'required|numeric|min_value:0'"
              :disabled="form.busy"
              :placeholder="$t('Budget')"
              type="number"
              name="budget"
              :state="$validateState('budget', form)"
            ></b-form-input>
            <label for="budget">{{ $t("Budget") }}</label>
            <b-form-invalid-feedback>{{
              $displayError("budget", form)
            }}</b-form-invalid-feedback>
          </div>
        </b-col>
        <b-col class="col-12" v-if="mode === 'create'">
          <div class="form-label-group required">
            <v-select
              v-model="form.type"
              v-validate="'required'"
              label="label"
              :get-option-label="(v) => this.$t(v.label)"
              data-vv-name="type"
              :placeholder="$t('Project type')"
              :reduce="(v) => v.id"
              :options="projectTypeOptions"
              :class="{
                'is-invalid': $validateState('type', form) === false,
                'is-valid': $validateState('type', form) === true,
              }"
            ></v-select>
            <label for="type">{{ $t("Project type") }}</label>
            <b-form-invalid-feedback>{{
              $displayError("type", form)
            }}</b-form-invalid-feedback>
          </div>
        </b-col>
        <b-col class="col-12" v-if="mode === 'create'">
          <div class="form-label-group required">
            <v-select
              v-model="form.evaluationType"
              v-validate="'required'"
              label="label"
              :get-option-label="(v) => this.$t(v.label)"
              data-vv-name="evaluation_type"
              :placeholder="$t('Evaluation type')"
              :reduce="(v) => v.id"
              :options="evaluationTypeOptions"
              :disabled="form.busy"
              :class="{
                'is-invalid': $validateState('evaluation_type', form) === false,
                'is-valid': $validateState('evaluation_type', form) === true,
              }"
            ></v-select>
            <label for="evaluation_type">{{ $t("Evaluation type") }}</label>
            <b-form-invalid-feedback>{{
              $displayError("evaluation_type", form)
            }}</b-form-invalid-feedback>
          </div>
        </b-col>
        <b-col
          v-if="form.evaluationType === 'PERIODIC' && mode === 'create'"
          class="col-12"
        >
          <b-row>
            <b-col class="col-4 pr-1">
              <div class="form-label-group required">
                <b-form-input
                  id="evaluation_interval_amount"
                  v-model.number="form.evaluationIntervalAmount"
                  v-validate="'required|numeric|min_value:0'"
                  :disabled="form.busy"
                  :placeholder="$t('Interval')"
                  type="number"
                  name="evaluation_interval_amount"
                  :state="$validateState('evaluation_interval_amount', form)"
                ></b-form-input>
                <label for="evaluation_interval_amount">{{
                  $t("Evaluation interval")
                }}</label>
                <b-form-invalid-feedback>{{
                  $displayError("evaluation_interval_amount", form)
                }}</b-form-invalid-feedback>
              </div>
            </b-col>
            <b-col class="col-8 pl-1" v-if="mode === 'create'">
              <div class="form-label-group required">
                <v-select
                  v-model="form.evaluationIntervalUnit"
                  v-validate="'required'"
                  label="label"
                  :get-option-label="(v) => this.$t(v.label)"
                  data-vv-name="evaluation_interval_unit"
                  :placeholder="$t('Period')"
                  :reduce="(v) => v.id"
                  :options="evaluationUnitOptions"
                  :disabled="form.busy"
                  :class="{
                    'is-invalid': $validateState('role', form) === false,
                    'is-valid': $validateState('role', form) === true,
                  }"
                ></v-select>
                <label for="evaluation_interval_unit">{{
                  $t("Evaluation interval")
                }}</label>
                <b-form-invalid-feedback>{{
                  $displayError("evaluation_interval_unit", form)
                }}</b-form-invalid-feedback>
              </div>
            </b-col>
          </b-row>
        </b-col>
      </b-row>
      <b-row>
        <b-col class="col-12">
          <hr class="mt-0" />
          <loading-button
            size="lg"
            block
            type="submit"
            :disabled="vErrors.any() || form.busy || ifEditAndFinished"
            :loading="form.busy"
            variant="primary"
            >{{ $t("Save changes") }}</loading-button
          >
          <div
            v-if="mode === 'edit' && $can('core/project/delete', input)"
            class="mt-3 text-center"
          >
            <hr />
            <confirm-button
              variant="transparent"
              :confirm-message="$t('This action cannot be undone!')"
              :confirm-title="$t('Delete project') + '?'"
              :confirm-text="$t('Delete project')"
              btn-class="btn-outline-danger"
              size="sm"
              :show-overlay="false"
              block
              @confirm="deleteItem"
            >
              <i class="mdi mdi-trash-can"></i>
              {{ $t("Delete project") }}
            </confirm-button>
          </div>
        </b-col>
      </b-row>
    </b-form>
    <div v-else class="text-center p-5">
      <b-spinner></b-spinner>
    </div>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import GQLForm from "@/lib/gqlform";

export default {
  props: {
    value: {
      type: Object,
      required: false,
    },
    mode: {
      type: String,
      required: false,
      default: "create",
    },
    stage: {
      type: Object,
      required: false,
    },
  },
  data: () => ({
    selectedProjectIdeas: [],
    intent: Math.random(),
    ideaDropwDownIntent: Math.random(),
    toolDropwDownIntent: Math.random(),
    evaluationUnitOptions: [
      {
        id: "DAYS",
        label: "DAYS",
      },
      {
        id: "WEEKS",
        label: "WEEKS",
      },
      {
        id: "MONTHS",
        label: "MONTHS",
      },
      {
        id: "YEARS",
        label: "YEARS",
      },
    ],
    evaluationTypeOptions: [
      {
        id: "STAGE_FINISH",
        label: "On finish stage",
      },
      {
        id: "PERIODIC",
        label: "Periodic",
      },
    ],
    projectTypeOptions: [
      {
        id: "NORMAL",
        label: "Normal",
      },
      {
        id: "ON_GOING",
        label: "On going",
      },
    ],
    ready: false,
    input: null,
    toolsForStage: null,
    budget: null,
    form: new GQLForm({
      id: null,
      name: null,
      processId: null,
      userIds: [],
      processStageId: null,
      ideaIds: [],
      companyToolIds: [],
      type: "NORMAL",
      evaluationType: "STAGE_FINISH",
      evaluationIntervalUnit: "WEEKS",
      evaluationIntervalAmount: 1,
      budget: 0,
    }),
  }),
  computed: {
    ifEditAndFinished: {
      get() {
        if (this.stage) {
          return this.mode == "edit" ? this.stage.status === "FINISHED" : false;
        } else {
          return false;
        }
      },
    },
    getAvailableOrAllStages: {
      get() {
        console.log(
          this.filteredProjects.filter((proj) => proj.id === this.input.id)
        );
        console.log(this.filteredProjects);
        return this.filteredProjects.filter(
          (proj) => proj.id === this.input.id
        );
      },
    },
    process: {
      get() {
        const result = this.currentProcess("projects")
          ? this.currentProcess("projects").process
          : null;

        console.log(result);
        return result;
      },
    },
    availableProcessIdeas: {
      get() {
        if (!this.process) {
          return [];
        }

        const result = this.$store.getters["idea/byProcess"](this.process.id);
        const filteredIdeasByStatus = result.filter(
          (o) => o.status === "TESTING" || o.status === "ADOPTED"
        );

        //Include all in Create
        //Include filter by Staged
        //Show all when ON_GOING
        if (this.mode === "edit" && this.input?.type !== "ON_GOING") {
          return filteredIdeasByStatus.filter(
            (idea) => idea.stageId === this.stage?.processStage.id
          );
        } else {
          return filteredIdeasByStatus;
        }
      },
    },

    availableToolIdeas: {
      get() {
        if (!this.process) {
          return [];
        }
        const result = this.$store.getters["toolIdea/byProcess"](
          this.process.id
        );

        const filteredToolsIdeasByStatus = result.filter(
          (o) => o.status === "TESTING" || o.status === "ADOPTED"
        );

        const toolIdeasBySelectedCompanyTools = filteredToolsIdeasByStatus.filter(
          (toolIdea) =>
            this.form.companyToolIds.indexOf(toolIdea.companyToolId) > -1
        );

        //Include all in Create
        //Include filter by Staged
        //Show all when ON_GOING
        if (this.mode === "edit" && this.input?.type !== "ON_GOING") {
          return toolIdeasBySelectedCompanyTools.filter(
            (toolIdea) => toolIdea.stageId === this.stage?.processStage.id
          );
        } else {
          return toolIdeasBySelectedCompanyTools;
        }
      },
    },
    concatedAdoptedIdeas: {
      get() {
        if (!this.process) {
          return [];
        }
        //Filter adopted as these will be silently added on Save
        const result = this.availableProcessIdeas
          .concat(this.availableToolIdeas)
          .filter((idea) => idea.status === "ADOPTED");
        return result;
      },
    },
    concatedTestingIdeas: {
      get() {
        if (!this.process) {
          return [];
        }
        //Filter adopted as these will be silently added on Save
        const result = this.availableProcessIdeas
          .concat(this.availableToolIdeas)
          .filter((idea) => idea.status === "TESTING");

        console.log(result);
        return result;
      },
    },
    ...mapGetters({
      filteredProjects: "project/filteredItems",
      currentProcess: "process/current",
      currentUser: "auth/user",
      users: "user/all",
      allTools: "companyTool/all",
    }),
  },

  async mounted() {
    this.intent = Math.random();
    this.input = this.value;
    await Promise.all([
      this.loadUsers(),
      this.loadIdeas(),
      this.loadToolIdeas(),
    ]);
    await this.initForm();
    this.ready = true;
  },

  methods: {
    async loadIdeas() {
      const result = await this.$store.dispatch("idea/findByProcess", {
        id: this.process.id,
      });
      return result;
    },
    async loadToolIdeas() {
      const result = await this.$store.dispatch("toolIdea/findByProcess", {
        id: this.process.id,
      });
      return result;
    },
    async loadUsers() {
      const result = await this.$store.dispatch("user/findAll", {});
      return result;
    },
    async initForm() {
      await this.populatePreselectionToForm();
      await this.refreshIdeas();
    },
    async populatePreselectionToForm() {
      Object.keys(this.input || {})
        .filter((key) => key in this.form)
        .forEach((key) => (this.form[key] = this.input[key]));

      console.log(this.input);
      this.form.processId = this.process.id;

      if (this.input) {
        if (this.input.toolIds) {
          const selectedProjectForStage = this.filteredProjects.find(
            (proj) => proj.id == this.input.id
          );

          const availableToolsForStage = selectedProjectForStage?.tools.filter(
            (x) => x.stageId == this.stage?.id
          );

          const allTools = this.allTools.filter((tool) => tool.type === "TOOL");
          this.toolsForStage = [...allTools];

          const availableToolIdsForStage = availableToolsForStage
            .filter((x) => this.input.toolIds.indexOf(x.toolId) >= 0)
            .map((x) => x.toolId);

          this.form.companyToolIds = [...availableToolIdsForStage];
        }

        if (this.input.ideaIds) {
          const preSelectedObjects = this.concatedTestingIdeas.filter(
            (idea) => this.input.ideaIds.indexOf(idea.id) >= 0
          );

          const toolIdeas = preSelectedObjects.filter(
            (obj) => obj.tool !== null && obj.status !== "ADOPTED"
          );
          const ideas = preSelectedObjects.filter(
            (obj) => obj.tool === null && obj.status !== "ADOPTED"
          );

          const preSelectedIdeaIds = [];
          const preSelectedToolIdeaIds = [];

          ideas.map((tool) => preSelectedIdeaIds.push(tool.id));
          toolIdeas.map((tool) => preSelectedToolIdeaIds.push(tool.id));

          this.selectedProjectIdeas = [
            ...preSelectedIdeaIds,
            ...preSelectedToolIdeaIds,
          ];
        }

        if (this.input.budget) {
          this.budget = this.input.budget / 100;
        }
      }
    },

    async save() {
      this.form.ideaIds = [...this.selectedProjectIdeas];
      this.form.budget = this.budget * 100;

      console.log(this.form.budget);
      //Add adopted Ideas Silently
      if (this.concatedAdoptedIdeas.length > 0) {
        this.concatedAdoptedIdeas.map((i) => {
          this.form.ideaIds.push(i.id);
        });
      }

      //include all stages if ON_GOING project
      if (this.mode === "edit") {
        if (this.input.type === "ON_GOING") {
          const currentProj = this.getAvailableOrAllStages.find(
            (x) => x.id === this.input.id
          );
          const currentProjStages = currentProj.stages.map((y) => y.id);
          this.form.processStageId = [...currentProjStages];
        } else {
          this.form.processStageId = [this.stage?.id ?? null];
        }
      } else {
        /*     if (this.form.type === "ON_GOING") { */
        console.log("__________________");
        console.log(this.process.stages);
        this.form.processStageId = [
          ...new Set(this.process.stages.map((x) => x.id)),
        ];
        /*      } else {
          this.form.processStageId = [this.process.stages[0].id]
        } */
      }

      try {
        await this.$validator.validateAll();
        if (!this.vErrors.any()) {
          this.$validator.reset();
          if (this.mode === "edit") {
            this.input = await this.$store.dispatch(
              "project/update",
              this.form
            );
          } else {
            console.log(this.form);
            this.input = await this.$store.dispatch(
              "project/create",
              this.form
            );
          }
          // await this.initForm();
          this.$emit("input", this.input);
          this.$emit("done");
        }
      } catch (ex) {
        this.budget = this.form.budget / 100;
        console.log(ex);
      }
    },
    refreshIdeas(initiator) {
      let selectedIdeaIds = [];
      let selectedToolIdeaIds = [];

      this.availableToolIdeas
        .filter(
          (toolIdea) =>
            this.form.companyToolIds.indexOf(toolIdea.companyToolId) > -1 &&
            this.selectedProjectIdeas.indexOf(toolIdea.id) > -1 &&
            toolIdea.status === "TESTING"
        )
        .map((_toolIdea) => selectedToolIdeaIds.push(_toolIdea.id));

      this.availableProcessIdeas
        .filter(
          (idea) =>
            this.selectedProjectIdeas.indexOf(idea.id) > -1 &&
            idea.status === "TESTING"
        )
        .map((_idea) => selectedIdeaIds.push(_idea.id));
      if (initiator === "tools") {
        if (this.$refs["ideasDropDown"]) {
          this.ideaDropwDownIntent = Math.random();
          this.$refs["ideasDropDown"].$forceUpdate();
        }
      }
      this.selectedProjectIdeas = [...selectedIdeaIds, ...selectedToolIdeaIds];
    },
    async deleteItem() {
      this.$emit("done");
      const result = await this.$store.dispatch(
        "project/delete",
        new GQLForm(
          {
            id: this.input.id,
          },
          null
        )
      );
      return result;
    },
  },
};
</script>
