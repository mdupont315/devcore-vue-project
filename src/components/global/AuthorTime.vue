<template>
  <div v-if="user" class="author-time">
    <img
      v-if="!anonymous"
      :src="user.getAvatarUrl('50x50')"
      height="30"
      class="rounded-circle border"
    />
    <img
      v-else
      style="filter: invert(50%) hue-rotate(270deg)"
      :src="user.getAnonAvatarUrl()"
      class="rounded-circle border"
    />
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
export default {
  name: "AuthorTime",
  props: {
    user: {
      required: true,
    },
    anonymous: {
      required: false,
    },
    time: {
      required: false,
    },
  },
};
</script>

