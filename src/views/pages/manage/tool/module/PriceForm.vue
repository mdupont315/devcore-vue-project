<template>
  <b-form class="hide-labels" @submit.prevent="save" @keyup="$validator.validateAll()">
    <b-row>
      <b-col class="col-12">
        <div class="form-label-group select required">
          <v-select
            v-model="form.priceModel"
            v-validate="'required'"
            v-autofocus
            label="name"
            data-vv-name="priceModel"
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
      <b-col v-if="form.priceModel!=='PROJECT'" class="col-12">
        <div class="form-label-group required">
          <b-form-input
            id="name"
            v-model="form.name"
            v-validate="'required|min:4'"
            :disabled="form.busy"
            :placeholder="$t('Price name')"
            type="text"
            name="name"
            :state="$validateState('name', form)"
          ></b-form-input>
          <label for="name">{{ $t('Name') }}</label>
          <b-form-invalid-feedback>{{ $displayError('name', form) }}</b-form-invalid-feedback>
        </div>
      </b-col>
      <b-col v-if="form.priceModel==='PROJECT'" class="col-12">
        <div class="form-label-group select required">
          <v-select
            v-model="form.parentId"
            v-validate="'required'"
            label="name"
            data-vv-name="project"
            :placeholder="$t('Project')"
            :reduce="project => project.id"
            :options="projects"
            :class="{'is-invalid':$validateState('project', form)===false, 'is-valid':$validateState('project', form)===true}"
          >
            <template v-slot:selected-option="option">{{ option.name }}</template>
            <template v-slot:option="option">{{ option.name }}</template>
          </v-select>
          <label for="project">{{ $t('Project') }}</label>
          <b-form-invalid-feedback>{{ $displayError('project', form) }}</b-form-invalid-feedback>
        </div>
      </b-col>
      <b-col v-if="form.priceModel==='LICENSE'" class="col-12">
        <div class="form-label-group required">
          <b-form-datepicker
            id="expiration"
            v-model="form.expiration"
            v-validate="'required'"
            name="expiration"
            :disabled="form.busy"
            menu-class="w-100"
            :date-format-options="{
              'year': 'numeric', 'month': 'numeric', 'day': 'numeric', 'weekday': undefined
            }"
            reset-button
            :placeholder="$t('Expiration')"
            calendar-width="100%"
            @input="dateChanged"
          ></b-form-datepicker>
          <label
            for="expiration"
          >{{ $t('Yearly Costs') + ((currentUser && currentUser.company)?' (' + currentUser.company.currencyCode + ')':'')}}</label>
          <b-form-invalid-feedback>{{ $displayError('expiration', form) }}</b-form-invalid-feedback>
        </div>
      </b-col>
      <b-col class="col-12">
        <div class="form-label-group required">
          <b-form-input
            id="price"
            v-model.number="price"
            step="1"
            min="0"
            v-validate="'required|numeric|min:0'"
            :disabled="form.busy"
            :placeholder="$t('Yearly Costs')"
            type="number"
            name="price"
            :state="$validateState('price', form)"
            @change="changePrice"
          ></b-form-input>
          <label
            for="price"
          >{{ $t('Yearly Costs') + ((currentUser && currentUser.company)?' (' + currentUser.company.currencyCode + ')':'')}}</label>
          <b-form-invalid-feedback>{{ $displayError('price', form) }}</b-form-invalid-feedback>
        </div>
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
        >{{ $t('Save changes')}} </loading-button>
        <div v-if="mode==='edit' && $can('tool/toolModule/delete', input)" class="mt-3 text-center">
          <hr />
          <b-button variant="outline-danger" type="button" block @click.prevent="deleteItem">
            <i class="mdi mdi-trash-can"></i>
            {{ $t('Delete') }}
          </b-button>
        </div>
      </b-col>
    </b-row>
  </b-form>
</template>
<script>
import { /* mapState, */ mapGetters } from "vuex";
import GQLForm from "@/lib/gqlform";

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
    price: null,
    form: new GQLForm({
      // id: null,
      name: null,
      companyToolId: null,
      parentType: "PROJECT",
      parentId: null,
      price: null,
      priceModel: null,
      expiration: null
    })
  }),
  computed: {
    ...mapGetters({
      currentUser: "auth/user",
      priceModels: "priceModel/all",
      projects: "project/all"
    })
  },
  async mounted() {
    this.input = this.value;
    await this.$store.dispatch("project/findAll");
    await this.initForm();
  },
  methods: {
    async initForm() {
      Object.keys(this.input || {})
        .filter(key => key in this.form)
        .forEach(key => (this.form[key] = this.input[key]));
      this.form.companyToolId = this.companyTool.id;
      this.price = this.form.price / 100;
    },
    changePrice(value) {
      this.form.price = value * 100;
    },
    async save() {
      try {
        await this.$validator.validateAll();
        if (!this.vErrors.any()) {
          await this.$validator.reset();

          if (this.mode === "edit") {
            this.input = await this.$store.dispatch(
              "companyToolPrice/update",
              this.form
            );
          } else {
            this.input = await this.$store.dispatch(
              "companyToolPrice/create",
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
                "companyToolPrice/delete",
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
    dateChanged(value) {
      this.form.expiration = value;
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
