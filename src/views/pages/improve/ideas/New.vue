<template>
  <div style="padding-bottom:400px">
    <b-row v-if="currentProcessSection">
      <b-col cols="6" class="mx-auto">
        <div class="h4 text-white text-uppercase clearfix">
          <h3 class="h4 float-left" style="padding-top:9px">
            {{ $t('New ideas') }}
            <span class="h4 text-gray-lighter">{{ newIdeas.length }}</span>
          </h3>&nbsp;
          <!-- <b-button
            size="md"
            class="ml-2 text-uppercase float-left"
            style="padding:5px 15px;line-height:1.3em;font-size:18px"
          >+ {{ $t('Add new')}}</b-button> -->
        </div>
        <idea-card v-for="item in newIdeas" :key="item.id" :idea="item"></idea-card>
        <div v-if="newIdeas.length==0">
          <p class="alert alert-warning">
            {{ $t("There are no records for the given criteria") }}
          </p>
        </div>
      </b-col>
    </b-row>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import IdeaCard from "./Card";
export default {
  components: {
    "idea-card": IdeaCard
  },
  computed: {
    ...mapGetters({
      currentProcess: "process/current"
    }),
    process: {
      get: function() {
        return this.currentProcess("ideas");
      }
    },
    currentProcessSection: {
      get: function() {
        return (
          this.process.phase ||
          this.process.operation ||
          this.process.stage ||
          this.process.process
        );
      }
    },
    currentProcessSectionName: {
      get: function() {
        if (this.process.phase) {
          return "phase";
        }
        if (this.process.operation) {
          return "operation";
        }
        if (this.process.stage) {
          return "stage";
        }
        if (this.process.process) {
          return "process";
        }
        return null;
      }
    },
    newIdeas: {
      get: function() {
        if (this.currentProcessSectionName) {
          return this.$store.getters["idea/by" + this.currentProcessSectionName.capitalize()](this.currentProcessSection.id).filter(
            i => {
                return this.filterByProcessSection(i,"NEW") 
            }
          );
        }
        return [];
      }
    }
  },
  
  methods: {
    filterByProcessSection(item,status){
       switch(this.currentProcessSectionName){
         case 'process':
           return (item.status === status)
           break;
         case 'stage':
           return (item.status === status && item.parentType === 'process_stage'  )
           break;
         case 'operation':
           return (item.status === status && item.parentType === 'process_operation'  )
           break;

        case 'phase':
           return (item.status === status && item.parentType === 'process_phase'  )
           break;  
         default: 
           return false;


       }
    }

  }
};
</script>