<template>
  <div class="page animated fadeIn fast pg-process">
    <div v-if="process && process.loaded && allProcess.length > 0">
      <unblock-loader position="bottom" v-if="busy"></unblock-loader>
      <div class="editable-dashboard" id="process-page-content" v-if="process">
        <draggable
          v-model="stages"
          class="sortable-wrapper t01 horizontal"
          @change="changeOrder"
          v-bind="{disabled:busy||editingCard, draggable:'.enable-drag', animation:200, filter:'.busy .newItem'}"
        >
          <stage-card
            class="item sortable-item"
            :class="{'busy':busy}"
            v-for="item in stages"
            :key="item.id"
            :item="item"
            @editing="editing"
          ></stage-card>
          <action-card
            ref="newStageCard"
            class="item newItem"
            @beforeModeChange="prepareStage"
            @beforeToggle="prepareStage"
          >
            <template slot="placeholder">
              <b-button block size="lg" variant="dark-ligth">
                <i class="mdi mdi-plus"></i>
                {{ $t('Add stage')}}
              </b-button>
            </template>

            <stage-form v-model="newStage" @close="closeStageForm"></stage-form>
          </action-card>
        </draggable>
      </div>
    </div>
    <page-loader v-if="process && !process.loaded"></page-loader>
    <empty-page v-if="allProcess.length === 0"></empty-page>
  </div>
</template>
<script>
import GQLForm from "@/lib/gqlform";
import { /*mapState,*/ mapGetters } from "vuex";
import draggable from "vuedraggable";
import StageCard from "./stage/Card";
import StageForm from "./stage/Form";
import { ProcessStage } from "@/models";
import { scrollLeftToElement } from "@/lib/utils";
export default {
  components: {
    "stage-card": StageCard,
    "stage-form": StageForm,
    draggable: draggable
  },
  data: () => ({
    busy: false,
    dataStages: [],
    newStage: null,
    editingCard: false
  }),
  computed: {
    ...mapGetters({
      current: "process/current",
      allProcess: "process/all"
    }),
    currentProcess: {
      get: function() {
        return this.current("process");
      }
    },
    process: {
      get: function() {
        return this.currentProcess && this.currentProcess.process
          ? this.currentProcess.process
          : null;
      }
    },
    stages: {
      get: function() {
        return [...this.process.stages].sort((a, b) => {
          return a.dOrder > b.dOrder ? 1 : -1;
        });
      },
      set: function(value) {
        this.process.stages = value.sort((a, b) => {
          return a.dOrder > b.dOrder ? 1 : -1;
        });
      }
    }
  },
  async mounted() {
    this.load();

    //this.constructStages();
    window.vm.$on("addStage", this.addStage);
  },
  beforeDestroy() {
    window.vm.$off("addStage", this.addStage);
  },
  methods: {
    async load() {
      //the topbar will load
      //this.$store.dispatch("process/findAll");
      if (this.process) {
        await this.$store.dispatch("process/findById", { id: this.process.id });
      }
    },
    calculateWidth() {
      return (this.items.length + 1) * 360 + "px";
    },
    constructStages() {
      if (!this.process) {
        this.stages = [];
        return;
      }
      if (!this.process.stages) {
        this.stages = [];
        return;
      }

      this.stages = [...this.process.stages].sort((a, b) => {
        return a.dOrder > b.dOrder ? 1 : -1;
      });
    },
    async changeOrder(event) {
      
      if (event.moved && event.moved.newIndex != event.moved.oldIndex) {
        const newOrder = event.moved.newIndex + 1;
        event.moved.element.dOrder = newOrder;
        try {
          this.busy = true;
          await this.$store.dispatch(
            "processStage/updateOrder",
            new GQLForm({
              id: event.moved.element.id,
              dOrder: newOrder,
              processId: this.currentProcess.process.id
            })
          );

          

          await this.$store.dispatch("process/findById", {
            id: this.process.id,
            withStagesFull: true,
            force: true
          });
          // eslint-disable-next-line
        } catch (ex) {
          //dont care about the error
        } finally {
          this.busy = false;
        }

        //this.constructStages();
      }
    },
    prepareStage() {
      this.newStage = new ProcessStage().deserialize({
        processId: this.process.id,
        companyRoles: []
      });
    },
    addStage() {
      this.$refs.newStageCard.changeMode("create");
      scrollLeftToElement(this.$refs.newStageCard.$el);
    },
    closeStageForm() {
      this.$store.dispatch("app/showInnerOverlay", false);
      this.$refs.newStageCard.changeMode(null);
    },
    editing(editing) {
      this.editingCard = editing;
    }
  }
};
</script>