<template>
  <b-navbar
    toggleable="lg"
    type="light"
    variant="light"
    fixed="top"
    class="top-nav shadow-sm"
    :style="{'z-index':zIndex}"
  >
    <b-navbar-brand :to="{name:'home'}" class="logo">
      <img src="@/assets/img/logo.svg" />
    </b-navbar-brand>

    <!-- <b-button
      class="toggle-menu-btn hamburger hamburger--slider d-block d-md-none"
      :class="{'is-active':navActive}"
      @click="toggleNav"
      variant="light"
    >
      <span class="hamburger-box">
        <span class="hamburger-inner"></span>
      </span>
    </b-button> -->
<!-- 
    <b-button class="d-none d-md-inline-block" @click="toggleNav" variant="light">
      <i class="mdi-menu mdi"></i>
    </b-button> -->

    <b-navbar-nav class="d-none d-md-flex">
      <h1 class="h4 ml-3 mb-0 text-uppercase page-title">{{ page.title }}</h1>
      <component v-if="page.titleButton" :is="page.titleButton"></component>
       <portal-target name="topbar-left"></portal-target>
    </b-navbar-nav>

    <b-navbar-nav class="d-none d-md-flex flex-grow-1 align-items-center flex-column">
      <component v-if="page.topCentral" :is="page.topCentral"></component>
      <portal-target name="topbar-central"></portal-target>
    </b-navbar-nav>

    <!-- Right aligned nav items -->
    <b-navbar-nav class="ml-auto">
      <b-nav-item>
        <component v-if="page.topRight" :is="page.topRight"></component>
        <portal-target name="topbar-right"></portal-target>
      </b-nav-item>
      <div class="profile">
        <inner-overlay @click="closeDropDown" v-if="zIndex>0"></inner-overlay>
        <b-nav-item-dropdown
          right
          ref="profileDropDown"
          @hidden="closeDropDown"
          @shown="showDropDown"
        >
          <template v-slot:button-content>
            <img
              class="rounded-circle avatar shadow-lg d-none d-md-inline-block"
              :src="user.getAvatarUrl('50x50')"
              height="30px"
              style="margin-top:5px"
            />
            <i class="mdi mdi-account d-inline-block d-md-none"></i>
          </template>
          <slot class="animated flip">
            <div class="button-profile-content" style="z-index:9999;position:relative">
              <div class="top">
                <button class="btn-close btn btn-light btn-outline-default" @click="closeDropDown">
                  <i class="mdi mdi-close"></i>
                </button>
                <div class>
                  <img class="rounded-circle avatar shadow-lg" :src="user.getAvatarUrl('100x100')" />
                </div>
                <div class>
                  <small>
                    <i class="mdi mdi-eye-outline"></i>
                    {{ user.roles[0].name}} | {{ user.companyRole.name }}
                  </small>
                </div>
                <div class="username font-weight-bold">{{ user.fullName }}</div>
              </div>
              <b-dropdown-item :to="{name:'my-profile'}">
                <i class="mdi mdi-face-profile"></i>
                {{ $t('My Profile')}}
              </b-dropdown-item>
              <b-dropdown-item
                :to="{name:'my-company'}"
                v-if="$can('auth/user/edit_my_company')"
              >
                <i class="mdi mdi-domain"></i>
                {{ $t('My Company')}}
              </b-dropdown-item>
              <b-dropdown-divider></b-dropdown-divider>
              <b-dropdown-item @click="logout">
                <i class="mdi-logout mdi"></i>
                {{ $t('Logout') }}
              </b-dropdown-item>
            </div>
          </slot>
        </b-nav-item-dropdown>
      </div>
    </b-navbar-nav>
  </b-navbar>
</template>
<script>
import { /*mapState,*/ mapGetters } from "vuex";
export default {
  name: "top-nav",
  data: () => ({
    dropDown:false,
  }),
  computed: {
    ...mapGetters({
      user: "auth/user",
      page: "app/page_meta",
      navActive: "app/show_navbar",
      onTop: "app/show_top_nav_on_top"
    }),
    zIndex: {
      get: function() {
        return this.onTop || this.dropDown ? 9999 : 0;
      },
    }
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
    },
    async closeDropDown() {
      this.$refs.profileDropDown.hide(true);
      this.dropDown = false;
    },
    async showDropDown() {
      this.dropDown = true;
    }
  }
};
</script>