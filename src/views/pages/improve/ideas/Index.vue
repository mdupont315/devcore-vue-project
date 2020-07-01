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
      <div class="flex-grow-0">
        <b-button
          :variant="isActive('new')?'outline-primary':'transparent'"
          :to="{name:'ideas'}"
          class="text-uppercase mr-1"
          @click="loadComponent"
          size="md"
        >{{ $t('New') }} ({{ newIdeas.length }})</b-button>
        <b-button
          :variant="isActive('review')?'outline-primary':'transparent'"
          :to="{name:'ideas', params:{type:'review'}}"
          class="text-uppercase mr-1"
          @click="loadComponent"
          size="md"
        >{{ $t('Review') }} ({{ reviewIdeas.length }})</b-button>
        <b-button
          :variant="isActive('adopted')?'outline-primary':'transparent'"
          :to="{name:'ideas', params:{type:'adopted'}}"
          class="text-uppercase mr-1"
          @click="loadComponent"
          size="md"
        >{{ $t('Adopted') }} ({{ adoptedIdeas.length }})</b-button>
        <b-button
          :variant="isActive('archived')?'outline-primary':'transparent'"
          :to="{name:'ideas', params:{type:'archived'}}"
          class="text-uppercase mr-1"
          v-if="$can('improve/idea/viewTrashed')"
          @click="loadComponent"
          size="md"
        >{{ $t('Archived') }} ({{ archivedIdeas.length }})</b-button>
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

    <empty-page v-else>
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
import EventBus from "@/lib/eventbus";
export default {
  data: () => ({
    currentComponent: null
  }),
  computed: {
    ...mapGetters({
      currentProcess: "process/current",
      loading: "process/loading"
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
          return this.$store.getters[
            "idea/by" + this.currentProcessSectionName.capitalize()
          ](this.currentProcessSection.id).filter(i => i.status === "NEW");
        }
        return [];
      }
    },
    reviewIdeas: {
      get: function() {
        if (this.currentProcessSectionName) {
          return this.$store.getters[
            "idea/by" + this.currentProcessSectionName.capitalize()
          ](this.currentProcessSection.id).filter(i => i.status === "TESTING");
        }
        return [];
      }
    },
    adoptedIdeas: {
      get: function() {
        if (this.currentProcessSectionName) {
          return this.$store.getters[
            "idea/by" + this.currentProcessSectionName.capitalize()
          ](this.currentProcessSection.id).filter(i => i.status === "ADOPTED");
        }
        return [];
      }
    },
    archivedIdeas: {
      get: function() {
        if (this.currentProcessSectionName) {
          return this.$store.getters[
            "idea/by" + this.currentProcessSectionName.capitalize()
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
  mounted() {
    this.loadComponent();
    if (this.process.process) {
      this.$store.dispatch("process/findById", {
        id: this.process.process.id,
        force: true
      });
      this.$store.dispatch("idea/findByProcess", {
        id: this.process.process.id,
        force: true
      });
    }
    EventBus.$on("process/changeCurrent", data => {
      if (data.section === "ideas") {
        this.$store.dispatch("idea/findByProcess", {
          id: this.process.process.id,
          force: true
        });
      }
    });
  },
  methods: {
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
            section: "ideas",
            process: this.process.process,
            stage: null,
            operation: null,
            phase: null
          });
          break;
        case "stage":
          this.$store.dispatch("process/setCurrentProcess", {
            section: "ideas",
            process: this.process.process,
            stage: this.process.stage,
            operation: null,
            phase: null
          });
          break;
        case "operation":
          this.$store.dispatch("process/setCurrentProcess", {
            section: "ideas",
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