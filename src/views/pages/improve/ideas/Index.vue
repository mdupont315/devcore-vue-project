<template>
  <div class="page py-0 pg-ideas bg-semi-transparent">
    <div
      v-if="process.process && process.process.stages.length > 0"
      class="sub-top-bar shadow-sm d-flex flex-row"
    >
      <div class="flex-grow-1">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb text-capitalize bg-white">
            <li
              class="breadcrumb-item text-overflow"
              :class="{ active: !process.stage }"
            >
              <a
                v-if="process.stage"
                href
                @click="breadcrumbClick($event, 'process')"
                >{{ process.process.title }}</a
              >
              <span v-else>{{ process.process.title }} </span>
            </li>
            <li
              v-if="process.stage"
              class="breadcrumb-item text-overflow"
              :class="{ active: !process.operation }"
            >
              <a
                v-if="process.operation"
                href
                @click="breadcrumbClick($event, 'stage')"
                >{{ process.stage.title }}</a
              >
              <span v-else>{{ process.stage.title }}</span>
            </li>
            <li
              v-if="process.operation"
              class="breadcrumb-item text-overflow"
              :class="{ active: !process.phase }"
            >
              <a
                v-if="process.phase"
                href
                @click="breadcrumbClick($event, 'operation')"
                >{{ process.operation.title }}</a
              >
              <span v-else>{{ process.operation.title }}</span>
            </li>
            <li v-if="process.phase" class="breadcrumb-item active">
              <span>{{ process.phase.title }}</span>
            </li>
          </ol>
        </nav>
      </div>
      <div class="flex-grow-0">
        <b-button
          :variant="isActive('new') ? 'outline-primary' : 'transparent'"
          :to="{ name: 'ideas' }"
          id="ideas_innerView_new"
          ref="ideas_innerView_New"
          class="text-uppercase mr-1 ideas__routerLink"
          size="md"
          @click="setComponent"
          >{{ $t("New") }} ({{ newIdeas.length }})</b-button
        >
        <b-button
          :variant="isActive('review') ? 'outline-primary' : 'transparent'"
          :to="{ name: 'ideas', params: { type: 'review' } }"
          id="ideas_innerView_review"
          ref="ideas_innerView_Review"
          class="text-uppercase mr-1 ideas__routerLink"
          size="md"
          @click="setComponent"
          >{{ $t("Review") }} ({{ reviewIdeas.length }})</b-button
        >
        <b-button
          :variant="isActive('adopted') ? 'outline-primary' : 'transparent'"
          :to="{ name: 'ideas', params: { type: 'adopted' } }"
          id="ideas_innerView_adopted"
          ref="ideas_innerView_Adopted"
          class="text-uppercase mr-1 ideas__routerLink"
          size="md"
          @click="setComponent"
          >{{ $t("Adopted") }} ({{ adoptedIdeas.length }})</b-button
        >
        <b-button
          v-if="$can('improve/idea/viewTrashed')"
          :variant="isActive('archived') ? 'outline-primary' : 'transparent'"
          :to="{ name: 'ideas', params: { type: 'archived' } }"
          class="text-uppercase mr-1 ideas__routerLink"
          size="md"
          @click="setComponent"
          >{{ $t("Archived") }} ({{ archivedIdeas.length }})</b-button
        >
      </div>
    </div>
    <div
      v-if="process.process && process.process.stages.length > 0"
      id="main-content"
      class="has-top-bar p-3"
      style="overflow: auto; overflow-x: hidden; height: calc(100vh - 105px)"
    >
      <component
        :is="currentComponent"
        v-if="currentProcess && currentComponent"
      ></component>

      <empty-page v-else>
        <div v-if="!currentProcess" class="h2 text-center text-white">
          {{ $t("Just the empty space...") }}
        </div>
        <div v-else class="h2 text-center text-white">
          {{ $t("There are no records for the given criteria") }}
        </div>
      </empty-page>
    </div>

    <empty-page v-else>
      <template slot="content">
        {{ $t("There are no stages on the current process.") }}
        <br />
        {{ $t("You must add stages to the current process to create ideas.") }}
      </template>
    </empty-page>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import EventBus from "@/lib/eventbus";
import TopNav from "@/views/layouts/components/TopNav";
import MainNav from "@/views/layouts/components/MainNav";
import New from "./New.vue";
import Review from "./Review.vue";
import Adopted from "./Adopted.vue";

export default {
  components: {
    "top-nav": TopNav,
    "main-nav": MainNav,
    "idea-new": New,
    "idea-review": Review,
    "idea-adopted": Adopted,
  },
  data: () => ({
    currentComponent: null,
  }),

  computed: {
    ...mapGetters({
      currentProcess: "process/current",
      user: "auth/user",
      loading: "process/loading",
      processes: "process/all",
      ideaInEdit: "idea/ideaInEdit",
    }),

    process: {
      get() {
        return this.currentProcess("ideas");
      },
    },
    currentProcessSection: {
      get() {
        return (
          this.process.phase ||
          this.process.operation ||
          this.process.stage ||
          this.process.process
        );
      },
    },
    currentProcessSectionName: {
      get() {
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
      },
    },
    newIdeas: {
      get() {
        if (this.currentProcessSectionName) {
          return this.$store.getters[
            `idea/by${this.currentProcessSectionName.capitalize()}`
          ](this.currentProcessSection.id).filter((i) =>
            this.filterByProcessSection(i, "NEW")
          );
        }
        return [];
      },
    },
    reviewIdeas: {
      get() {
        if (this.currentProcessSectionName) {
          return this.$store.getters[
            `idea/by${this.currentProcessSectionName.capitalize()}`
          ](this.currentProcessSection.id).filter((i) =>
            this.filterByProcessSection(i, "TESTING")
          );
        }
        return [];
      },
    },
    adoptedIdeas: {
      get() {
        if (this.currentProcessSectionName) {
          return this.$store.getters[
            `idea/by${this.currentProcessSectionName.capitalize()}`
          ](this.currentProcessSection.id).filter((i) =>
            this.filterByProcessSection(i, "ADOPTED")
          );
        }
        return [];
      },
    },
    archivedIdeas: {
      get() {
        if (this.currentProcessSectionName) {
          return this.$store.getters[
            `idea/by${this.currentProcessSectionName.capitalize()}`
          ](this.currentProcessSection.id).filter(
            (i) => i.status === "ARCHIVED"
          );
        }
        return [];
      },
    },
    breadcrumb: {
      get() {
        const ret = [];
        if (this.process.process) {
          ret.push({
            text: this.process.process.name,
            href: null,
          });
        }

        if (this.process.stage) {
          ret.push({
            text: this.process.stage.name,
            href: null,
          });
        }

        if (this.process.operation) {
          ret.push({
            text: this.process.operation.name,
          });
        }

        if (this.process.phase) {
          ret.push({
            text: this.process.phase.name,
          });
        }
        return ret;
      },
    },
  },
  async mounted() {
    if (this.user.can("core/company/manage")) {
      await this.$router.replace("/manage/companies");
    }
    this.loadComponent();
    if (this.process.process || this.$router.currentRoute.query.processId) {
      await this.$store.dispatch("process/findById", {
        id:
          this.$router.currentRoute.query.processId ?? this.process.process.id,
        force: true,
      });
      await this.$store.dispatch("idea/findByProcess", {
        id:
          this.$router.currentRoute.query.processId ?? this.process.process.id,
        force: true,
      });
    }
    EventBus.$on("process/changeCurrent", (data) => {
      if (data.section === "ideas") {
        if (!this.process.process) return;
        this.$store.dispatch("idea/findByProcess", {
          id: this.process.process.id,
          force: true,
        });
      }
    });
    EventBus.$on("idea/currentTab", (data) => {
      const tabName =
        data && data.form && data.form.tab ? data.form.tab : "New";

      const ref = `ideas_innerView_${tabName}`;
      if (this.$refs[ref] && this.$refs[ref].$el) {
        this.$refs[ref].$el.click();
      }
    });

    EventBus.$on("idea/currentIdea", (data) => {
      if (data.form) {
        this.currentComponent = (data) => import("./idea_edit/IdeaEdit.vue");
      } else {
        this.loadComponent();
      }
    });

    if (
      this.$router.currentRoute.query &&
      Object.keys(this.$router.currentRoute.query).length > 0
    ) {
      await this.goToIdeaByQuery();
    }
  },
  methods: {
    async goToIdeaByQuery() {
      // Navigated through link
      if (this.$router.currentRoute.query) {
        const query = {
          processId: this.$router.currentRoute.query.processId ?? null,
          stageId: this.$router.currentRoute.query.stageId ?? null,
          operationId: this.$router.currentRoute.query.operationId ?? null,
          phaseId: this.$router.currentRoute.query.phaseId ?? null,
          ideaId: this.$router.currentRoute.query.ideaId ?? null,
        };
        await this.navigateToIdea(query);
        const editIdea = await this.$store.dispatch("idea/findById", {
          id: query.ideaId,
          force: true,
        });
        await this.$store.dispatch("idea/setIdeaInEdit", {
          editIdeaMeta: {
            editStartedAt: new Date().getTime(),
          },
          editIdea,
        });
      }
    },
    async navigateToIdea({
      processId = null,
      stageId = null,
      operationId = null,
      phaseId = null,
    }) {
      const processPath = this.processes.find((p) => p.id == processId);
      const stagePath =
        processPath && processPath.stages.length > 0
          ? processPath.stages.find((s) => s.id == stageId)
          : null;
      const operationsPath =
        stagePath && stagePath.operations.length > 0
          ? stagePath.operations.find((o) => o.id == operationId)
          : null;
      const phasePath =
        operationsPath && operationsPath.phases.length > 0
          ? operationsPath.phases.find((p) => p.id == phaseId)
          : null;

      if (processPath && stagePath) {
        await this.$store.dispatch("process/setCurrentProcess", {
          section: "ideas",
          process: processPath,
          stage: stagePath,
          operation: operationsPath,
          phase: phasePath,
        });

        let tab = "New";

        if (
          this.$router.currentRoute.params &&
          this.$router.currentRoute.params.type
        ) {
          tab = this.$router.currentRoute.params.type;
        }

        await this.$store.dispatch(`idea/setIdeaTab`, {
          tab: tab,
        });
      }
    },
    filterByProcessSection(item, status) {
      switch (this.currentProcessSectionName) {
        case "process":
          return item.status === status;

        case "stage":
          return item.status === status && item.parentType === "process_stage";

        case "operation":
          return (
            item.status === status && item.parentType === "process_operation"
          );

        case "phase":
          return item.status === status && item.parentType === "process_phase";

        default:
          return false;
      }
    },
    isActive(name) {
      return (
        this.$route.params.type === name.toLowerCase() ||
        (name === "new" && !this.$route.params.type)
      );
    },
    async breadcrumbClick(event, section) {
      event.preventDefault();
      switch (section) {
        case "process":
          this.$store.dispatch("process/setCurrentProcess", {
            section: "ideas",
            process: this.process.process,
            stage: null,
            operation: null,
            phase: null,
          });
          break;
        case "stage":
          this.$store.dispatch("process/setCurrentProcess", {
            section: "ideas",
            process: this.process.process,
            stage: this.process.stage,
            operation: null,
            phase: null,
          });
          break;
        case "operation":
          this.$store.dispatch("process/setCurrentProcess", {
            section: "ideas",
            process: this.process.process,
            stage: this.process.stage,
            operation: this.process.operation,
            phase: null,
          });
          break;
      }
      await this.closeIdeaEdit();
    },

    async closeIdeaEdit() {
      if (this.ideaInEdit) {
        await this.$store.dispatch("idea/setIdeaInEdit", null);
      }
    },

		async setComponent (){
			await this.loadComponent();
		},

    async loadComponent() {
      this.currentComponent = () =>
        import(
          "./" +
            (this.$route.params.type
              ? this.$route.params.type.capitalize()
              : "New") +
            ".vue"
        );
    },
  },
};
</script>
