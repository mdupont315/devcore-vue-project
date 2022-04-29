<template>
  <external-layout class="pg-login">
    <div v-if="loaded" class="form-container animated zoomIn fast">
      <div class="login-form card bg-light shadow-lg rounded-0 border-0">
        <div class="card-header bg-dark rounded-0">
          <img src="@/assets/img/logo.svg" />
        </div>
        <div class="card-body">
          <h1 class="h3 text-shadow text-center">{{ $t("Login") }}</h1>
          <hr />
          <b-form class="floating-labels" @submit.prevent="onSubmit">
            <b-alert
              v-if="form.hasErrors"
              variant="danger"
              dismissible
              show
              class="text-sm"
            >
              <i class="mdi mdi-close-octagon"></i>
              {{ form.errors.message }}
            </b-alert>
            <div class="form-label-group required">
              <b-form-input
                id="username"
                v-model.trim="form.username"
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
                {{ $t("Username") }}
              </label>
              <b-form-invalid-feedback>{{
                $displayError("username", form)
              }}</b-form-invalid-feedback>
            </div>
            <div class="form-label-group required">
              <b-form-input
                id="password"
                v-model="form.password"
                v-validate="'required|min:6'"
                :state="$validateState('password', form)"
                :disabled="form.busy"
                :placeholder="$t('Password')"
                type="password"
                name="password"
                autocomplete="new-password"
              ></b-form-input>
              <label for="password">
                <i class="mdi mdi-lock-question"></i>
                {{ $t("Password") }}
              </label>
              <b-form-invalid-feedback>{{
                $displayError("password", form)
              }}</b-form-invalid-feedback>
            </div>
            <b-form-checkbox v-model="form.remember" name="remember">
              <span class="text-gray">{{ $t("Remember me") }}</span>
            </b-form-checkbox>
            <div class="mb-3">
              <hr />
              <loading-button
                type="submit"
                size="lg"
                :disabled="form.busy || vErrors.any()"
                :loading="form.busy"
                :block="true"
                variant="primary"
                >{{ $t("Login") }}</loading-button
              >
            </div>
          </b-form>
        </div>
      </div>
      <div class="text-center">
        <router-link :to="{ name: 'forgot-password' }" class="text-sm">{{
          $t("Forgot password?")
        }}</router-link>
      </div>
      <div class="text-center">
        <a
          class="link title text-sm"
          target="_blank"
          href="/privacy/privacypolicy.pdf"
        >
          {{ $t("Privacy Policy") }}</a
        >
      </div>
      <div class="text-center">
        <a
          class="link title text-sm"
          target="_blank"
          href="/privacy/eula.pdf"
          >{{ $t("EULA") }}</a
        >
      </div>
    </div>
  </external-layout>
</template>
<script>
import { mapGetters } from "vuex";
import GQLForm from "@/lib/gqlform";
import { blockUi, unblockUi } from "@/lib/utils";
import { roleNames } from "@/lib/mode-enums.js";

export default {
  data: () => ({
    // Create a new form instance
    form: new GQLForm({
      username: "",
      password: "",
      remember: false,
    }),
  }),
  computed: {
    ...mapGetters({
      loaded: "app/loaded",
      user: "auth/user",
      session: "auth/access_token",
    }),
  },
  methods: {
    async onSubmit() {
      try {
        await this.$store.dispatch("auth/login", this.form);

        blockUi();
        this.$store.dispatch("app/load");
        this.$store.dispatch("app/asyncLoad");
        const defaultRoute = "/";

        if (this.user && this.user.can("core/company/manage")) {
          await this.$router.replace("/manage/companies");
        }
        if (this.user && this.user.roles[0].name === "User") {
          window.location.replace(process.env.VUE_APP_MOBILE_URL);
        }

        await this.$router.replace(
          this.$store.getters["app/intented_route"] || defaultRoute
        );
      } catch (ex) {
        if (ex.code && ex.code === "MUST_VERIFY_EMAIL") {
          await this.$router.push({
            name: "send-email-verification",
            query: { email: this.form.username },
          });
        }
      } finally {
        unblockUi();
      }
    },
  },
};
</script>
