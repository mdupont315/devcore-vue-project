<template>
  <li :class="{'active': active}" @click="toggle(item,$event)">
    <router-link v-if="item.url" class="title" :to="item.url">
      <i v-if="item.icon" class="mdi icon" :class="item.icon"></i>
      {{ $t(item.title) }}
    </router-link>
    <span v-else class="title">
      <i v-if="item.icon" class="mdi icon" :class="item.icon"></i>
      {{ $t(item.title) }}
    </span>
    <ul v-if="item.children" class="nav sub-menu">
      <li
        v-for="(subitem,subindex) in item.children"
        :key="subindex"
        class="item link"
        :class="{'active':$route.matched.some(({ name }) => name === subitem.name)}"
        @click.stop="subItemClick($event, item)"
      >
        <router-link :to="subitem.url" class="title">
          <!--<i class="mdi" :class="subitem.icon" v-if="subitem.icon"></i>-->
          {{ $t(subitem.title) }}
        </router-link>
      </li>
    </ul>
  </li>
</template>
<script>
import { /* mapState, */ mapGetters } from "vuex";

export default {
  name: "MenuItem",
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  computed: {
    active: {
      get() {
        return (
          this.expandedItems.some(({ name }) => name === this.item.name)
        );
      }
    },
    ...mapGetters({
      expandedItems: "nav/currentExpandedItems",
      user: "auth/user",
    })
  },
  mounted() {
   if (this.$route.matched.some(({ name }) => name === this.item.name)) {
     this.activate(this.item)
   }
  },
  methods: {
    activate(item) {
      this.$store.dispatch("nav/activateItem", item);
    },
    toggle(item) {
      if (item.children) {
        this.$store.dispatch("nav/toggleItem", item);
      } else {
        this.$store.dispatch("nav/activateItem", item);
      }
    },
    subItemClick(e) {
      e.stopPropagation();
    }
  }
};
</script>