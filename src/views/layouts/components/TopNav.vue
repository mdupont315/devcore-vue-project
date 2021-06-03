<template>
  <b-navbar
    toggleable="lg"
    type="light"
    variant="light"
    fixed="top"
    class="top-nav shadow-sm"
    :style="{'z-index':zIndex}"
  >
    <b-navbar-brand :to="{name:'home'}" class="logo minw-250px">
      <img src="@/assets/img/logo.svg" />
    </b-navbar-brand>

    <b-navbar-nav class="d-none d-md-flex minw-15">

      <h1 class="h4 ml-3 mb-0 text-uppercase page-title">{{ $t(page.title) }}</h1>
      <component :is="page.titleButton" v-if="page.titleButton"></component>
       <portal-target name="topbar-left"></portal-target>
    </b-navbar-nav>

    <b-navbar-nav class="d-none d-md-flex flex-grow-1 align-items-end flex-column maxw-30">
      <component :is="page.topCentral" v-if="page.topCentral"></component>
      <portal-target name="topbar-central"></portal-target>
      <h5 v-if="$can('core/company/manage')">{{ $t('Super Admininstrator Panel') }}</h5>
    </b-navbar-nav>

    <!-- Right aligned nav items -->
    <b-navbar-nav class="ml-auto">

      <b-nav-item>
        <component :is="page.topRight" v-if="page.topRight"></component>
        <portal-target name="topbar-right"></portal-target>
      </b-nav-item>
      <div class="nav__end">
          <locales-switcher :input="user"/>
        </div>
      <div class="profile">

        <inner-overlay v-if="zIndex>0" @click="closeDropDown"></inner-overlay>
        <b-nav-item-dropdown
          ref="profileDropDown"
          right

          @hidden="closeDropDown"
          @shown="showDropDown"
        >
          <template v-slot:button-content>
            <img
              class="rounded-circle avatar shadow-lg d-none d-md-inline-block spcustom-avatarContainer"
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
                    {{ user.roles[0].name}} | <span v-if="user.companyRole">{{ user.companyRole.name }}</span>
                  </small>
                </div>
                <div class="username font-weight-bold">{{ user.fullName }}</div>
              </div>
              <b-dropdown-item :to="{name:'my-profile'}">
                <i class="mdi mdi-face-profile"></i>
                {{ $t('My Profile')}}
              </b-dropdown-item>
              <b-dropdown-item
                v-if="$can('auth/user/edit_my_company') == true && $can('core/company/manage') == false"
                :to="{name:'my-company'}"

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
import { /* mapState, */ mapGetters } from "vuex";

export default {
  name: "TopNav",
  data: () => ({
    dropDown: false,
  }),
  computed: {
    ...mapGetters({
      user: "auth/user",
      page: "app/page_meta",
      navActive: "app/show_navbar",
      onTop: "app/show_top_nav_on_top"
    }),
    zIndex: {
      get() {
        return this.onTop || this.dropDown ? 9999 : 0;
      },
    }
  },

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
<style scoped>

.nav-item{
	align-self: center;
}

.profile{
	align-self:center;
}
.nav__start,
.nav__end {
  display: flex;
  align-items: center;
}
.nav img {
  margin-right: 1rem;
}
.nav a {
  margin-right: 1.5rem;
  font-weight: bold;
  color: #fff;
  text-decoration: none;
}

.maxw-30{
	max-width:30%;
}
.minw-15{
	min-width:15%;
}

.minw-250px{
	min-width:250px;
}
.ml-auto{
	height: 100%;
}

.top-nav{
	height: 100%;
}
</style>
