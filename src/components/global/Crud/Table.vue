<template>
  <div class="crud-table">
    <b-table
      sort-icon-left
      sort-by="name"
      :busy="busy"
      class="t01"
      primary-key="id"
      hover
      :fields="fields"
      :items="items"
      :show-empty="true"
      :empty-text="$t('There are no records for the given criteria')"
      :tbody-tr-class="(item,type)=>false?'editing':null"
    >

      <slot name="default" />
    </b-table>
  </div>
</template>
<script>
import { /* mapState, */ mapGetters } from "vuex";

export default {
  name: "CrudTable",
  props: {
    items: {
      required: true
    },
    busy: {
      required: false
    },
    fields: {
      required: true
    },
    store: {
      type: String,
      required: true
    },
    loadItemsFn: {
      type: Function,
      required: false
    }
  },
  data: () => {
    return {
      currentItem: null,
      currentRowDetails: null,
      updateForm: null,
      filter: {
        busy: false
      }
    };
  },
  computed: {
    ...mapGetters({
      showInnerOverlayOnTop: "app/show_inner_overlay_on_top"
    })
  },
  async mounted() {
    await this.loadItems();
  },
  methods: {
    async loadItems() {
      try {
        this.$emit("itemsLoading", this.items);
        if (this.loadItemsFn) {
          await this.loadItemsFn(this.filter);
        } else {
          await this.$store.dispatch(`${this.store}/findAll`, {
            force: true,
            filter: this.filter
          });
        }
      } finally {
        this.$emit("itemsLoaded", this.items);
      }
    }
  }
};
</script>
