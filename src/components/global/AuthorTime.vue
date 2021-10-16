<template>
  <div v-if="user" class="author-time">
    <img
      v-if="!anonymous"
      :src="getAvatarUrl('50x50')"
      height="30"
      class="rounded-circle border"
    />
    <img v-else :src="getAnonAvatarUrl()" class="rounded-circle border" />
    <span class="right">
      <span class="name" v-if="!anonymous"
        >{{ user.fullName }} {{ user.lang }}</span
      >
      <span class="name" v-else>{{ $t("Anonymous") }}</span>
      <time-ago v-if="time" class="time" :time="time" />
    </span>
  </div>
</template>
<script>
import { imageResolver } from "@/lib/utils";
export default {
  name: "AuthorTime",
  props: {
    user: {
      required: true,
    },
    anonymous: {
      required: false,
      default: () => false,
    },
    time: {
      required: false,
    },
  },
  methods: {
    getAnonAvatarUrl(lang = "en") {
      if (lang === "en") {
        return require("@/assets/anonUserEn.png");
      } else {
        return require("@/assets/anonUserFi.png");
      }
    },
    getAvatarUrl(size = "0x0") {
      if (this.user.avatarUrl) {
        return imageResolver(this.user.avatarUrl, size);
      }
      return null;
    },
  },
  mounted() {
    console.log(this.user);
  },
};
</script>

