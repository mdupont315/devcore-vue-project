<template>
  <div class="page py-0 pg-ideas bg-semi-transparent">
    <div
      class="sub-top-bar shadow-sm d-flex flex-row"
      v-if="process.process && process.process.stages.length > 0"
    >
      <div class="flex-grow-1">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb text-capitalize bg-white">
            <li
              class="breadcrumb-item text-overflow"
              v-if="process.process"
              :class="{'active':!process.stage}"
            >
              <a
                href
                @click="breadcrumbClick($event, 'process')"
                v-if="process.stage"
              >{{ process.process.title }}</a>
              <span v-else>{{ process.process.title }}</span>
            </li>
            <li
              class="breadcrumb-item text-overflow"
              v-if="process.stage"
              :class="{'active':!process.operation}"
            >
              <a
                href
                @click="breadcrumbClick($event, 'stage')"
                v-if="process.operation"
              >{{ process.stage.title }}</a>
              <span v-else>{{ process.stage.title }}</span>
            </li>
            <li
              class="breadcrumb-item text-overflow"
              v-if="process.operation"
              :class="{'active':!process.phase}"
            >
              <a
                href
                @click="breadcrumbClick($event, 'operation')"
                v-if="process.phase"
              >{{ process.operation.title }}</a>
              <span v-else>{{ process.operation.title }}</span>
            </li>
            <li class="breadcrumb-item active" v-if="process.phase">
              <span>{{ process.phase.title }}</span>
            </li>
          </ol>
        </nav>
      </div>
      <div class="flex-grow-0 pr-2">
        <b-button
          :variant="isActive('new')?'outline-primary':'transparent'"
          :to="{name:'tool-ideas'}"
          class="text-uppercase mr-1"
          @click="loadComponent"
          size="md"
        >{{ $t('New') }} ({{ newIdeas.length }})</b-button>
        <b-button
          :variant="isActive('review')?'outline-primary':'transparent'"
          :to="{name:'tool-ideas', params:{type:'review'}}"
          class="text-uppercase mr-1"
          @click="loadComponent"
          size="md"
        >{{ $t('Review') }} ({{ reviewIdeas.length }})</b-button>
        <b-button
          :variant="isActive('adopted')?'outline-primary':'transparent'"
          :to="{name:'tool-ideas', params:{type:'adopted'}}"
          class="text-uppercase mr-1"
          @click="loadComponent"
          size="md"
        >{{ $t('Adopted') }} ({{ adoptedIdeas.length }})</b-button>
        <b-button
          :variant="isActive('archived')?'outline-primary':'transparent'"
          :to="{name:'tool-ideas', params:{type:'archived'}}"
          class="text-uppercase mr-1"
          v-if="$can('improve/idea/viewTrashed')"
          @click="loadComponent"
          size="md"
        >{{ $t('Archived') }} ({{ archivedIdeas.length }})</b-button>
      </div>
      <div class="flex-grow-0 border-left pl-2">
        <v-select
          label="name"
          style="width:250px"
          v-validate="''"
          data-vv-name="phase"
          v-model="tool"
          :placeholder="$t('Tool')"
          :reduce="tool => tool.toolId"
          :options="tools"
          class="text-capitalize"
        >
          <template v-slot:option="option">
            <div class="d-flex" style="max-width:100%">
              <div class="flex-grow-1 text-overflow" v-b-tooltip.hover :title="option.name">
                <span :class="option.icon"></span>
                {{ option.name }}
              </div>
              <div class="flex-grow-0">
                <small>({{ $tc('idea.count',allIdeas.filter(i=>i.companyToolId===option.id).length) }})</small>
              </div>
            </div>
          </template>
        </v-select>
      </div>
    </div>
    <div
      class="has-top-bar p-3"
      id="main-content"
      style="overflow:auto; height: calc(100vh - 105px)"
      v-if="process.process && process.process.stages.length>0"
    >
      <component v-if="currentProcess && currentComponent" :is="currentComponent"></component>
      <empty-page v-else>
        <div
          class="h2 text-center text-white"
          v-if="!currentProcess"
        >{{$t('Just the empty space...')}}</div>
        <div
          class="h2 text-center text-white"
          v-else
        >{{$t('There are no records for the given criteria')}}</div>
      </empty-page>
    </div>
    <empty-page v-if="!process.process || process.process.stages.length===0">
      <template slot="content">
        {{ $t('There are no stages on the current process.') }}
        <br />
        {{ $t('You must add stages to the current process to create ideas.') }}
      </template>
    </empty-page>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
export default {
  data: () => ({
    currentComponent: null
  }),
  computed: {
    ...mapGetters({
      currentProcess: "process/current",
      tools: "companyTool/all",
      currentTool: "companyTool/current"
    }),
    process: {
      get: function() {
        return this.currentProcess("toolIdeas");
      }
    },
    tool: {
      get: function() {
        return this.currentTool("toolIdeas");
      },
      set: function(toolId) {
        this.$store.dispatch("companyTool/setCurrent", {
          section: "toolIdeas",
          tool: { id: toolId }
        });
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
          return this.$store.getters[
            "toolIdea/by" + this.currentProcessSectionName.capitalize()
          ](this.currentProcessSection.id).filter(
            i =>
              this.filterByProcessSection(i,"NEW") &&
              (this.tool ? i.tool.id === this.tool.toolId : true)
          );
        }
        return [];
      }
    },
    allIdeas: {
      get: function() {
        if (this.currentProcessSectionName) {
          return this.$store.getters[
            "toolIdea/by" + this.currentProcessSectionName.capitalize()
          ](this.currentProcessSection.id);
        }
        return [];
      }
    },
    reviewIdeas: {
      get: function() {
        if (this.currentProcessSectionName) {
          return this.$store.getters[
            "toolIdea/by" + this.currentProcessSectionName.capitalize()
          ](this.currentProcessSection.id).filter(
            i =>
              this.filterByProcessSection(i,"TESTING") &&
              (this.tool ? i.tool.id === this.tool.toolId : true)
          );
        }
        return [];
      }
    },
    adoptedIdeas: {
      get: function() {
        if (this.currentProcessSectionName) {
          return this.$store.getters[
            "toolIdea/by" + this.currentProcessSectionName.capitalize()
          ](this.currentProcessSection.id).filter(
            i =>
              this.filterByProcessSection(i,"ADOPTED") &&
              (this.tool ? i.tool.id === this.tool.toolId : true)
          );
        }
        return [];
      }
    },
    archivedIdeas: {
      get: function() {
        if (this.currentProcessSectionName) {
          return this.$store.getters[
            "toolIdea/by" + this.currentProcessSectionName.capitalize()
          ](this.currentProcessSection.id).filter(i => i.status === "ARCHIVED");
        }
        return [];
      }
    },
    breadcrumb: {
      get: function() {
        const ret = [];
        if (this.process.process) {
          ret.push({
            text: this.process.process.name,
            href: null
          });
        }

        if (this.process.stage) {
          ret.push({
            text: this.process.stage.name,
            href: null
          });
        }

        if (this.process.operation) {
          ret.push({
            text: this.process.operation.name
          });
        }

        if (this.process.phase) {
          ret.push({
            text: this.process.phase.name
          });
        }
        return ret;
      }
    }
  },
  async mounted() {
    this.loadComponent();
    await this.$store.dispatch("companyTool/findAll");
    if (this.process.process) {
      this.$store.dispatch("process/findById", {
        id: this.process.process.id,
        force: true
      });
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
    },
    isActive(name) {
      return (
        this.$route.params.type === name ||
        (name === "new" && !this.$route.params.type)
      );
    },
    breadcrumbClick(event, section) {
      event.preventDefault();
      switch (section) {
        case "process":
          this.$store.dispatch("process/setCurrentProcess", {
            section: "toolIdeas",
            process: this.process.process,
            stage: null,
            operation: null,
            phase: null
          });
          break;
        case "stage":
          this.$store.dispatch("process/setCurrentProcess", {
            section: "toolIdeas",
            process: this.process.process,
            stage: this.process.stage,
            operation: null,
            phase: null
          });
          break;
        case "operation":
          this.$store.dispatch("process/setCurrentProcess", {
            section: "toolIdeas",
            process: this.process.process,
            stage: this.process.stage,
            operation: this.process.operation,
            phase: null
          });
          break;
      }
    },
    loadComponent() {
      this.currentComponent = () =>
        import(
          "./" +
            (this.$route.params.type
              ? this.$route.params.type.capitalize()
              : "New") +
            ".vue"
        );
    }
  }
};
</script>