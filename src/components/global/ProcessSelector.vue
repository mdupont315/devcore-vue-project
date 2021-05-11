<template>
  <div class="process-selector">
    <div v-show="!editing" class="label">{{ $t("Process") }}</div>
    <div
      class="current-process"
      :class="{ expanded: expanded, editing: editing }"
      @click.stop="toggleSelector"
    >
      <span v-show="true">
        <span
          v-if="!editing && allowEdit"
          class="edit-btn"
          @click.stop="initEdit"
        >
          <i class="mdi mdi-pencil"></i>
        </span>
        <div
          ref="selectProcessBtn"
          v-b-tooltip.hover
          class="title"
          :title="current.process ? current.process.title.toUpperCase() : null"
          @click.stop="toggleSelector"
        >
          {{
            current.process
              ? `${current.process.title} ${this.getCount(
                  "process",
                  current.process
                )}`
              : $t("Select process")
          }}
        </div>
        <span
          v-show="!editing"
          class="arrow"
          @click.stop="toggleSelector"
        ></span>
      </span>
      <layer v-if="editing" @closed="initEdit">
        <div class="edit" style="width: 300px; left: 0">
          <label class="label">{{ $t("Name of process") }}</label>
          <div class="d-flex flex-row">
            <div class="flex-grow-1 position-relative">
              <b-input
                ref="editInput"
                v-model="editForm.title"
                v-validate="'required|min:4'"
                size="sm"
                name="title"
                :disabled="editForm.busy"
                class="no-focus-style"
                style="margin: 0 !important"
                :state="$validateState('title', editForm)"
              />
              <b-form-invalid-feedback>{{
                $displayError("title", editForm)
              }}</b-form-invalid-feedback>
            </div>
            <b-button
              :disabled="vErrors.any()"
              size="xs"
              variant="transparent"
              class="action mdi mdi-check text-success font-15x m-0 outline-none"
              :title="$t('Save')"
              @click="saveItem"
            ></b-button>
            <b-button
              size="xs"
              variant="transparent"
              class="action mdi mdi-close text-danger font-15x m-0 outline-none"
              :title="$t('Cancel')"
              @click="cancelEdit"
            ></b-button>
          </div>
        </div>
      </layer>
    </div>
    <b-popover
      placement="bottom"
      :show.sync="expanded"
      :target="() => $refs.selectProcessBtn"
    >
      <b-card no-body class="process-selector-popover" style="min-width: 300px">
        <div class="px-3 pt-3">
          <div class="sections">
            <div
              class="section"
              :class="{ expanded: expandedSection === 'process' }"
              @click="toggleSection('process')"
            >
              <div class="label">{{ $t("Process") }}</div>
              <div class="title">
                {{
                  selectedProcess
                    ? `${selectedProcess.title} ${this.getCount(
                        "process",
                        selectedProcess
                      )}`
                    : $t("Select process") +
                      " (" +
                      (loading.process
                        ? $t("Loading...")
                        : items.length > 0
                        ? items.length
                        : $t("No process available")) +
                      ")"
                }}
              </div>
              <div class="selector">
                <perfect-scrollbar>
                  <div style="position: relative">
                    <div
                      v-if="loading.stage"
                      class="loading"
                      style="
                        background: rgba(0, 0, 0, 0.4);
                        position: absolute;
                        top: 0;
                        left: 0;
                        bottom: 0;
                        right: 0;
                        display: flex;
                        justify-content: center;
                        flex-direction: column;
                        align-items: center;
                        z-index: 1;
                        margin: 0 -16px;
                        height: 100%;
                      "
                    >
                      <b-spinner></b-spinner>
                    </div>
                    <ul class="list-unstyled m-0 scrollY">
                      <li
                        v-for="item in items"
                        :key="item.id"
                        :ref="'process_' + item.id"
                        class="item"
                        :class="{
                          active:
                            selectedProcess && selectedProcess.id === item.id,
                        }"
                        @click.stop="selectProcess(item, true)"
                      >
                        {{ item.title }} {{ getCount("process", item) }}
                      </li>
                    </ul>
                  </div>
                </perfect-scrollbar>
              </div>
            </div>

            <!-- stages -->
            <div
              v-if="maxLevelNumber > 0"
              class="section"
              :class="{ expanded: expandedSection === 'stage' }"
              @click="toggleSection('stage')"
            >
              <div class="label">{{ $t("Stage") }}</div>
              <div class="title">
                {{
                  selectedStage && !loading.stage
                    ? `${selectedStage.title} ${this.getCount(
                        "stage",
                        selectedStage
                      )}`
                    : $t("Select stage") +
                      " (" +
                      (loading.stage
                        ? $t("Loading...")
                        : selectedProcess && selectedProcess.stages.length > 0
                        ? selectedProcess.stages.length
                        : $t("No stages available")) +
                      ")"
                }}
              </div>
              <div class="selector">
                <perfect-scrollbar>
                  <div style="position: relative; margin-right: 15px">
                    <ul class="list-unstyled">
                      <li
                        class="item"
                        :class="{ active: !selectedStage }"
                        @click="selectStage(null, true)"
                      >
                        {{ $t("None") }}
                      </li>
                      <li
                        v-for="item in selectedProcess
                          ? selectedProcess.stages
                          : []"
                        :key="item.id"
                        :ref="'stage_' + item.id"
                        class="item"
                        :class="{
                          active: selectedStage && selectedStage.id === item.id,
                        }"
                        @click.stop="selectStage(item, true)"
                      >
                        {{ item.title }} {{ getCount("stage", item) }}
                      </li>
                    </ul>
                  </div>
                </perfect-scrollbar>
              </div>
            </div>

            <!-- operations -->
            <div
              v-if="maxLevelNumber > 1"
              class="section"
              :class="{ expanded: expandedSection === 'operation' }"
              @click="toggleSection('operation')"
            >
              <div class="label">{{ $t("Operation") }}</div>
              <div class="title">
                {{
                  selectedOperation && !loading.operation
                    ? `${selectedOperation.title} ${this.getCount(
                        "operation",
                        selectedOperation
                      )}`
                    : $t("Select operation") +
                      " (" +
                      (loading.operation
                        ? $t("Loading...")
                        : selectedStage && selectedStage.operations.length > 0
                        ? selectedStage.operations.length
                        : $t("No operations available")) +
                      ")"
                }}
              </div>
              <div class="selector">
                <perfect-scrollbar>
                  <div style="position: relative; margin-right: 15px">
                    <ul class="list-unstyled">
                      <li
                        class="item"
                        :class="{ active: !selectedOperation }"
                        @click="selectOperation(null, true)"
                      >
                        {{ $t("None") }}
                      </li>
                      <li
                        v-for="item in selectedStage
                          ? selectedStage.operations
                          : []"
                        :key="item.id"
                        :ref="'operation_' + item.id"
                        class="item"
                        :class="{
                          active:
                            selectedOperation &&
                            selectedOperation.id === item.id,
                        }"
                        @click.stop="selectOperation(item, true)"
                      >
                        {{ item.title }} {{ getCount("operation", item) }}
                      </li>
                    </ul>
                  </div>
                </perfect-scrollbar>
              </div>
            </div>

            <!-- phases -->
            <div
              v-if="maxLevelNumber > 2"
              class="section"
              :class="{ expanded: expandedSection === 'phase' }"
              @click="toggleSection('phase')"
            >
              <div class="label">{{ $t("Phase") }}</div>
              <div class="title">
                {{
                  selectedPhase && !loading.phase
                    ? `${selectedPhase.title} ${this.getCount(
                        "phase",
                        selectedPhase
                      )}`
                    : $t("Select phase") +
                      " (" +
                      (loading.phase
                        ? $t("Loading...")
                        : selectedOperation &&
                          selectedOperation.phases.length > 0
                        ? selectedOperation.phases.length
                        : $t("No phases available")) +
                      ")"
                }}
              </div>
              <div class="selector">
                <perfect-scrollbar>
                  <div style="position: relative; margin-right: 15px">
                    <ul class="list-unstyled">
                      <li
                        class="item"
                        :class="{ active: !selectedPhase }"
                        @click="selectPhase(null, true)"
                      >
                        {{ $t("None") }}
                      </li>
                      <li
                        v-for="item in selectedOperation
                          ? selectedOperation.phases
                          : []"
                        :key="item.id"
                        :ref="'phase_' + item.id"
                        class="item"
                        :class="{
                          active: selectedPhase && selectedPhase.id === item.id,
                        }"
                        @click="selectPhase(item, true)"
                      >
                        {{ item.title }} {{ getCount("phase", item) }}
                      </li>
                    </ul>
                  </div>
                </perfect-scrollbar>
              </div>
            </div>
          </div>
        </div>
        <div class="footer">
          <div class="d-flex flex-row">
            <i
              class="mdi mdi-close cursor-pointer font-15x opacity"
              @click="close"
            ></i>
            <b-button
              variant="link"
              class="text-uppercase text-white text-undecorated p-0 flex-grow-1"
              @click="apply"
              >{{ $t("Apply") }}</b-button
            >
          </div>
        </div>
      </b-card>
    </b-popover>
  </div>
</template>
<script>
import { /* mapState, */ mapGetters } from "vuex";
import GQLForm from "@/lib/gqlform";

export default {
  name: "ProcessSelector",
  props: {
    maxLevel: {
      required: false,
      default: () => "process",
    },
    showCount: {
      required: false,
      validator: (value) => {
        return ["items", "ideas", "projects", "toolIdeas"].includes(value);
      },
    },
    list: {
      required: false,
      type: Object,
      default: () => ({}),
    },
    detail: {
      required: false,
      type: Object,
      default: () => ({}),
    },
    section: {
      required: true,
    },
    onSelection: {
      required: false,
      type: Function,
    },
    onApply: {
      required: false,
      type: Function,
    },
    allowEdit: {
      required: false,
      type: Boolean,
      default: () => false,
    },
  },
  data: () => ({
    expanded: false,
    expandedSection: null,
    selectedProcess: null,
    selectedStage: null,
    selectedOperation: null,
    selectedPhase: null,
    editing: false,
    editForm: null,
    intent: 0,
    loading: {
      process: true,
      stage: true,
      operation: true,
      phase: true,
    },
    defaultListFields: {
      withStages: false,
      withStagesFull: false,
      withIdeas: false,
    },

    defaultDetailFields: {
      withStages: false,
      withStagesFull: false,
      withIdeas: false,
    },
  }),
  computed: {
    ...mapGetters({
      items: "process/all",
      currentProcess: "process/current",
    }),
    current: {
      get() {
        console.log(this.section);
        return this.currentProcess(this.section);
      },
    },
    maxLevelNumber: {
      get() {
        switch (this.maxLevel) {
          case "phase":
            return 3;
          case "operation":
            return 2;
          case "stage":
            return 1;
          default:
            return 0;
        }
      },
    },
  },
  async mounted() {
    try {
      this.loading.process = true;
      console.log(this.section);
      this.$store.dispatch("process/setCurrentSection", this.section);
      await this.$store.dispatch("process/findAll", {
        filter: null,
        fields: Object.assign({}, this.defaultListFields, this.list),
      });
      this.selectedProcess = this.current.process;
    } finally {
      this.loading.process = false;
    }

    try {
      this.loading.stage = true;
      this.loading.operation = true;
      this.loading.phase = true;
      if (this.current.process) {
        if (this.selectedProcess) {
          if (this.onSelection) {
            await this.onSelection("process", this.current.process);
          }
          this.selectedStage = this.current.stage;
          this.selectedOperation = this.current.operation;
          this.selectedPhase = this.current.phase;
        }
      }
    } finally {
      this.loading.stage = false;
      this.loading.phase = false;
      this.loading.operation = false;
    }
  },
  methods: {
    getIdeasCount(item) {
      if (item.__typename === "Process" && item.stages.length > 0) {
        let count = 0;
        item.stages.forEach(s => {
					console.log(s.ideasCount);
					count += s.ideasCount
				});

        console.log(count);
      }

      if (item.__typename === "ProcessStage" && item.operations.length > 0) {
        return item.ideaCount;
      }
    },
    getCount(section, item) {
      if (!item) {
        return "";
      }
  /*     console.log(this.showCount); */
      switch (this.showCount) {
        case "ideas": {
    /*       console.log(section); */
          if (item.__typename === "Process") {
            let stageIdeaCount = 0;
            if (item.stages.length > 0) {
			/* 				console.log("this.getIdeasCount(item)");*/
							this.getIdeasCount(item);
              item.stages.map((stage) => (stageIdeaCount += stage.ideaCount));
            }
          }

          const count = item.ideasCount;

          return `(${this.$tc("idea.count", count)})`;
        }
        case "toolIdeas": {
          const count = item.toolIdeasCount;
          return `(${this.$tc("idea.count", count)})`;
        }
        case "projects": {
          return `(${this.$tc("project.count", item.projectsCount)})`;
        }
        case "items": {
          switch (section) {
            case "process":
              return `(${this.$tc("stage.count", item.stagesCount)})`;
            case "stage":
              return `(${this.$tc("operation.count", item.operations.length)})`;
            case "operation":
              return `(${this.$tc("phase.count", item.phases.length)})`;
          }
        }
      }
      return "";
    },
    async toggleSection(name) {
      console.log(name);
      if (this.expandedSection === name) {
        this.expandedSection = null;
      } else {
        this.expandedSection = name;
      }

      switch (this.expandedSection) {
        case "process":
          if (this.selectedProcess) {
            this.$nextTick(() => {
              try {
                this.$refs[
                  `process_${this.selectedProcess.id}`
                ][0].scrollIntoView();
                // eslint-disable-next-line
              } catch (ex) {}
            });
          }
          break;
        case "stage":
          if (this.selectedStage) {
            this.$nextTick(() => {
              try {
                this.$refs[
                  `stage_${this.selectedStage.id}`
                ][0].scrollIntoView();
                // eslint-disable-next-line
              } catch (ex) {}
            });
          }
          break;
        case "operation":
          if (this.selectedOperation) {
            this.$nextTick(() => {
              try {
                this.$refs[
                  `operation_${this.selectedOperation.id}`
                ][0].scrollIntoView();
                // eslint-disable-next-line
              } catch (ex) {}
            });
          }
          break;
        case "phase":
          if (this.selectedOperation) {
            this.$nextTick(() => {
              try {
                this.$refs[
                  `phase_${this.selectedPhase.id}`
                ][0].scrollIntoView();
                // eslint-disable-next-line
              } catch (ex) {}
            });
          }
          break;
      }
    },
    toggleSelector() {
      if (this.editing) {
        return;
      }
      this.expanded = !this.expanded;
      this.selectedProcess = this.current.process;
      this.expandedSection = "process";
      this.$store.dispatch("app/showOverlay", {
        show: this.expanded,
        onClick: this.toggleSelector,
      });
    },
    initEdit() {
      if (!this.editing) {
        this.$validator.pause();
        this.$validator.reset();
        if (this.current.process) {
          this.intent++;
          this.editForm = new GQLForm({
            id: this.current.process.id,
            title: this.current.process.title,
          });
          this.expanded = false;
          this.editing = true;
          this.close();
          this.$nextTick(() => {
            this.$refs.editInput.focus();
            this.$validator.reset();
            this.$validator.resume();
          });
        }
      } else {
        this.editing = false;
      }

      this.$store.dispatch("app/showTopNavOnTop", this.editing);

      // this.$store.dispatch("app/showOverlay", {
      //   show: this.editing,
      //   onClick: this.initEdit
      // });
    },
    async saveItem() {
      await this.$validator.validateAll();
      if (!this.vErrors.any()) {
        this.$nextTick(async () => {
          // if (this.selectedProcess.title != this.editForm.fields.title) {
          await this.$store.dispatch("process/update", this.editForm);
          /* this.$store.dispatch(
            "process/setCurrentProcess",
            this.items.find(o => o.id === process.id)
          ); */
          // }
          this.initEdit();
        });
      }
    },
    cancelEdit() {
      this.initEdit();
    },
    close() {
      this.expanded = false;
      this.expandedSection = null;
      this.$store.dispatch("app/showOverlay", {
        show: this.expanded,
        onClick: this.close,
      });
    },
    async selectProcess(process, toggleNext = false) {
      this.loading.stage = true;
      this.loading.operation = true;
      this.loading.phase = true;
      const lastProcess = this.selectedProcess;
      if (
        !process ||
        !lastProcess ||
        lastProcess.id != this.selectedProcess.id
      ) {
        this.selectedOperation = null;
        this.selectedPhase = null;
        this.selectedStage = null;
      }
      if (process) {
        this.selectedProcess = await this.$store.dispatch("process/findById", {
          id: process.id,
          ...Object.assign({}, this.defaultDetailFields, this.detail),
        });
        this.selectedProcess = this.$store.getters["process/all"].find(
          (o) => o.id === process.id
        );
        if (this.onSelection) {
          await this.onSelection("process", this.selectedProcess);
        }
        if (!lastProcess || lastProcess.id != this.selectedProcess.id) {
          this.selectedOperation = null;
          this.selectedPhase = null;
          this.selectedStage = null;
          // this.selectStage(this.selectedProcess.stages[0]);
        }
        this.loading.stage = false;
        this.loading.operation = false;
        this.loading.phase = false;
        if (toggleNext && this.maxLevelNumber > 0) {
          this.toggleSection("stage");
        }
      }
    },
    async selectStage(stage, toggleNext = false) {
      const lastStage = this.selectedStage;
      this.selectedStage = stage;

      if (!this.selectedStage) {
        this.selectOperation(null);
        return;
      }

      if (this.onSelection) {
        await this.onSelection("stage", this.selectedStage);
      }

      if (
        !lastStage ||
        lastStage.id != this.selectedStage.id ||
        !this.selectedOperation
      ) {
        // this.selectOperation(this.selectedStage.operations[0]);
      } else {
        const operation = this.selectedStage.operations.find(
          (i) => i.id === this.selectedOperation.id
        );
        if (!operation) {
          // this.selectOperation(this.selectedStage.operations[0]);
        } else {
          this.selectOperation(operation);
        }
      }
      if (toggleNext && this.maxLevelNumber > 1) {
        this.toggleSection("operation");
      }
    },
    async selectOperation(operation, toggleNext = false) {
      const lastOperation = this.selectedOperation;
      this.selectedOperation = operation;
      if (!this.selectedOperation) {
        this.selectPhase(null);
        return;
      }
      if (this.onSelection) {
        await this.onSelection("operation", this.selectedOperation);
      }
      if (
        !lastOperation ||
        lastOperation.id != this.selectedOperation.id ||
        !this.selectedPhase
      ) {
        // this.selectPhase(this.selectedOperation.phases[0]);
      } else {
        const phase = this.selectedOperation.phases.find(
          (i) => i.id === this.selectedPhase.id
        );
        if (!phase) {
          // this.selectPhase(this.selectedOperation.phases[0]);
        } else {
          this.selectPhase(phase);
        }
      }
      if (toggleNext && this.maxLevelNumber > 2) {
        this.toggleSection("phase");
      }
    },
    async selectPhase(phase) {
      this.selectedPhase = phase;
      if (this.onSelection) {
        await this.onSelection("process", this.selectedPhase);
      }
    },
    async apply() {
      console.log("Set Current Process");
      console.log({
        section: this.section,
        process: this.selectedProcess,
        stage: this.selectedStage,
        operation: this.selectedOperation,
        phase: this.selectedPhase,
      });
      await this.$store.dispatch("process/setCurrentProcess", {
        section: this.section,
        process: this.selectedProcess,
        stage: this.selectedStage,
        operation: this.selectedOperation,
        phase: this.selectedPhase,
      });
      if (this.onApply) {
        window.vm.$emit("process_processChange");
        this.onApply({
          section: this.section,
          process: this.selectedProcess,
          stage: this.selectedStage,
          operation: this.selectedOperation,
          phase: this.selectedPhase,
        });
      }
      // await this.$store.dispatch("process/setCurrentStage", this.selectedStage);
      this.close();
    },
  },
};
</script>
