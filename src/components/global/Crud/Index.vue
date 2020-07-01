<template>
  <div class="crud-index crud-page">
    <div
      class="overlay"
      :class="{'top-all':this.showInnerOverlayOnTop}"
      v-if="showOverlay"
      @click="overlayClick"
    ></div>
    <div class="container-fluid">
      <!-- page content -->
      <b-card>
        <slot name="default" v-bind:filter="filter" v-bind:showOverlay="showOverlay" v-bind:store="store" />
      </b-card>
    </div>
  </div>
</template>
<script>
import { /*mapState,*/ mapGetters } from "vuex";
export default {
  name: "crud-index",
  props: {
    showOverlay: {
      type: Boolean,
      required: false
    },
    store: {
      type: String,
      required: true
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
  async mounted() {},
  computed: {
    ...mapGetters({
      showInnerOverlayOnTop: "app/show_inner_overlay_on_top"
    })
  }
};
</script>