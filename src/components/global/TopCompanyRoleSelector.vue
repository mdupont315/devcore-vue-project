<template>
  <top-selector :items="items" :title="$t('Role')">
    <template slot="current" slot-scope="props">{{ props.value? props.value.name : $t('All')}}</template>
    <template slot="item" slot-scope="props">{{ props.item.name}}</template>
  </top-selector>
</template>
<script>
import { mapGetters } from "vuex";
export default {
  name: "top-company-role-selector",
  computed: {
    ...mapGetters({
      items: "companyRole/all"
    })
  }
};
</script>