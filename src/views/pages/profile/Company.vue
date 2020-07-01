<template>
  <default-layout>
    <div class="page bg-white">
      <div class="container">
        <h2 class="h1 border-bottom">{{ company.name }}</h2>
        <b-form @submit.prevent="save" @keyup="$validator.validateAll()" class="floating-labels">
          <div class="text-center">
            <image-upload
              v-model="form.file"
              :uploading="form.busy"
              class="rounded"
              @remove="()=>form.deleteLogo=true"
              :currentImage="company.getLogoUrl('200x200')"
              ref="uploader"
            />
          </div>
          <hr />
          <b-row>
            <b-col>
              <div class="form-label-group required">
                <b-form-input
                  id="name"
                  :disabled="form.busy"
                  v-model="form.name"
                  :placeholder="$t('Name')"
                  type="text"
                  name="name"
                  :state="$validateState('name',form)"
                  v-validate="'required|min:4'"
                ></b-form-input>
                <label for="name">
                  <i class="mdi mdi-domain"></i>
                  {{ $t('Name') }}
                </label>
                <b-form-invalid-feedback>{{ $displayError('name', form) }}</b-form-invalid-feedback>
              </div>
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <div class="form-label-group select required">
                <b-form-select
                  id="currencyCode"
                  :disabled="form.busy"
                  v-model="form.currencyCode"
                  :placeholder="$t('Currency')"
                  type="text"
                  name="currencyCode"
                  :state="$validateState('currencyCode', form)"
                  v-validate="'required'"
                >
                  <option :value="null">--- {{ $t('None')}} ---</option>
                  <option
                    v-for="(item, index) in currencies"
                    :key="index"
                    :value="item.code"
                  >{{ item.name }} | {{ item.symbol }} ({{ item.code }})</option>
                </b-form-select>
                <label for="currencyCode">
                  <i class="mdi mdi-home-currency-usd"></i>
                  {{ $t('Currency') }}
                </label>
                <b-form-invalid-feedback>{{ $displayError('currencyCode', form) }}</b-form-invalid-feedback>
              </div>
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <hr />
              <loading-button
                type="submit"
                size="lg"
                class="shadow"
                :disabled="form.busy || vErrors.any()"
                :loading="form.busy"
                :block="true"
                variant="primary"
              >{{ $t('Save changes') }}</loading-button>
            </b-col>
          </b-row>
        </b-form>
      </div>
    </div>
  </default-layout>
</template>
<script>
import { /*mapState,*/ mapGetters } from "vuex";
import GQLForm from "@/lib/gqlform";

export default {
  data: () => ({
    form: new GQLForm({
      file: null,
      currencyCode: null,
      name: null,
      deleteLogo: false
    })
  }),
  computed: {
    ...mapGetters({
      company: "auth/company",
      currencies: "currency/all"
    })
  },
  async mounted() {
    await this.$store.dispatch("currency/findAll");
    this.initForm();
  },
  methods: {
    async initForm() {
      Object.keys(this.company)
        .filter(key => key in this.form)
        .forEach(key => (this.form[key] = this.company[key]));
      //set the image
      this.$refs.uploader.image = this.company.getLogoUrl("200x200");
    },
    async save() {
      await this.$validator.validateAll();
      if (!this.vErrors.any()) {
        await this.$validator.reset();
        await this.$store.dispatch("auth/updateCompany", this.form);
        this.initForm();
      }
    }
  }
};
</script>