<template>
  <div class="card rounded-0" style="width:600px">
    <div class="card-header bg-primary rounded-0">
      <h3
        class="h5 m-0"
      >{{$t('name.for', {name:$t('Ideas'), for:stage.title}) }} {{ project.name }}</h3>
      <div class="tools">
        <span
          class="summary"
        >{{project.getIdeasImpactByStage(stage.id)>=0?'+':''}}{{ project.getIdeasImpactByStage(stage.id) | numberFormat('0.00') }}%</span>
        <span class="close-btn" @click.stop="close">
          <i class="mdi mdi-close"></i>
        </span>
      </div>
    </div>
    <div class="card-body">
      <b-table
        sort-icon-left
        sort-by="title"
        class="t01"
        primary-key="id"
        hover
        :fields="fields"
        :items="items"
        :show-empty="true"
        :empty-text="$t('There are no records for the given criteria')"
      >
        <template v-slot:table-colgroup>
          <col style="width:60%" />
          <col style="width:10%" />
          <col style="width:300px" />
        </template>
        <template v-slot:empty="scope">
          <p class="alert alert-warning text-center">{{ scope.emptyText }}</p>
        </template>
        <template v-slot:table-busy>
          <div class="text-center text-primary my-2">
            <b-spinner class="align-middle"></b-spinner>
          </div>
        </template>

        <template v-slot:cell(idea)="row">
          {{row.item.title}}
        </template>
        <template v-slot:cell(value)="row">
          <span
            :class="{'text-danger':row.item.consolidatedValue<0,'text-success':row.item.consolidatedValue>=0}"
          > {{ (row.item.consolidatedValue*100/project.budget) | numberFormat('0.00') }} %</span>


				</template>
      </b-table>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    project: {
      required: true,
      type: Object
    },
    stage: {
      required: true,
      type: Object
    },
    items: {
      required: true,
      type: Array
    }
  },

  computed: {
    fields: {
      get() {
        return [
          { key: "idea", label: this.$t("Idea"), sortable: false },
          {
            key: "value",
            label: this.$t("Value"),
            sortable: false
          }
        ];
      }
    }
  },
  mounted() {},
  methods: {
    close() {
      this.$emit("closed");
    }
  }
};
</script>

