<template>
  <div>
    <b-form
      @submit.prevent="save"
      @keyup="$validator.validateAll()"
      class="hide-labels"
      v-if="ready"
    >
      <b-row>
        <b-col class="col-12">
          <div class="form-label-group required">
            <b-form-input
              id="name"
              :disabled="form.busy"
              v-model="form.name"
              :placeholder="$t('Project name')"
              type="text"
              name="name"
              :state="$validateState('name', form)"
              v-validate="'required|min:4'"
              v-autofocus
            ></b-form-input>
            <label for="name">{{ $t('Name') }}</label>
            <b-form-invalid-feedback>{{ $displayError('name', form) }}</b-form-invalid-feedback>
          </div>
        </b-col>
        <b-col cols="12">
          <div class="form-group">
            <user-selector
              :show-field="true"
              name="users"
              style="z-index:1;position:relative"
              v-validate="'required|minlength:1'"
              :state="$validateState('users', form)"
              v-model="form.userIds"
              :items="users"
              :show-add-btn="false"
            ></user-selector>
            <b-form-invalid-feedback>{{ $displayError('users', form) }}</b-form-invalid-feedback>
          </div>
        </b-col>
        <b-col cols="12" v-if="mode==='create'">
          <div class="form-group">
            <tool-selector
              :show-field="true"
              name="tools"
              @input="refreshIdeas"
              style="z-index:1;position:relative"
              v-model="form.companyToolIds"
              :show-add-btn="false"
            ></tool-selector>
            <b-form-invalid-feedback>{{ $displayError('tools', form) }}</b-form-invalid-feedback>
          </div>
        </b-col>
        <b-col cols="12" v-if="mode==='create'">
          <div class="form-group">
            <idea-selector
              :show-field="true"
              :placeHolderText="$t('Test Ideas')"
              name="ideas"
              ref="ideasDropDown"
              :key="ideaDropwDownIntent"
              :items="availableIdeas"
              style="z-index:1;position:relative"
              v-validate="'required|minlength:1'"
              :state="$validateState('ideas', form)"
              v-model="form.ideaIds"
              :show-add-btn="false"
            ></idea-selector>
            <b-form-invalid-feedback>{{ $displayError('ideas', form) }}</b-form-invalid-feedback>
          </div>
        </b-col>
        <b-col class="col-12">
          <div class="form-label-group required">
            <b-form-input
              id="budget"
              :disabled="form.busy"
              v-model.number="form.budget"
              :placeholder="$t('Budget')"
              type="number"
              name="budget"
              :state="$validateState('budget', form)"
              v-validate="'required|numeric|min_value:0'"
            ></b-form-input>
            <label for="budget">{{ $t('Budget') }}</label>
            <b-form-invalid-feedback>{{ $displayError('budget', form) }}</b-form-invalid-feedback>
          </div>
        </b-col>
        <b-col class="col-12">
          <div class="form-label-group required">
            <v-select
              label="label"
              :getOptionLabel="(v)=>this.$t(v.label)"
              v-validate="'required'"
              data-vv-name="type"
              v-model="form.type"
              :placeholder="$t('Project type')"
              :reduce="v => v.id"
              :options="projectTypeOptions"
              :class="{'is-invalid':$validateState('type', form)===false, 'is-valid':$validateState('type', form)===true}"
            ></v-select>
            <label for="type">{{ $t('Project type') }}</label>
            <b-form-invalid-feedback>{{ $displayError('type', form) }}</b-form-invalid-feedback>
          </div>
        </b-col>
        <b-col class="col-12">
          <div class="form-label-group required">
            <v-select
              label="label"
              :getOptionLabel="(v)=>this.$t(v.label)"
              v-validate="'required'"
              data-vv-name="evaluation_type"
              v-model="form.evaluationType"
              :placeholder="$t('Evaluation type')"
              :reduce="v => v.id"
              :options="evaluationTypeOptions"
              :disabled="form.busy"
              :class="{'is-invalid':$validateState('evaluation_type', form)===false, 'is-valid':$validateState('evaluation_type', form)===true}"
            ></v-select>
            <label for="evaluation_type">{{ $t('Evaluation type') }}</label>
            <b-form-invalid-feedback>{{ $displayError('evaluation_type', form) }}</b-form-invalid-feedback>
          </div>
        </b-col>
        <b-col class="col-12" v-if="form.evaluationType==='PERIODIC'">
          <b-row>
            <b-col class="col-4 pr-1">
              <div class="form-label-group required">
                <b-form-input
                  id="evaluation_interval_amount"
                  :disabled="form.busy"
                  v-model.number="form.evaluationIntervalAmount"
                  :placeholder="$t('Interval')"
                  type="number"
                  name="evaluation_interval_amount"
                  :state="$validateState('evaluation_interval_amount', form)"
                  v-validate="'required|numeric|min_value:0'"
                ></b-form-input>
                <label for="evaluation_interval_amount">{{ $t('Evaluation interval') }}</label>
                <b-form-invalid-feedback>{{ $displayError('evaluation_interval_amount', form) }}</b-form-invalid-feedback>
              </div>
            </b-col>
            <b-col class="col-8 pl-1">
              <div class="form-label-group required">
                <v-select
                  label="label"
                  :getOptionLabel="(v)=>this.$t(v.label)"
                  v-validate="'required'"
                  data-vv-name="evaluation_interval_unit"
                  v-model="form.evaluationIntervalUnit"
                  :placeholder="$t('Period')"
                  :reduce="v => v.id"
                  :options="evaluationUnitOptions"
                  :disabled="form.busy"
                  :class="{'is-invalid':$validateState('role', form)===false, 'is-valid':$validateState('role', form)===true}"
                ></v-select>
                <label for="evaluation_interval_unit">{{ $t('Evaluation interval') }}</label>
                <b-form-invalid-feedback>{{ $displayError('evaluation_interval_unit', form) }}</b-form-invalid-feedback>
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
            :disabled="vErrors.any()||form.busy"
            :loading="form.busy"
            variant="primary"
          >{{ $t('Save changes')}}</loading-button>
          <div v-if="mode==='edit' && $can('core/project/delete', input)" class="mt-3 text-center">
            <hr />
            <confirm-button
              variant="transparent"
              :confirmMessage="$t('This action cannot be undone!')"
              :confirmTitle="$t('Delete project')+'?'"
              :confirmText="$t('Delete project')"
              btnClass="btn-outline-danger"
              size="sm"
              :showOverlay="false"
              block
              @confirm="deleteItem"
            >
              <i class="mdi mdi-trash-can"></i>
              {{ $t('Delete project') }}
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
import GQLForm from "@/lib/gqlform";
import { /*mapState,*/ mapGetters } from "vuex";

export default {
  props: {
    value: {
      type: Object,
      required: false
    },
    mode: {
      type: String,
      required: false,
      default: "create"
    }
  },
  data: () => ({
    adoptedIdeas: [],
    intent: Math.random(),
    ideaDropwDownIntent: Math.random(),
    evaluationUnitOptions: [
      {
        id: "DAYS",
        label: "DAYS"
      },
      {
        id: "WEEKS",
        label: "WEEKS"
      },
      {
        id: "MONTHS",
        label: "MONTHS"
      },
      {
        id: "YEARS",
        label: "YEARS"
      }
    ],
    evaluationTypeOptions: [
      {
        id: "STAGE_FINISH",
        label: "On finish stage"
      },
      {
        id: "PERIODIC",
        label: "Periodic"
      }
    ],
    projectTypeOptions: [
      {
        id: "NORMAL",
        label: "Normal"
      },
      {
        id: "ON_GOING",
        label: "On going"
      }
    ],
    ready: false,
    input: null,
    availableIdeas: [],
    selectedIdeas: [],
    form: new GQLForm({
      id: null,
      name: null,
      processId: null,
      userIds: [],
      ideaIds: [],
      companyToolIds: [],
      type: "NORMAL",
      evaluationType: "STAGE_FINISH",
      evaluationIntervalUnit: "WEEKS",
      evaluationIntervalAmount: 1,
      budget: 0
    })
  }),
  computed: {
    process: {
      get: function() {
        return this.currentProcess("projects")
          ? this.currentProcess("projects").process
          : null;
      }
    },
    processIdeas: {
      get: function() {
        if (!this.process) {
          return [];
        }
        return this.$store.getters["idea/byProcess"](this.process.id).filter(
          o => o.status === "TESTING" || o.status === "ADOPTED"
        );
      }
    },
    toolIdeas: {
      get: function() {
        if (!this.process) {
          return [];
        }
        return this.$store.getters["toolIdea/byProcess"](
          this.process.id
        ).filter(
          o =>
            (o.status === "TESTING" || o.status === "ADOPTED") &&
            this.form.companyToolIds.find(t => t == o.companyToolId)
        );
      }
    },
    ideas: {
      get: function() {
        if (!this.process) {
          return [];
        }
        const ideas = this.processIdeas.concat(this.toolIdeas);

        return ideas;
      }
    },
    // users: {
    //   get: function() {
    //     if (!this.process) {
    //       return [];
    //     }
    //     return [...this.process.users].sort((a, b) =>
    //       a.firstName > b.firstName ? 1 : -1
    //     );
    //  }
    //},
    ...mapGetters({
      currentProcess: "process/current",
      currentUser: "auth/user",
      users: "user/all"
    })
  },
  async mounted() {
    this.intent = Math.random();
    this.input = this.value;
    await Promise.all([
      this.loadUsers(),
      this.loadIdeas(),
      this.loadToolIdeas()
    ]);
    // await this.loadUsers();
    // await this.loadIdeas();
    // await this.loadToolIdeas();
    await this.initForm();
    this.ready = true;
  },
  methods: {
    async loadIdeas() {
      //if (this.process && this.processIdeas.length == 0) {
      await this.$store.dispatch("idea/findByProcess", {
        id: this.process.id
      });
      //}
    },
    async loadToolIdeas() {
      //if (this.process && this.toolIdeas.length == 0) {
      await this.$store.dispatch("toolIdea/findByProcess", {
        id: this.process.id
      });
      //}
    },
    async loadUsers() {
      await this.$store.dispatch("user/findAll", {});
    },
    async initForm() {
      Object.keys(this.input || {})
        .filter(key => key in this.form)
        .forEach(key => (this.form[key] = this.input[key]));
      this.form.budget = this.form.budget / 100;
      this.form["processId"] = this.process.id;
      this.refreshIdeas();
    },
    async save() {
      try {
        await this.$validator.validateAll();
        if (!this.vErrors.any()) {
          this.form.budget = this.form.budget * 100;


          // Add Adopted Ideas Silently
          this.adoptedIdeas.map( i => {
            this.form.ideaIds.push(i);
          })
          //

          this.$validator.reset();
          if (this.mode === "edit") {
            this.input = await this.$store.dispatch(
              "project/update",
              this.form
            );
          } else {
            this.input = await this.$store.dispatch(
              "project/create",
              this.form
            );
          }
          await this.initForm();
          this.$emit("input", this.input);
          this.$emit("done");
        }
      } catch (ex) {
        console.error(ex.message);
      }
    },
    refreshIdeas() {
      const oldIdeas = [...(this.availableIdeas || [])];
      this.availableIdeas = [...this.ideas];
      this.adoptedIdeas = [];

      

      //select auto the ideas that were not in selected
      const toSelect = [
        ...new Set(
          this.availableIdeas.filter(
            o => !oldIdeas.find(i => i.id === o.id) && o.status === "ADOPTED"
          )
        )
      ];

      // Filter Adopted Ideas in the selection as these would be automatic selection
      this.availableIdeas = this.availableIdeas.filter(i => (i.status !== "ADOPTED") )
      
      toSelect
        .filter(o => !this.form.ideaIds.find(i => i === o.id))
        .map(i => {
          // this.form.ideaIds.push(i.id);
          this.adoptedIdeas.push(i.id);
        });
      
      console.log(this.adoptedIdeas)

      if (this.$refs["ideasDropDown"]) {
        this.ideaDropwDownIntent = Math.random();
        this.$refs["ideasDropDown"].$forceUpdate();
      }
      this.ideas;
    },
    async deleteItem() {
      this.$emit("done");
      const result = await this.$store.dispatch(
        "project/delete",
        new GQLForm(
          {
            id: this.input.id
          },
          null
        )
      );
      return result;
    }
  }
};
</script>