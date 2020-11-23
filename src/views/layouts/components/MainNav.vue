<template>
  <div>
    <b-modal v-model="showInviteModal" :title="$t('Invite to Devcore')" header-bg-variant="primary" header-text-variant="white" :hide-footer="true">
      <user-form @done="showInviteModal=false"></user-form>
    </b-modal>
    <div class="nav-overlay" @click="toggleNav"></div>
    <nav class="main-nav">
      <!--<div class="header text-center" v-if="user && user.company">
        <router-link
          :to="{name:'my-company'}"
          class="edit text-white"
          v-if="$can('auth/profile/edit_my_company')"
        >
          <i class="mdi-pencil mdi"></i>
        </router-link>
        <img :src="user.company.getLogoUrl('70x70')" class="rounded-circle avatar primary logo" />
        <h1 class="company-name">{{ user.company.name }} ({{user.company.currencyCode}})</h1>
      </div>-->
      <div class="menu-wrapper">
        <navigation :items="nav" />
      </div>
      <div v-if="$can('auth/user/create')== true && $can('core/company/manage') == false" class="text-center p-3">
        <small
          class="px-3 text-center d-block mb-3"
        >{{ $t('Invite your team and start collaborating now!')}}</small>
        <b-button
          size="lg"
          block
          variant="outline-primary"
          @click="showInviteModal = !showInviteModal"
        >{{ $t('Invite to Devcore') }}</b-button>
      </div>
    </nav>
  </div>
</template>
<script>
import { /* mapState, */ mapGetters } from "vuex";
import nav from "@/router/_nav";
import Navigation from "./menu/Index";
import UserForm from "../../pages/manage/user/Form";

export default {
  name: "TopNav",
  components: {
    "user-form": UserForm,
    navigation: Navigation
  },
  data() {
    return {
      nav: nav(this.$store.getters["auth/user"]),
      showInviteModal: false
    };
  },
  computed: {
    ...mapGetters({
      user: "auth/user"
    })
  },
  mounted() {},
  methods: {
    async logout() {
      try {
        await this.$store.dispatch("auth/logout");
      } finally {
        this.$router.replace("/login");
      }
    },
    async toggleNav() {
      await this.$store.dispatch("app/toggleNav");
    }
  }
};
</script>