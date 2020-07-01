<template>
  <default-layout>
    <div class="page bg-white">
      <div class="container">
        <h2 class="h1 border-bottom">{{ user.fullName }}</h2>
        <b-form @submit.prevent="save" @keyup="$validator.validateAll()" class="floating-labels">
          <div class="text-center">
            <image-upload
              v-model="form.file"
              :uploading="form.busy"
              class="rounded"
              @remove="()=>form.deleteAvatar=true"
              :currentImage="user.getAvatarUrl('200x200')"
              ref="uploader"
            />
            <b-form-invalid-feedback>{{ $displayError('avatar', form) }}</b-form-invalid-feedback>
          </div>
          <hr />
          <b-row>
            <b-col class="col-12 col-lg-6">
              <div class="form-label-group required">
                <b-form-input
                  id="firstName"
                  :disabled="form.busy"
                  v-model="form.firstName"
                  :placeholder="$t('First name')"
                  type="text"
                  name="firstName"
                  :state="$validateState('firstName', form)"
                  v-validate="'required|min:4'"
                ></b-form-input>
                <label for="firstName">
                  <i class="mdi mdi-account"></i>
                  {{ $t('First name') }}
                </label>
                <b-form-invalid-feedback>{{ $displayError('firstName', form) }}</b-form-invalid-feedback>
              </div>
            </b-col>
            <b-col class="col-12 col-lg-6">
              <div class="form-label-group required">
                <b-form-input
                  id="lastName"
                  :disabled="form.busy"
                  v-model="form.lastName"
                  :placeholder="$t('Last name')"
                  type="text"
                  name="lastName"
                  :state="$validateState('lastName', form)"
                  v-validate="'required|min:4'"
                ></b-form-input>
                <label for="lastName">
                  <i class="mdi mdi-account"></i>
                  {{ $t('Last name') }}
                </label>
                <b-form-invalid-feedback>{{ $displayError('lastName', form) }}</b-form-invalid-feedback>
              </div>
            </b-col>
          </b-row>
          <b-row>
            <b-col class="col-12 col-lg-6">
              <div class="form-label-group required">
                <b-form-input
                  id="email"
                  :disabled="form.busy"
                  v-model="form.email"
                  :placeholder="$t('Email')"
                  :state="$validateState('email', form)"
                  type="email"
                  name="email"
                  v-validate="'required|email'"
                ></b-form-input>
                <label for="email">
                  <i class="mdi mdi-email"></i>
                  {{ $t('Email') }}
                </label>
                <b-form-invalid-feedback>{{ $displayError('email', form) }}</b-form-invalid-feedback>
              </div>
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <b-card class="p-0 border" style="overflow:hidden" no-body>
                <slot>
                  <b-card-header>
                    <div>
                      <b-form-checkbox
                        id="changePassword"
                        v-model="form.changePassword"
                        name="changePassword"
                        :value="true"
                        :unchecked-value="false"
                      >{{ $t('Change my password') }}</b-form-checkbox>
                    </div>
                  </b-card-header>
                  <b-collapse id="changePasswordCollapse" :visible="form.changePassword">
                    <b-card-body>
                      <b-row>
                        <b-col class="col-12 col-lg-6">
                          <div class="form-label-group required">
                            <b-form-input
                              class="shadow-sm"
                              id="password"
                              :state="$validateState('password')"
                              :disabled="form.busy"
                              v-model="form.password"
                              :placeholder="$t('Password')"
                              type="password"
                              name="password"
                              ref="password"
                              autocomplete="new-password"
                              v-validate="{ required: this.form.changePassword, min:4 }"
                            ></b-form-input>
                            <label for="password">
                              <i class="mdi mdi-lock-question"></i>
                              {{ $t('Password') }}
                            </label>
                            <b-form-invalid-feedback>{{ $displayError('password', form) }}</b-form-invalid-feedback>
                          </div>
                        </b-col>
                        <b-col class="col-12 col-lg-6">
                          <div class="form-label-group required">
                            <b-form-input
                              class="shadow-sm"
                              id="passwordConfirmation"
                              :state="$validateState('passwordConfirmation')  && !form.hasError('passwordConfirmation')"
                              :disabled="form.busy"
                              v-model="form.passwordConfirmation"
                              :placeholder="$t('Password confirm')"
                              type="password"
                              name="passwordConfirmation"
                              autocomplete="new-passwordConfirmation"
                              v-validate="{ required: this.form.changePassword, min:4, confirmed:'password' }"
                            ></b-form-input>
                            <label for="passwordConfirmation">
                              <i class="mdi mdi-lock-question"></i>
                              {{ $t('Password confirm') }}
                            </label>
                            <b-form-invalid-feedback>{{ $displayError('passwordConfirmation', form) }}</b-form-invalid-feedback>
                          </div>
                        </b-col>
                      </b-row>
                    </b-card-body>
                  </b-collapse>
                </slot>
              </b-card>
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
      firstName: null,
      lastName: null,
      email: null,
      changePassword: false,
      password: null,
      passwordConfirmation: null,
      deleteAvatar: null
    })
  }),
  computed: {
    ...mapGetters({
      user: "auth/user"
    })
  },
  mounted() {
    this.initForm();
  },
  methods: {
    async initForm() {
      Object.keys(this.user)
        .filter(key => key in this.form)
        .forEach(key => (this.form[key] = this.user[key]));
      //set the image
      this.$refs.uploader.image = this.user.getAvatarUrl("200x200");
    },
    async save() {
      await this.$validator.validateAll();
      if (!this.vErrors.any()) {
        await this.$validator.reset();
        await this.$store.dispatch("auth/updateProfile", this.form);
        this.initForm();
      }

      /*try {
        this.form.errors = null;
        await this.$store.dispatch("auth/login", this.form);
        console.log(this.$store.getters["app/intented_route"]);
        await this.$router.replace(
          this.$store.getters["app/intented_route"] || "/"
        );
      } catch (ex) {
        //console.log(processGraphQLErrors(ex));
      } finally {
        //this.$validator.reset();
      }*/
    }
  }
};
</script>