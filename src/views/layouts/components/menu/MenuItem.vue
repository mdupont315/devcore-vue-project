<template>
  <li :class="{'active': active}" @click="toggle(item,$event)">
    <router-link class="title" :to="item.url" v-if="item.url">
      <i class="mdi icon" :class="item.icon" v-if="item.icon"></i>
      {{ $t(item.title) }}
    </router-link>
    <span class="title" v-else>
      <i class="mdi icon" :class="item.icon" v-if="item.icon"></i>
      {{ $t(item.title) }}
    </span>
    <ul class="nav sub-menu" v-if="item.children">
      <li
        v-for="(subitem,subindex) in item.children"
        :key="subindex"
        @click.stop="subItemClick($event, item)"
        class="item link"
        :class="{'active':$route.matched.some(({ name }) => name === subitem.name)}"
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
import { /*mapState,*/ mapGetters } from "vuex";
export default {
  name: "menu-item",
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  computed: {
    active: {
      get: function() {
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