<template>
  <b-form
    @submit.prevent="save"
    @keyup="$validator.validateAll()"
    class="issues-template-form"
  >
    <b-row>
      <b-col
        class="col-12"
        ref="projectFormNameField"
        style="padding-top: 20px"
      >
        <div class="form-label-group required form-group">
          <b-form-input
            id="effect_template_name"
            name="effect_template_name"
            v-model="effectForm.title"
            v-validate="'required|min:4'"
            v-autofocus
            :placeholder="$t('Template name')"
            type="text"
            autocomplete="off"
            autofocus
            :state="$validateState('title', effectForm)"
          ></b-form-input>
          <b-form-invalid-feedback>{{
            $displayError("title", effectForm)
          }}</b-form-invalid-feedback>
        </div>
      </b-col>

      <b-col class="col-12" style="padding-bottom: 10px">
        <b-row style="padding: 0 0 10px 10px">
          <b-col class="col-5" style="align-self: center">
            {{ $t("Effect Loss Value") }}</b-col
          >
          <b-col class="col-7">
            <b-form-input
              autocomplete="off"
              v-model="getSelectedValue"
              :placeholder="$t('Effect Loss Unit Value')"
              :class="{
                'is-invalid': isValueNotValid,
                'is-valid': !isValueNotValid,
              }"
            ></b-form-input>
          </b-col>
        </b-row>


        <b-row>
          <b-col class="col-12">
            <b-card-footer class="px-0" style="padding-top: 10px">
              <loading-button
                :disabled="
                  vErrors.any() ||
                  effectForm.busy ||
                  isTimeNotValid ||
                  inputsAreNotValid
                "
                :loading="effectForm.busy"
                size="lg"
                block
                type="submit"
                >{{
                  effectForm.id
                    ? $t("Update Issue Effect")
                    : $t("Create Issue Effect")
                }}</loading-button
              >
            </b-card-footer>
          </b-col>
        </b-row>
      </b-col>
    </b-row>
  </b-form>
</template>

<script>
import { mapGetters } from "vuex";
import GQLForm from "@/lib/gqlform";

export default {
  props: {
    input: {
      required: false,
      default: () => {},
    },
    issue: {
      required: false,
      default: () => {},
    },
    value: {
      required: false,
      default: () => {},
    },
    inputsAreNotValid: {
      required: true,
      default: () => false,
    },
  },
  computed: {
    ...mapGetters({
      companyRoles: "companyRole/all",
      processes: "process/all",
      users: "user/all",
    }),
    isValueNotValid() {
      if (!this.effectValue || this.effectValue === 0) return false;
      if (parseFloat(this.effectValue) < 0.01) {
        return true;
      }
      return false;
    },
    isTimeNotValid() {
      if (!this.effectForm.effectTime) return false;
      if (
        this.effectForm.effectTime.toString().length === 4 ||
        this.effectForm.effectTime.toString() === 0
      ) {
        return false;
      }
      return true;
    },
    effectForm: {
      get() {
        return this.value;
      },
      set(input) {
        this.$emit("input", input);
      },
    },
    getSelectedValue: {
      get() {
        return this.$currencyReverse(this.effectValue);
      },
      set(input) {
        this.effectValue = input.replace(/[^0-9.]/g, "");
      },
    },
  },
  mounted() {
    this.effectValue = this.effectForm.effectValue / 100 || 0;
  },
  methods: {
    async save() {
      await this.$validator.validateAll();
      this.effectForm.effectValue = this.effectValue * 100;
      if (!this.vErrors.any()) {
        this.$validator.reset();
        this.$emit("saveAll");
      }
    },
    formatTime(time) {
      if (time) {
        var numberPattern = /\d+/g;
        const test = time.toString().match(numberPattern).join("");
        return `${test.charAt(0)}${test.charAt(1)}h ${test.charAt(
          2
        )}${test.charAt(3)}min`;
      }
    },
  },

  data: () => ({
    process: null,
    effectValue: 0,
    form: new GQLForm({
      id: undefined,
      title: "",
      processId: null,
      effectTime: null,
      effectValue: null,
      issueActiveId: null,
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

.issues-template-form {
  padding: 0 20px;
  border-radius: 3px;
  background: #fff;
  width: 100%;
}
</style>
