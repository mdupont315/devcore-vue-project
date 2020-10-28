<template>
  <b-form @submit.prevent="save" @keyup="$validator.validateAll()" class="hide-labels">
    <b-row>
      <b-col class="col-12">
        <div class="form-label-group required">
          <suggestions
            class="sm"
            :v-validate="'required'"
            v-model="form.name"
            :options="{debounce:250, inputClass:'form-control form-control-sm', autofocus:true, placeholder:$t('Module Name')}"
            :state="$validateState('toolModule', form)"
            :onInputChange="onToolModuleInputChange"
            :onItemSelected="onToolModuleSelected"
            :class="{'is-invalid':$validateState('toolModule', form)===false, 'is-valid':$validateState('toolModule', form)===true}"
          >
            <div slot="item" slot-scope="props" class="single-item">
              <span class="name">{{props.item.name}}</span>
            </div>
          </suggestions>
          <b-form-invalid-feedback>{{ $displayError('toolModule', form) }}</b-form-invalid-feedback>
        </div>
      </b-col>
      <!-- <b-col class="col-12">
        <div class="form-label-group select required">
          <v-select
            label="name"
            v-validate="'required'"
            data-vv-name="priceModel"
            v-model="form.priceModel"
            :placeholder="$t('Price model')"
            :reduce="priceModel => priceModel.id"
            :options="priceModels"
            :class="{'is-invalid':$validateState('priceModel', form)===false, 'is-valid':$validateState('priceModel', form)===true}"
          >
            <template v-slot:selected-option="option">{{ $t('priceModel.'+option.name) }}</template>
            <template v-slot:option="option">{{ $t('priceModel.'+option.name) }}</template>
          </v-select>
          <label for="priceModel">{{ $t('Price model') }}</label>
          <b-form-invalid-feedback>{{ $displayError('priceModel', form) }}</b-form-invalid-feedback>
        </div>
      </b-col>
      <b-col class="col-12">
        <div class="form-label-group required">
          <b-form-input
            id="yearlyCosts"
            step="1"
            min="0"
            :disabled="form.busy"
            v-model.number="form.yearlyCosts"
            :placeholder="$t('Yearly Costs')"
            type="number"
            name="yearlyCosts"
            :state="$validateState('yearlyCosts', form)"
            v-validate="'required|numeric|min:0'"
          ></b-form-input>
          <label
            for="yearlyCosts"
          >{{ $t('Yearly Costs') + ((currentUser && currentUser.company)?' (' + currentUser.company.currencyCode + ')':'')}}</label>
          <b-form-invalid-feedback>{{ $displayError('yearlyCosts', form) }}</b-form-invalid-feedback>
        </div>
      </b-col> -->
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
        <div v-if="mode==='edit' && $can('tool/toolModule/delete', input)" class="mt-3 text-center">
          <hr />
          <b-button variant="outline-danger" type="button" @click.prevent="deleteItem" block>
            <i class="mdi mdi-trash-can"></i>
            {{ $t('Delete') }}
          </b-button>
        </div>
      </b-col>
    </b-row>
  </b-form>
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
    },
    companyTool: {
      type: Object,
      required: true
    }
  },
  data: () => ({
    input: null,
    form: new GQLForm({
      id: null,
      name: null,
      companyToolId: null,
      toolId: null,
      // quantity: null,
      yearlyCosts: null,
      priceModel: null
    })
  }),
  computed: {
    ...mapGetters({
      currentUser: "auth/user",
      priceModels: "priceModel/all"
    })
  },
  async mounted() {
    this.input = this.value;
    await this.initForm();
  },
  methods: {
    async initForm() {
      Object.keys(this.input || {})
        .filter(key => key in this.form)
        .forEach(key => (this.form[key] = this.input[key]));
      this.form.companyToolId = this.companyTool.id;
    },
    async save() {
      try {
        await this.$validator.validateAll();
        if (!this.vErrors.any()) {
          await this.$validator.reset();
          if (this.mode === "edit") {
            this.input = await this.$store.dispatch(
              "companyTool/update",
              this.form
            );
          } else {
            this.input = await this.$store.dispatch(
              "companyTool/create",
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
    async deleteItem() {
      if (this.$can("core/tool/delete", this.input)) {
        await this.$swal({
          title: this.$t("Are you sure?"),
          text: this.$t("You won't be able to revert this!"),
          type: "warning",
          showCancelButton: true,
          confirmButtonText: this.$t("Yes, delete it!"),
          showLoaderOnConfirm: true,
          preConfirm: async () => {
            try {
              const result = await this.$store.dispatch(
                "companyTool/delete",
                new GQLForm(
                  {
                    id: this.input.id
                  },
                  null
                )
              );
              this.$emit("done");
              return result;
            } finally {
              this.$swal.close();
            }
          }
        });
      }
    },
    async onToolModuleSelected(item) {
      this.form.toolId = item.id;
      this.form.name = item.name;
    },
    async onToolModuleInputChange(query) {
      this.form.toolId = null;

      if (query.trim().length < 2) {
        return [];
      }

      const response = await this.$store.dispatch("tool/findAll", {
        where: {
          and: [
            { field: "tool_id", op: "eq", value: this.companyTool.toolId },
            { field: "name", op: "cn", value: query }
          ]
        }
      });

      return response;
    }
  }
};
</script>