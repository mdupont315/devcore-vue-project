<template>
  <b-form @submit.prevent="save" @keyup="$validator.validateAll()">
    <b-row>
      <b-col class="col-12" ref="projectFormNameField">
        <div class="form-label-group required form-group">
          <b-form-input
            id="effect_template_name"
            name="effect_template_name"
            v-model.trim="form.title"
            v-validate="'required|min:4'"
            v-autofocus
            :placeholder="$t('Template name')"
            type="text"
            autocomplete="off"
            autofocus
            :state="$validateState('title', form)"
          ></b-form-input>
          <b-form-invalid-feedback>{{
            $displayError("title", form)
          }}</b-form-invalid-feedback>
        </div>
      </b-col>
      <b-col class="col-12" style="padding-bottom: 10px">
        <div class="form-label-group select required">
          <v-select
            v-model="form.processId"
            v-validate="'required'"
            label="title"
            data-vv-name="process"
            :placeholder="$t('Process')"
            :reduce="(_process) => _process.id"
            :options="processes"
            @input="loadProcess"
            :class="{
              'is-invalid': $validateState('processId', form) === false,
              'is-valid': $validateState('processId', form) === true,
            }"
          ></v-select>
          <b-form-invalid-feedback>{{
            $displayError("processId", form)
          }}</b-form-invalid-feedback>
        </div>
      </b-col>
      <b-col
        class="col-12"
        style="padding-bottom: 10px"
        v-if="form.processId && getProcessStages.length > 0"
      >
        <div class="form-label-group select required">
          <v-select
            v-model="form.stageId"
            v-validate="'required'"
            label="title"
            data-vv-name="process"
            :placeholder="$t('Stage')"
            :reduce="(_stage) => _stage.id"
            :options="getProcessStages"
            :class="{
              'is-invalid': $validateState('processId', form) === false,
              'is-valid': $validateState('processId', form) === true,
            }"
          ></v-select>
          <b-form-invalid-feedback>{{
            $displayError("processId", form)
          }}</b-form-invalid-feedback>
        </div>
      </b-col>
      <b-col
        class="col-12"
        style="padding-bottom: 10px"
        v-if="form.processId && form.stageId && getProcessOperations.length > 0"
      >
        <div class="form-label-group select">
          <v-select
            v-model="form.operationId"
            label="title"
            data-vv-name="process"
            :placeholder="$t('Operation')"
            :reduce="(_operation) => _operation.id"
            :options="getProcessOperations"
            :class="{
              'is-invalid': $validateState('processId', form) === false,
              'is-valid': $validateState('processId', form) === true,
            }"
          ></v-select>
          <b-form-invalid-feedback>{{
            $displayError("processId", form)
          }}</b-form-invalid-feedback>
        </div>
      </b-col>
      <b-col
        class="col-12"
        style="padding-bottom: 10px"
        v-if="form.stageId && form.operationId && getProcessPhases.length > 0"
      >
        <div class="form-label-group select">
          <v-select
            v-model="form.phaseId"
            label="title"
            data-vv-name="process"
            :placeholder="$t('Phase')"
            :reduce="(_phases) => _phases.id"
            :options="getProcessPhases"
            :class="{
              'is-invalid': $validateState('processId', form) === false,
              'is-valid': $validateState('processId', form) === true,
            }"
          ></v-select>
          <b-form-invalid-feedback>{{
            $displayError("processId", form)
          }}</b-form-invalid-feedback>
        </div>
      </b-col>
      <b-col class="col-12" v-if="form.processId" style="padding-bottom: 10px">
        <div class="form-label-group select required">
          <v-select
            v-model="form.companyRoleId"
            v-validate="'required'"
            label="name"
            data-vv-name="companyRole"
            :placeholder="$t('Role')"
            :reduce="(role) => role.id"
            :options="companyRoles"
            :class="{
              'is-invalid': $validateState('companyRole', form) === false,
              'is-valid': $validateState('companyRole', form) === true,
            }"
          ></v-select>
          <b-form-invalid-feedback>{{
            $displayError("companyRole", form)
          }}</b-form-invalid-feedback>
        </div>
      </b-col>
      <b-col class="col-12" style="padding-bottom: 10px">
        <b-row>
          <b-col class="col-5 pr-1" style="padding-bottom: 10px">
            <div class="form-label-group select required">
              <b-form-select
                v-model="form.measureUnit"
                v-validate="'required'"
                label="title"
                @input="emptyMeasureValue"
                data-vv-name="process"
                :placeholder="$t('Effect Loss Unit')"
                :options="['time', 'money']"
                :class="{
                  'is-invalid': $validateState('processId', form) === false,
                  'is-valid': $validateState('processId', form) === true,
                }"
              ></b-form-select>
              <b-form-invalid-feedback>{{
                $displayError("processId", form)
              }}</b-form-invalid-feedback>
            </div>
          </b-col>
          <b-col class="col-7">
            <b-form-input
              v-if="form.measureUnit === 'money'"
              autocomplete="off"
              v-model="form.effectValue"
              placeholder="value"
              autofocus
              :class="{
                'is-invalid': $validateState('processId', form) === false,
                'is-valid': $validateState('processId', form) === true,
              }"
            ></b-form-input>
            <b-form-input
              v-if="form.measureUnit !== 'money'"
              v-model="getSelectedLossTime"
              :formatter="(val) => val.substring(0, 8)"
              autocomplete="off"
              :max="4"
              placeholder="HH:mm"
              autofocus
              :class="{
                'is-invalid': $validateState('processId', form) === false,
                'is-valid': $validateState('processId', form) === true,
              }"
            >
            </b-form-input
          ></b-col>
        </b-row>
        <b-row>
          <b-col class="col-12">
            <b-card-footer class="px-0" style="padding-top: 10px">
              <loading-button
                :disabled="vErrors.any() || form.busy"
								:loading="form.busy"
                size="lg"
                block
                type="submit"
                >{{ $t("issueEffectCreateTemplate") }}</loading-button
              >
            </b-card-footer>
          </b-col>
        </b-row>
        <!--       <div style="font-size: 20px" v-else>
              <span v-if="form.selectedLoss.value.days > 0"
                >{{ form.selectedLoss.value.days + prefixDD }} :
              </span>
              <span v-if="form.selectedLoss.value.hours > 0"
                >{{ form.selectedLoss.value.hours + prefixHH }} :
              </span>
              <span v-if="form.selectedLoss.value.min > 0"
                >{{ form.selectedLoss.value.min + prefixMM }}
              </span>
            </div> -->
        <!--       </b-col>
        </b-row> -->
        <!--         <b-row v-if="form.selectedLoss.unit !== 'money'">
          <b-col class="col-4">
            <div class="form-label-group required form-group">
              <b-input-group size="lg" :append="prefixDD">
                <b-form-input
                  autocomplete="off"
                  autofocus
                  :placeholder="prefixDD"
                  :max-length="2"
                  v-validate="'numeric|min_value:0|max_value:30'"
                  type="number"
                  v-model="setTimeDays"
                  :state="$validateState('selectedLoss.value.days', form)"
                ></b-form-input>
                <b-form-invalid-feedback>{{
                  $displayError("selectedLoss.value.days", form)
                }}</b-form-invalid-feedback></b-input-group
              >
            </div></b-col
          >

          <b-col class="col-4">
            <b-input-group size="lg" :append="prefixHH">
              <b-form-input
                autocomplete="off"
                autofocus
                :placeholder="prefixHH"
                :max-length="2"
                v-validate="'numeric|min_value:0|max_value:24'"
                type="number"
                v-model="setTimeHours"
              ></b-form-input></b-input-group
          ></b-col>
          <b-col class="col-4">
            <b-input-group size="lg" :append="prefixMM">
              <b-form-input
                autocomplete="off"
                :max-length="2"
                v-validate="'numeric|min_value:0|max_value:60'"
                v-model="setTimeMin"
                :placeholder="prefixMM"
                type="number"
              ></b-form-input
            ></b-input-group>
          </b-col>
        </b-row> -->
      </b-col>
    </b-row>
  </b-form>
</template>

<script>
import { mapGetters } from "vuex";
import GQLForm from "@/lib/gqlform";

export default {
  computed: {
    ...mapGetters({
      companyRoles: "companyRole/all",
      processes: "process/all",
      users: "user/all",
      filteredProcess: "process/filteredItems",
    }),

    getSelectedLossTime: {
      get() {
        if (!this.form.effectTime) return;
        const selectedLoss = this.form.effectTime.toString().replace(/\D/g, "");
        console.log(selectedLoss.length);
        if (selectedLoss.length === 0) {
          return `${selectedLoss ?? 0}`;
        } else if (selectedLoss.length < 3) {
          return `${selectedLoss}${this.timeSuffixMin}`;
        } else if (selectedLoss.length < 4) {
          const hours = selectedLoss.substring(0, 1);
          let minutes = selectedLoss.substring(1, 3);
          minutes = minutes < 60 ? minutes : "59";
          return `${hours}${this.timeSuffixHour}${minutes}${this.timeSuffixMin}`;
        } else if (selectedLoss.length < 5) {
          const hours = selectedLoss.substring(0, 2);
          let minutes = selectedLoss.substring(2, 4);
          minutes = minutes < 60 ? minutes : "59";
          return `${hours}${this.timeSuffixHour}${minutes}${this.timeSuffixMin}`;
        } else {
          console.log("HI");
          console.log(selectedLoss);
          return `99${this.timeSuffixHour}59${this.timeSuffixMin}`;
        }
      },
      set(input) {
        console.log(input);
        console.log(input.replace(/\D/g, "").length);
        if (input.replace(/\D/g, "").length < 5) {
          this.form.effectTime = input.replace(/\D/g, "");
        }
      },
    },
    getProcessStages() {
      /*       console.log(this.filteredProcess);
      const _process = this.processes.find((p) => p.id === this.form.processId);
      console.log(_process);
			const stages =  */
      if (this.process) {
        return this.process.stages;
      }
      return [];
    },
    getProcessOperations() {
      const _stages = this.getProcessStages.find(
        (p) => p.id === this.form.stageId
      );
      return _stages ? _stages.operations : [];
    },
    getProcessPhases() {
      const _operations = this.getProcessOperations.find(
        (p) => p.id === this.form.operationId
      );
      return _operations ? _operations.phases : [];
    },
  },
  methods: {
    emptyMeasureValue() {
      this.form.effectTime = null;
      this.form.effectValue = null;
    },
    async loadProcess() {
      this.$validator.pause();
      this.$validator.reset();
      if (this.form.processId) {
        this.process = await this.$store.dispatch("process/findById", {
          id: this.form.processId,
        });

        if (this.process) {
          this.form.stageId = null;
          this.form.operationId = null;
          this.form.phaseId = null;
        }
        this.$nextTick(() => {
          this.$validator.reset();
          this.$validator.resume();
        });
      }
    },
    async save() {
      console.log(this.form);
      await this.$store.dispatch(`${this.storeName}/create`, this.form);

      /*    console.log(this.form);
      const { id } = this.form;
      const newTemplate = new GQLForm({
        id,
        templateId,
      });

      const response = await this.$store.dispatch(
        "issue/setTemplate",
        newTemplate
      );
      console.log(response); */
    },
  },

  data: () => ({
    process: null,
    storeName: "issueEffect",
    prefixDD: "d",
    prefixHH: "h",
    prefixMM: "min",
    timeSuffixDay: "d",
    timeSuffixHour: "h",
    timeSuffixMin: "min",
    timeSelected: {
      days: "",
      hours: "",
      min: "",
    },
    form: new GQLForm({
      title: null,
      companyRoleId: [],
      processId: null,
      stageId: null,
      operationId: null,
      phaseId: null,
      /*   selectedLoss: {
        value: "",
        time: "",
        unit: "money",
      }, */
      measureUnit: "money",
      effectTime: null,
      effectValue: null,
    }),
  }),
};
</script>
<style scoped>
.issues_effect_add_form_time_divider {
  align-self: center;
  width: 50px;
  font-size: 20px;
  flex-grow: 1;
  display: flex;
  place-content: center;
}
</style>
