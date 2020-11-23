<template>
  <div v-if="user" class="author-time">
    <img :src="user.getAvatarUrl('50x50')" height="30" class="rounded-circle border" />
    <span class="right">
      <span class="name">{{ user.fullName }}</span>
      <time-ago v-if="time" class="time" :time="time" />
    </span>
  </div>
</template>
<script>
export default {
  name: "AuthorTime",
  props: {
    user: {
      required: true
    },
    time: {
      required: false
    }
  }
};
</script>