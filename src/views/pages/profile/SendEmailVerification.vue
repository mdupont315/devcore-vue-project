<template>
  <external-layout class="pg-login">
    <div v-if="loaded" class="form-container animated zoomIn fast">
      <div class="login-form card bg-light shadow-lg rounded-0 border-0">
        <div class="card-header bg-dark rounded-0">
          <img src="@/assets/img/logo.svg" />
        </div>
        <div class="card-body">
          <h1 class="h3 text-shadow text-center">{{ $t('Account verification') }}</h1>
          <hr />
          <div v-if="!sent && !haveCode">
            <p>
              <small>{{ $t('Please provide your email address, we\'ll send you an email with instructions to verify your account.') }}</small>
            </p>
            <b-form class="floating-labels" @submit.prevent="onSubmit">
              <b-alert v-if="form.hasErrors" variant="danger" dismissible show class="text-sm">
                <i class="mdi mdi-close-octagon"></i>
                {{ form.errors.message }}
              </b-alert>
              <div class="form-label-group required">
                <b-form-input
                  id="username"
                  v-model="form.username"
                  v-validate="'required|email'"
                  type="text"
                  :disabled="form.busy"
                  :placeholder="$t('Username')"
                  :state="$validateState('username', form)"
                  autocomplete="new-username"
                  name="username"
                  autofocus
                ></b-form-input>
                <label for="username">
                  <i class="mdi mdi-account"></i>
                  {{ $t('Username') }}
                </label>
                <b-form-invalid-feedback>{{ $displayError('username', form) }}</b-form-invalid-feedback>
              </div>
              <div class="mb-3">
                <hr />
                <loading-button
                  type="submit"
                  size="lg"
                  :disabled="form.busy || vErrors.any()"
                  :loading="form.busy"
                  :block="true"
                  variant="primary"
                >{{ $t('Send verification instructions') }}</loading-button>
              </div>
            </b-form>
          </div>
          <div v-else>
            <p class="alert alert-success">
              <i class="mdi mdi-check"></i>
              {{ $t('Please check your email inbox, we just sent you an email with a PIN to validate your account.') }}
            </p>

            <div>
              <b-form class="floating-labels" @submit.prevent="verify">
                <b-alert v-if="form.hasErrors" variant="danger" dismissible show class="text-sm">
                  <i class="mdi mdi-close-octagon"></i>
                  {{ form.errors.message }}
                </b-alert>
                <div class="form-label-group required">
                  <b-form-input
                    id="code"
                    v-model="form.code"
                    v-validate="'required|length:6'"
                    type="text"
                    :disabled="form.busy"
                    :placeholder="$t('Received code')"
                    :state="$validateState('code', form)"
                    autocomplete="new-code"
                    name="code"
                    autofocus
                  ></b-form-input>
                  <label for="code">
                    <i class="mdi mdi-dialpad"></i>
                    {{ $t('Received code') }}
                  </label>
                  <b-form-invalid-feedback>{{ $displayError('code', form) }}</b-form-invalid-feedback>
                </div>
                <p v-if="showResend" class="text-center">
                  <small>
                    {{ $t("Didn't get the email?") }}
                    <a
                      href
                      @click.prevent="resend"
                    >{{ $t('Try Again') }}</a>
                  </small>
                </p>
                <div class="mb-3">
                  <hr />
                  <loading-button
                    type="submit"
                    size="lg"
                    :disabled="form.busy || vErrors.any()"
                    :loading="form.busy"
                    :block="true"
                    variant="primary"
                  >{{ $t('Verify my account') }}</loading-button>
                </div>
              </b-form>
            </div>
          </div>
        </div>
      </div>
      <div class="text-center">
        <router-link :to="{name:'login'}" class="text-sm">{{ $t('Already verified?') }}</router-link>
      </div>
    </div>
  </external-layout>
</template>
<script>
import { mapGetters } from "vuex";
import GQLForm from "@/lib/gqlform";

export default {
  data: () => ({
    // Create a new form instance
    form: new GQLForm({
      username: "",
      code: null
    }),
    sent: false,
    showResend: false,
    haveCode:false,
  }),
  computed: {
    ...mapGetters({
      loaded: "app/loaded"
    })
  },
  mounted() {
    this.form.fields.username = this.$route.query.email;
  },
  methods: {
    async onSubmit() {
      try {
        await this.$validator.validateAll();
        if (this.vErrors.any()) {
          return;
        }
        this.$validator.reset();
        this.form.fields.code = null;
        this.showResend = false;
        await this.$store.dispatch("auth/sendVerificationEmail", this.form);
        this.sent = true;
        setTimeout(() => {
          this.showResend = true;
        }, 30000);
      } catch (ex) {
        if (ex.code === 'USER_ALREADY_VERIFIED'){
          this.$router.push({ name:'login' });
        }
        // console.log(processGraphQLErrors(ex));
      } finally {
        // this.$validator.reset();
      }
    },
    async verify() {
      try {
        await this.$validator.validateAll();
        if (this.vErrors.any()) {
          return;
        }
        this.$validator.reset();
        await this.$store.dispatch("auth/verifyAccount", this.form);
        await this.$router.replace("/");
      } catch (ex) {
        if (ex.code === 'TOKEN_EXPIRED'){
          this.resend();
        }
        if (ex.code === 'USER_ALREADY_VERIFIED'){
          this.$router.push({ name:'login' });
        }
      } finally {
        // this.$validator.reset();
      }
    },
    resend() {
      this.$validator.reset();
      this.sent = false;
    }
  }
};
</script>