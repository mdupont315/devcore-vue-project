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
              v-if="process.process"
              class="breadcrumb-item text-overflow"
              :class="{ active: !process.stage }"
            >
              <a
                v-if="process.stage"
                href
                @click="breadcrumbClick($event, 'process')"
                >{{ process.process.title }}</a
              >
              <span v-else>{{ process.process.title }}</span>
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
                >{{ process.stage.title }}
              </a>
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
      <div class="flex-grow-0 pr-2">
        <b-button
          :variant="isActive('new') ? 'outline-primary' : 'transparent'"
          :to="{ name: 'tool-ideas' }"
          class="text-uppercase mr-1 tool_ideas__routerLink"
          id="toolideas_innerView_new"
          ref="toolideas_innerView_New"
          size="md"
          @click="loadComponent"
          >{{ $t("New") }} ({{ newIdeas.length }})</b-button
        >
        <b-button
          :variant="isActive('review') ? 'outline-primary' : 'transparent'"
          :to="{ name: 'tool-ideas', params: { type: 'review' } }"
          class="text-uppercase mr-1 tool_ideas__routerLink"
          id="toolideas_innerView_review"
          ref="toolideas_innerView_Review"
          size="md"
          @click="loadComponent"
          >{{ $t("Review") }} ({{ reviewIdeas.length }})</b-button
        >
        <b-button
          :variant="isActive('adopted') ? 'outline-primary' : 'transparent'"
          :to="{ name: 'tool-ideas', params: { type: 'adopted' } }"
          class="text-uppercase mr-1 tool_ideas__routerLink"
          id="toolideas_innerView_adopted"
          ref="toolideas_innerView_Adopted"
          size="md"
          @click="loadComponent"
          >{{ $t("Adopted") }} ({{ adoptedIdeas.length }})</b-button
        >
        <b-button
          v-if="$can('improve/idea/viewTrashed')"
          :variant="isActive('archived') ? 'outline-primary' : 'transparent'"
          :to="{ name: 'tool-ideas', params: { type: 'archived' } }"
          class="text-uppercase mr-1 tool_ideas__routerLink"
          size="md"
          @click="loadComponent"
          >{{ $t("Archived") }} ({{ archivedIdeas.length }})</b-button
        >
      </div>
      <div class="flex-grow-0 border-left pl-2">
        <v-select
          v-model="tool"
          v-validate="''"
          label="name"
          style="width: 250px"
          data-vv-name="phase"
          :placeholder="$t('Tool')"
          :reduce="(tool) => tool.toolId"
          :options="getTools()"
          class="text-capitalize"
        >
          <template v-slot:option="option">
            <div class="d-flex" style="max-width: 100%">
              <div
                v-b-tooltip.hover
                class="flex-grow-1 text-overflow"
                :title="option.name"
              >
                <span :class="option.icon"></span>
                {{ option.name }}
              </div>
              <div class="flex-grow-0">
                <small
                  >({{
                    $tc(
                      "idea.count",

                      getAllIdeasLength(option)
                    )
                  }})</small
                >
              </div>
            </div>
          </template>
        </v-select>
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
        v-if="currentProcess && currentComponent && tool"
      ></component>
      <empty-page v-else-if="currentProcess && currentComponent && !tool">
        <template slot="content">
          {{ $t("Tool ideas required for selected tool.") }}
          <br />
          {{ $t("You must select tool for tool ideas.") }}
        </template>
      </empty-page>
      <empty-page v-else>
        <div v-if="!currentProcess" class="h2 text-center text-white">
          {{ $t("Just the empty space...") }}
        </div>

        <div v-else class="h2 text-center text-white">
          {{ $t("There are no records for the given criteria") }}
        </div>
      </empty-page>
    </div>
    <empty-page v-if="!process.process || process.process.stages.length === 0">
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

export default {
  data: () => ({
    currentComponent: null,
    storeName: "toolIdea",
  }),

  computed: {
    ...mapGetters({
      currentProcess: "process/current",
      tools: "companyTool/all",
      currentTool: "companyTool/current",
      tab: "toolIdea/currentTab",
      processes: "process/all",
    }),
    process: {
      get() {
        return this.currentProcess("toolIdeas");
      },
    },
    tool: {
      get() {
        return this.currentTool("toolIdeas");
      },
      set(toolId) {
        this.$store.dispatch("companyTool/setCurrent", {
          section: "toolIdeas",
          tool: { id: toolId },
        });
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
            `toolIdea/by${this.currentProcessSectionName.capitalize()}`
          ](this.currentProcessSection.id).filter(
            (i) =>
              this.filterByProcessSection(i, "NEW") &&
              (this.tool ? i.tool.id === this.tool.toolId : true)
          );
        }
        return [];
      },
    },
    allIdeas: {
      get() {
        if (this.currentProcessSectionName) {
          return this.$store.getters[
            `toolIdea/by${this.currentProcessSectionName.capitalize()}`
          ](this.currentProcessSection.id);
        }
        return [];
      },
    },
    reviewIdeas: {
      get() {
        if (this.currentProcessSectionName) {
          return this.$store.getters[
            `toolIdea/by${this.currentProcessSectionName.capitalize()}`
          ](this.currentProcessSection.id).filter(
            (i) =>
              this.filterByProcessSection(i, "TESTING") &&
              (this.tool ? i.tool.id === this.tool.toolId : true)
          );
        }
        return [];
      },
    },
    adoptedIdeas: {
      get() {
        if (this.currentProcessSectionName) {
          return this.$store.getters[
            `toolIdea/by${this.currentProcessSectionName.capitalize()}`
          ](this.currentProcessSection.id).filter(
            (i) =>
              this.filterByProcessSection(i, "ADOPTED") &&
              (this.tool ? i.tool.id === this.tool.toolId : true)
          );
        }
        return [];
      },
    },
    archivedIdeas: {
      get() {
        if (this.currentProcessSectionName) {
          return this.$store.getters[
            `toolIdea/by${this.currentProcessSectionName.capitalize()}`
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
    this.loadComponent();
    await this.$store.dispatch("companyTool/findAll");

    if (this.process.process || this.$router.currentRoute.query.processId) {
      await this.$store.dispatch("process/findById", {
        id:
          this.$router.currentRoute.query.processId ?? this.process.process.id,
        force: true,
      });
      await this.$store.dispatch("toolIdea/findByProcess", {
        id:
          this.$router.currentRoute.query.processId ?? this.process.process.id,
        force: true,
      });
    }

    EventBus.$on("process/changeCurrent", (data) => {
      if (data.section === "toolIdeas") {
        if (!this.process.process) return;
        this.$store.dispatch("toolIdea/findByProcess", {
          id:
            this.$router.currentRoute.query.processId ??
            this.process.process.id,
          force: true,
        });
      }
    });

    EventBus.$on("tool_idea/currentTab", (data) => {
      const tabName =
        data && data.form && data.form.tab ? data.form.tab : "New";

      const ref = `toolideas_innerView_${tabName}`;
      if (this.$refs[ref] && this.$refs[ref].$el) {
        this.$refs[ref].$el.click();
      }
    });

    if (
      this.$router.currentRoute.query &&
      Object.keys(this.$router.currentRoute.query).length > 0
    ) {
      await this.goToToolIdea();
    }
  },
  methods: {
    async setCurrentTool(toolId) {
      await this.$store.dispatch("companyTool/setCurrent", {
        section: "toolIdeas",
        tool: { id: toolId },
      });
    },
    async goToToolIdea() {
      const query = {
        processId: this.$router.currentRoute.query.processId ?? null,
        toolId: this.$router.currentRoute.query.toolId ?? null,
        stageId: this.$router.currentRoute.query.stageId ?? null,
        operationId: this.$router.currentRoute.query.operationId ?? null,
        phaseId: this.$router.currentRoute.query.phaseId ?? null,
      };
      await this.navigateToToolIdea(query);
    },
    async navigateToToolIdea({
      processId = null,
      toolId = null,
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
          section: "toolIdeas",
          process: processPath,
          stage: stagePath,
          operation: operationsPath,
          phase: phasePath,
        });

        let tab = "New";
        if (toolId) {
          await this.setCurrentTool(toolId);
        }

        if (
          this.$router.currentRoute.params &&
          this.$router.currentRoute.params.type
        ) {
          tab = this.$router.currentRoute.params.type;
        }

        await this.$store.dispatch(`${this.storeName}/setIdeaTab`, {
          tab: tab,
        });
      }
    },
    getAllIdeasLength(option) {
      return this.allIdeas.filter((i) => i.companyToolId === option.id).length;
    },
    getTools() {
      return this.tools.filter((tool) => tool.type === "TOOL");
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
            phase: null,
          });
          break;
        case "stage":
          this.$store.dispatch("process/setCurrentProcess", {
            section: "toolIdeas",
            process: this.process.process,
            stage: this.process.stage,
            operation: null,
            phase: null,
          });
          break;
        case "operation":
          this.$store.dispatch("process/setCurrentProcess", {
            section: "toolIdeas",
            process: this.process.process,
            stage: this.process.stage,
            operation: this.process.operation,
            phase: null,
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
    },
  },
};
</script>
