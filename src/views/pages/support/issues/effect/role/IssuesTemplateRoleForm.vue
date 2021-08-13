<template>
  <b-form
    @keyup="$validator.validateAll()"
    class="issues-template-role-form-container"
    id="issues-template-role-form-container"
  >
    <div class="issueTemplate-role__card-container-item">
      <div
        class="issueEffect_add_form-new-issue-effect-create-header"
        @click="remove"
      >
        <icoEffectDelete
          width="16"
          height="16"
          style="place-self: center"
        /><span>{{ $t("Delete") }}</span>
      </div>

      <div v-if="value && value.id">
        <div class="issueEffect_addRole-editIcon">
          <b-button
            @click="toggle"
            variant="outline-primary"
            style="width: 70px; height: 30px"
          >
            <icoEffectView width="16" height="16" style="fill: blue"
          /></b-button>
        </div>
      </div>
    </div>

    <b-row style="padding: 0 20px">
      <b-col class="col-12" style="padding-top: 20px; padding-bottom: 10px">
        <div class="form-label-group select required">
          <v-select
            v-model="roleForm.companyRoleId"
            v-validate="'required'"
            label="name"
            data-vv-name="companyRole"
            :placeholder="$t('Role')"
            :reduce="(role) => role.id"
            :options="companyRoles"
          ></v-select>
        </div>
      </b-col>
      <b-col class="col-12" style="padding-bottom: 10px">
        <div class="form-label-group select required">
          <v-select
            v-model="roleForm.processId"
            v-validate="'required'"
            label="title"
            data-vv-name="process"
            :placeholder="$t('Process')"
            :reduce="(_process) => _process.id"
            :options="processes"
            @input="loadProcess"
          ></v-select>
        </div>
      </b-col>
      <b-col
        class="col-12"
        style="padding-bottom: 10px"
        v-if="roleForm.processId && getProcessStages.length > 0"
      >
        <div class="form-label-group select required">
          <v-select
            v-model="roleForm.stageId"
            v-validate="'required'"
            label="title"
            data-vv-name="process"
            :placeholder="$t('Stage')"
            :reduce="(_stage) => _stage.id"
            :options="getProcessStages"
          ></v-select>
          <!--      :class="{
              'is-invalid': $validateState('stageId', roleForm) === false,
              'is-valid': $validateState('stageId', roleForm) === true,
            }" <b-form-invalid-feedback>{{
            $displayError("stageId", roleForm)
          }}</b-form-invalid-feedback> -->
        </div>
      </b-col>
      <b-col
        class="col-12"
        style="padding-bottom: 10px"
        v-if="
          roleForm.processId &&
          roleForm.stageId &&
          getProcessOperations.length > 0
        "
      >
        <div class="form-label-group select">
          <v-select
            v-model="roleForm.operationId"
            label="title"
            data-vv-name="process"
            :placeholder="$t('Operation')"
            :reduce="(_operation) => _operation.id"
            :options="getProcessOperations"
          ></v-select>
        </div>
      </b-col>
      <b-col
        class="col-12"
        style="padding-bottom: 10px"
        v-if="
          roleForm.stageId &&
          roleForm.operationId &&
          getProcessPhases.length > 0
        "
      >
        <div class="form-label-group select">
          <v-select
            v-model="roleForm.phaseId"
            label="title"
            data-vv-name="process"
            :placeholder="$t('Phase')"
            :reduce="(_phases) => _phases.id"
            :options="getProcessPhases"
          ></v-select>
        </div>
      </b-col>

      <b-col class="col-12" style="padding-bottom: 10px">
        <b-row style="padding: 0 0 10px 10px">
          <b-col class="col-5" style="align-self: center; font-size: 14px">
            {{ $t("Effect Loss Value") }}</b-col
          >
          <b-col class="col-7">
            <b-form-input
              autocomplete="off"
              v-model="getSelectedValue"
              :placeholder="$t('Effect Loss Unit Value')"
              autofocus
              :class="{
                'is-invalid': isValueNotValid,
                'is-valid': !isValueNotValid,
              }"
            ></b-form-input>
          </b-col>
        </b-row>
        <b-row style="padding: 0 0 10px 10px">
          <b-col class="col-5" style="align-self: center; font-size: 14px">
            {{ $t("Effect Loss Time") }}</b-col
          >
          <b-col class="col-7">
            <b-form-input
              v-model="getSelectedLossTime"
              v-mask="'##h ##min'"
              autocomplete="off"
              :max="4"
              :placeholder="$t('Effect Loss Unit Time')"
              autofocus
              :class="{
                'is-invalid': isTimeNotValid,
                'is-valid': !isTimeNotValid,
              }"
            >
            </b-form-input>
          </b-col>
        </b-row>
      </b-col>
    </b-row>
  </b-form>
</template>
	<script>
import { mapGetters } from "vuex";
import icoEffectView from "@/assets/img/icons/svg/ico-issue-effect-view.svg?inline";
import icoEffectDelete from "@/assets/img/icons/svg/ico-delete.svg?inline";

export default {
  components: {
    icoEffectView,
    icoEffectDelete,
  },
  props: {
    identifier: {
      required: false,
    },
    input: {
      required: false,
      default: () => {},
    },
    value: {
      required: true,
      default: () => {},
    },
  },
  data: () => ({
    timeSuffixDay: "d",
    timeSuffixHour: "h",
    timeSuffixMin: "min",
    isSaving: false,
    storeName: "issueEffect",
  }),
  mounted() {
    if (this.roleForm.effectTime) {
      var timeArr = [...this.roleForm.effectTime.toString()];
      while (timeArr.length < 4) {
        timeArr.unshift("0");
      }
      this.roleForm.effectTime = timeArr.join("");
    }
  },
  methods: {
    toggle() {
      this.$emit("edit");
    },

    formatTime(time) {
      if (time) {
        var numberPattern = /\d+/g;
        const test = time.toString().match(numberPattern).join("");
        return `${test.charAt(0)}${test.charAt(1)}h ${test.charAt(
          2
        )}${test.charAt(3)}min`;
      } else {
        return "00h 00min";
      }
    },
    remove() {
      this.$emit("remove", this.identifier);
    },
    async loadProcess() {
      this.$validator.pause();
      this.$validator.reset();
      if (this.roleForm.processId) {
        this.process = await this.$store.dispatch("process/findById", {
          id: this.roleForm.processId,
        });

        if (this.process) {
          this.roleForm.stageId = null;
          this.roleForm.operationId = null;
          this.roleForm.phaseId = null;
        }
        this.$nextTick(() => {
          this.$validator.reset();
          this.$validator.resume();
        });
      }
    },
    emptyMeasureValue() {
      this.roleForm.effectTime = null;
      this.roleForm.effectValue = null;
    },
  },

  computed: {
    ...mapGetters({
      companyRoles: "companyRole/all",
      users: "user/all",
      processes: "process/all",
    }),
    isValueNotValid() {
      if (!this.roleForm.effectValue || this.roleForm.effectValue === 0)
        return false;
      if (parseFloat(this.roleForm.effectValue) < 1) {
        return true;
      }
      return false;
    },
    isTimeNotValid() {
      if (!this.roleForm.effectTime) return false;
      if (
        this.roleForm.effectTime.toString().length === 4 ||
        this.roleForm.effectTime.toString() === 0
      ) {
        return false;
      }
      return true;
    },
    roleForm: {
      get() {
        return this.value;
      },
      set(input) {
        this.$validator.validateAll();
        this.$emit("input", input);
      },
    },

    getProcessStages() {
      if (this.roleForm.processId || this.input.processId) {
        const process = this.processes.find(
          (s) => s.id === this.roleForm.processId
        );

        return process.stages;
      }
      return [];
    },
    getProcessOperations() {
      const _stages = this.getProcessStages.find(
        (p) => p.id === this.roleForm.stageId
      );
      return _stages ? _stages.operations : [];
    },
    getProcessPhases() {
      const _operations = this.getProcessOperations.find(
        (p) => p.id === this.roleForm.operationId
      );
      return _operations ? _operations.phases : [];
    },

    getSelectedValue: {
      get() {
        return this.$currencyReverse(this.roleForm.effectValue / 100);
      },
      set(input) {
        this.roleForm.effectValue = input.replace(/[^0-9.]/g, "") * 100;
      },
    },
    getSelectedLossTime: {
      get() {
        return this.formatTime(this.roleForm.effectTime);
      },
      set(input) {
        var numberPattern = /\d+/g;
        this.roleForm.effectTime = input.match(numberPattern).join("");
      },
    },
  },
};
</script>
<style scoped>
.issues-template-role-form-container {
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  margin-left: 10px;
  background: #fff;
  border-radius: 3px;
  width: 255px;
  min-height: 275px;
}

.issueTemplate-role__card-container-item {
  align-items: center;
  width: 100%;
  place-self: center;
  height: 50px;
  display: flex;
  padding: 20px 20px 0 20px;
  justify-content: space-between;
}
.issueEffect_addRole-editIcon > button > svg > path {
  fill: #4294d0;
}
.issueEffect_addRole-editIcon:hover > button > svg > path {
  fill: #fff;
}

.issueEffect_add_form-new-issue-effect-create-header {
  font-size: 10.5px;
  place-self: center;
  display: flex;
  align-items: center;
  cursor: pointer;
}
</style>
