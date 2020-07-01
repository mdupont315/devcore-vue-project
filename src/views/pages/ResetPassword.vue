<template>
  <external-layout class="pg-login">
    <div v-if="loaded" class="form-container animated zoomIn fast">
      <div class="login-form card bg-light shadow-lg rounded-0 border-0">
        <div class="card-header bg-dark rounded-0">
          <img src="@/assets/img/logo.svg" />
        </div>
        <div class="card-body text-center d-flex justify-content-center flex-column">
          <div class="text-center">
            <b-spinner variant="primary" label="Spinning"></b-spinner>
          </div>
          <p>{{ $t('Resetting your password...') }}</p>
        </div>
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
      code: "",
      remember: false
    })
  }),
  computed: {
    ...mapGetters({
      loaded: "app/loaded"
    })
  },
  async mounted() {
    if (this.$route.query) {
      this.form.fields = {
        username: this.$route.query["username"],
        code: this.$route.query["code"]
      };
      await this.send();
    } else {
      await this.$router.replace("/");
    }
  },
  methods: {
    async send() {
      try {
        await this.$store.dispatch("auth/resetPassword", this.form);
        await this.$router.replace("/");
      } catch (ex) {
        this.$router.replace({ name: "login" });
      } finally {
        this.$validator.reset();
      }
    }
  }
};
</script>