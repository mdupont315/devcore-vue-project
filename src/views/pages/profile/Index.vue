<template>
  <div class="spcustom-container">
    <div class="page bg-white">
      <div class="container">
        <h2 class="h1 border-bottom">{{ user.fullName }}</h2>
        <b-form
          class="floating-labels"
          @submit.prevent="save"
          @keyup="$validator.validateAll()"
        >
          <div class="text-center">
            <image-upload
              ref="uploader"
              v-model="form.file"
              :uploading="form.busy"
              class="rounded"
              :current-image="user.getAvatarUrl('200x200')"
              @remove="() => (form.deleteAvatar = true)"
            />
            <b-form-invalid-feedback>{{
              $displayError("avatar", form)
            }}</b-form-invalid-feedback>
          </div>
          <hr />
          <b-row>
            <b-col class="col-12 col-lg-6">
              <div class="form-label-group required">
                <b-form-input
                  id="firstName"
                  v-model="form.firstName"
                  v-validate="'required|min:4'"
                  :disabled="form.busy"
                  :placeholder="$t('First name')"
                  type="text"
                  name="firstName"
                  :state="$validateState('firstName', form)"
                ></b-form-input>
                <label for="firstName">
                  <i class="mdi mdi-account"></i>
                  {{ $t("First name") }}
                </label>
                <b-form-invalid-feedback>{{
                  $displayError("firstName", form)
                }}</b-form-invalid-feedback>
              </div>
            </b-col>
            <b-col class="col-12 col-lg-6">
              <div class="form-label-group required">
                <b-form-input
                  id="lastName"
                  v-model="form.lastName"
                  v-validate="'required|min:4'"
                  :disabled="form.busy"
                  :placeholder="$t('Last name')"
                  type="text"
                  name="lastName"
                  :state="$validateState('lastName', form)"
                ></b-form-input>
                <label for="lastName">
                  <i class="mdi mdi-account"></i>
                  {{ $t("Last name") }}
                </label>
                <b-form-invalid-feedback>{{
                  $displayError("lastName", form)
                }}</b-form-invalid-feedback>
              </div>
            </b-col>
          </b-row>
          <b-row>
            <b-col class="col-12 col-lg-6">
              <div class="form-label-group required">
                <b-form-input
                  id="email"
                  v-model="form.email"
                  v-validate="'required|email'"
                  :disabled="form.busy"
                  :placeholder="$t('Email')"
                  :state="$validateState('email', form)"
                  type="email"
                  name="email"
                ></b-form-input>
                <label for="email">
                  <i class="mdi mdi-email"></i>
                  {{ $t("Email") }}
                </label>
                <b-form-invalid-feedback>{{
                  $displayError("email", form)
                }}</b-form-invalid-feedback>
              </div>
            </b-col>
            <b-col class="col-12 col-lg-6">
              <b-card class="p-0 border" style="overflow: hidden" no-body>
                <b-card-header>
                  <div>
                    <b-form-checkbox
                      id="manageNotifications"
                      v-model="form.notifications"
                      name="manageNotifications"
                      checked
                      :value="true"
                      :unchecked-value="false"
                      >{{
                        form.notifications
                          ? $t("Notifications allowed")
                          : $t("Notifications disallowed")
                      }}</b-form-checkbox
                    >
                  </div>
                </b-card-header>
              </b-card>
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <b-card
                :key="intent"
                :class="user.mustChangePassword ? 'shake' : ''"
                class="p-0 border"
                style="overflow: hidden"
                no-body
              >
                <slot>
                  <b-card-header>
                    <div>
                      <b-form-checkbox
                        id="changePassword"
                        v-model="form.changePassword"
                        name="changePassword"
                        :value="true"
                        :unchecked-value="false"
                        >{{ $t("Change my password") }}</b-form-checkbox
                      >
                    </div>
                  </b-card-header>
                  <b-collapse
                    id="changePasswordCollapse"
                    :visible="form.changePassword || user.mustChangePassword"
                    class="shake"
                  >
                    <b-card-body>
                      <b-row>
                        <b-col class="col-12 col-lg-6">
                          <div class="form-label-group required">
                            <b-form-input
                              id="password"
                              ref="password"
                              v-model="form.password"
                              v-validate="{
                                required: this.form.changePassword,
                                min: 4,
                              }"
                              class="shadow-sm"
                              :state="$validateState('password')"
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
                        </b-col>
                        <b-col class="col-12 col-lg-6">
                          <div class="form-label-group required">
                            <b-form-input
                              id="passwordConfirmation"
                              v-model="form.passwordConfirmation"
                              v-validate="{
                                required: this.form.changePassword,
                                min: 4,
                                confirmed: 'password',
                              }"
                              class="shadow-sm"
                              :state="
                                $validateState('passwordConfirmation') &&
                                !form.hasError('passwordConfirmation')
                              "
                              :disabled="form.busy"
                              :placeholder="$t('Password confirm')"
                              type="password"
                              name="passwordConfirmation"
                              autocomplete="new-passwordConfirmation"
                            ></b-form-input>
                            <label for="passwordConfirmation">
                              <i class="mdi mdi-lock-question"></i>
                              {{ $t("Password confirm") }}
                            </label>
                            <b-form-invalid-feedback>{{
                              $displayError("passwordConfirmation", form)
                            }}</b-form-invalid-feedback>
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
                >{{ $t("Save changes") }}</loading-button
              >
            </b-col>
          </b-row>
        </b-form>
      </div>
    </div>
  </div>
</template>
<script>
import { /* mapState, */ mapGetters } from "vuex";
import GQLForm from "@/lib/gqlform";
import { blockUi, unblockUi } from "@/lib/utils";

export default {
  data: () => ({
    route: null,
    intent: Math.random(),
    form: new GQLForm({
      file: null,
      firstName: null,
      lastName: null,
      email: null,
      changePassword: false,
      password: null,
      passwordConfirmation: null,
      deleteAvatar: null,
      notifications: true,
    }),
  }),
  computed: {
    ...mapGetters({
      user: "auth/user",
    }),
  },
  watch: {
    $route: {
      handler(route) {
				console.log(route);
        if (route.query.i) {
          this.intent = Math.random();
        }
      },
    },
  },
  mounted() {
    this.initForm();
    console.log(this.$route.query.i);
    console.log(this.user);
  },
  methods: {
    async initForm() {
      Object.keys(this.user)
        .filter((key) => key in this.form)
        .forEach((key) => (this.form[key] = this.user[key]));
      // set the image
      this.$refs.uploader.image = this.user.getAvatarUrl("200x200");
    },
    async save() {
      await this.$validator.validateAll();
      if (!this.vErrors.any()) {
        await this.$validator.reset();
        await this.$store.dispatch("auth/updateProfile", this.form);
        this.initForm();
      }
    },
  },
};
</script>

<style scoped>
.shake {
  animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  transform: translate3d(0, 0, 0);
}
@keyframes shake {
  10%,
  90% {
    opacity: 0.5;
    background: #4494d1;
    transform: translate3d(-1px, 0, 0);
  }
  20%,
  80% {
    opacity: 0.4;
    background: #4494d1;
    transform: translate3d(2px, 0, 0);
  }
  30%,
  50%,
  70% {
    opacity: 0.3;
    background: #4494d1;
    transform: translate3d(-4px, 0, 0);
  }
  40%,
  60% {
    opacity: 0.2;
    background: #4494d1;
    transform: translate3d(4px, 0, 0);
  }
}
</style>
