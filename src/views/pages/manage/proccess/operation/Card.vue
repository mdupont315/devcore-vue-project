<template>
  <div
    class="process-operation"
    :class="{'enable-drag':!editing, 'active':editing, 'collapsed':collapsed}"
    v-if="item"
    ref="operation"
  >
    <b-card no-body class="shadow-sm mb-3 bg-white border stage-card">
      <div v-if="item">
        <b-card-header class="header">
          <!-- <div class="tools">
            <span class="expander" @click="toggleCollapse"></span>
          </div>-->
          <div class="title pl-0">
            <h2 class="h5 m-0 text-capitalize text-left text-overflow text-bold">{{ item.title }}</h2>
            <div class="tools">
              <span
                class="btn-action"
                @click="toggleEdit"
                v-if="$can('process/operation/update', item)"
              >
                <i class="mdi mdi-pencil"></i>
              </span>
            </div>
          </div>
        </b-card-header>
        <b-card-body class="pt-0">
          <p class="p-0 m-0 text-gray text-justify text-multiline" style>{{ item.description }}</p>
          <div>
            <div
              class="stacked-avatars px-0"
              v-if="item.companyRoles && item.companyRoles.length>0"
            >
              <div
                v-for="role in item.companyRoles"
                :key="role.id"
                class="avatar-item"
                v-b-tooltip="{  placement: 'top', boundary:'viewport' }"
                :title="role.name"
              >
                <img :src="role.getAvatarUrl('50x50')" height="21" />
              </div>
            </div>
          </div>
          <div class="list-group border-0 border-top-1">
            <dragable
              class
              v-model="phases"
              @change="onPhaseDrag"
              v-bind="{disabled:orderBusy||editingCard, group:'phases', draggable:'.enable-drag', animation:200, filter:'.busy'}"
            >
              <phase-card
                @editing="editingPhase"
                v-for="phase in phases"
                class="item"
                :key="phase.id"
                :item="phase"
                :operation="item"
              ></phase-card>
            </dragable>
            <action-card
              ref="newPhaseCard"
              class="primary list-group-item"
              @beforeModeChange="preparePhase"
              @beforeToggle="preparePhase"
            >
              <template slot="placeholder">
                <b-button variant="transparent" class="text-primary p-3" size="md" block>
                  <i class="mdi mdi-plus"></i>
                  {{ $t('Add phase')}}
                </b-button>
              </template>
              <phase-form v-model="newPhase" @close="closePhaseForm" :operation="item"></phase-form>
            </action-card>
          </div>
        </b-card-body>
      </div>
      <div v-else>create new phase</div>
    </b-card>

    <div class="form" v-if="editForm">
      <layer :key="intent" @closed="cancelEdit">
        <div ref="editRolesPlaceholder" style="height:1px"></div>
        <div class="overlay transparent" @click="closeRolesPopover" v-if="showRolesPopover" />
        <b-form @submit.prevent="saveItem">
          <div>
            <b-row>
              <b-col>
                <b-card class="bg-white shadow-sm" no-body>
                  <div class="form-group my-0">
                    <b-input
                      v-model="editForm.title"
                      class="no-style my-0"
                      style="min-height:20px; height:30px; overflow:hidden"
                      v-autofocus="true"
                      v-autoresize
                      :state="$validateState('title', editForm)"
                      v-validate="'required|min:4'"
                      :placeholder="$t('Operation name')"
                      name="title"
                      :key="intent"
                    ></b-input>
                    <b-form-invalid-feedback>{{ $displayError('title', editForm) }}</b-form-invalid-feedback>
                  </div>
                  <div class="form-group my-0">
                    <b-textarea
                      v-model="editForm.description"
                      class="no-style my-0"
                      style="min-height:20px; overflow:hidden"
                      v-autoresize
                      :placeholder="$t('Operation description')"
                      :state="$validateState('description', editForm)"
                      name="description"
                      :key="intent"
                    ></b-textarea>
                    <b-form-invalid-feedback>{{ $displayError('description', editForm) }}</b-form-invalid-feedback>
                  </div>
                </b-card>
                <div class="mt-3">
                  <loading-button
                    size="md"
                    :loading="editForm.busy"
                    :disabled="vErrors.any() || editForm.busy"
                    type="submit"
                    class="padding shadow-sm"
                  >{{ $t('Save') }}</loading-button>
                </div>
              </b-col>
            </b-row>
          </div>
          <b-popover
            placement="rightbottom"
            :show="true"
            :target="()=>$refs.editRolesPlaceholder"
            custom-class="no-arrow transparent offset-t-5"
            :key="intent"
          >
            <b-card class="bg-light shadow-sm" no-body style="width:210px">
              <b-card-body>
                <ul
                  class="list-inline break mb-0"
                  v-if="editForm.companyRoles && editForm.companyRoles.length>0"
                >
                  <li
                    class="list-inline-item my-1 mx-1"
                    v-for="role in selectedRoles"
                    :key="role.id"
                  >
                    <img
                      :src="role.getAvatarUrl('50x50')"
                      class="rounded rounded-circle border"
                      height="30"
                      v-b-tooltip.hover
                      :title="role.name"
                    />
                  </li>
                </ul>
                <span v-else class="text-dark">{{ $t('No') }} {{ $t('roles') }} {{ $t('selected') }}</span>
              </b-card-body>
              <b-card-footer class="mx-2">
                <b-button
                  block
                  variant="white"
                  class="text-primary"
                  size="md"
                  ref="btnAssignRoles"
                  @click="toggleRolesPopover"
                >+ {{$t('Assign roles')}}</b-button>
                <b-popover
                  :target="()=>$refs.btnAssignRoles"
                  placement="bottom"
                  custom-class="offset-t-5"
                  :show.sync="showRolesPopover"
                >
                  <div style="width:210px; overflow:hidden;" class="rounded">
                    <company-role-selector
                      v-model="editForm.companyRoles"
                      :key="intent"
                      selector-class="rounded"
                      :show-input="false"
                      :show-footer-selection="false"
                      :showFooterDisplay="false"
                      @close="toggleRolesPopover"
                      :items="availableRoles"
                      :show-add-btn="$can('core/companyRole/create')"
                    ></company-role-selector>
                  </div>
                </b-popover>
              </b-card-footer>
            </b-card>
            <div class="mt-2" v-if="$can('process/operation/delete', editItem)">
              <confirm-button
                variant="transparent"
                :confirmMessage="$t('This action cannot be undone!')"
                :confirmTitle="$t('Delete operation')+'?'"
                :confirmText="$t('Delete operation')"
                btnClass="text-white border outline-none"
                size="xs"
                :showOverlay="false"
                block
                @confirm="deleteItem"
              >{{ $t('Delete operation') }}</confirm-button>
            </div>
          </b-popover>
        </b-form>
      </layer>
    </div>
  </div>
</template>
<script>
import GQLForm from "@/lib/gqlform";
import { ProcessOperation, ProcessPhase } from "@/models";
import PhaseCard from "../phase/Card";
import PhaseForm from "../phase/Form";
import { /*mapState,*/ mapGetters } from "vuex";

import draggable from "vuedraggable";
export default {
  props: {
    item: {
      required: false
    },
    stage: {
      required: true
    },
    mode: {
      required: false
    },
    moving: {
      required: false
    }
  },
  components: {
    dragable: draggable,
    "phase-card": PhaseCard,
    "phase-form": PhaseForm
  },
  data: () => ({
    collapsed: true,
    showOverlay: false,
    showMenu: false,
    editing: false,
    editingCard: false,
    editForm: null,
    editItem: null,
    orderBusy: false,
    newPhase: null,
    intent: 0,
    showRolesPopover: false
  }),
  computed: {
    ...mapGetters({
      allRoles: "companyRole/all"
    }),
    availableRoles: {
      get() {
        // return this.stage.companyRoles.map(r =>
        //   this.allRoles.find(o => o.id === r.id)
        // );
        return this.allRoles;
      }
    },
    selectedRoles: {
      get() {
        return this.availableRoles
          .filter(r => this.editForm.companyRoles.includes(r.id))
          .sort((a, b) => (a.name > b.name ? 1 : -1));
      }
    },
    phases: {
      get: function() {
        return [...this.item.phases].sort((a, b) => {
          return a.dOrder > b.dOrder ? 1 : -1;
        });
      },
      set: function(value) {
        this.item.phases = value.sort((a, b) => {
          return a.dOrder > b.dOrder ? 1 : -1;
        });
      }
    }
  },
  async mounted() {
    await this.$store.dispatch("companyRole/findAll");
  },
  methods: {
    toggleCollapse() {
      this.collapsed = !this.collapsed;
    },
    toggleMenu() {
      this.showMenu = !this.showMenu;
      //this.showOverlay=this.showMenu;
    },
    hideMenu() {
      this.showMenu = false;
      //this.showOverlay=false;
    },
    toggleEdit() {
      this.$store.dispatch("app/showInnerOverlay");
      this.showOverlay = !this.showOverlay;
      this.editing = !this.editing;
      this.$emit("editing", this.editing);
      if (this.editing) {
        this.$validator.pause();
        this.$validator.reset();
        if (this.item) {
          this.intent++;
          this.editItem = new ProcessOperation().deserialize(this.item);
          this.editForm = new GQLForm({
            id: this.editItem.id,
            stageId: this.editItem.stageId,
            title: this.editItem.title,
            description: this.editItem.description,
            companyRoles: this.editItem.companyRoles.map(r => r.id)
          });
          this.$validator.reset();
          this.$validator.resume();
        }
      }
    },
    toggleOverlay() {
      if (this.editing) {
        this.toggleEdit();
      }
    },
    toggleRolesPopover() {
      this.showRolesPopover = !this.showRolesPopover;
    },
    closeRolesPopover() {
      this.showRolesPopover = false;
    },
    async saveItem() {
      await this.$validator.validateAll();
      if (!this.vErrors.any()) {
        await this.$validator.reset();
        await this.$store.dispatch("processOperation/update", this.editForm);
        this.cancelEdit();
      }
    },
    async deleteItem() {
      this.$emit("editing", false);
      await this.$store.dispatch("processOperation/delete", this.editForm);
      this.cancelEdit();
    },
    preparePhase() {
      this.newPhase = new ProcessPhase().deserialize({
        operationId: this.item.id,
        companyRoles: []
      });
      this.$nextTick(() => {
        document.getElementById("main").scrollTop =
          this.$refs.operation.offsetTop +
          this.$refs.newPhaseCard.$el.offsetTop -
          150;
      });
    },
    async onPhaseDrag(event) {
      try {
        this.orderBusy = true;
        if (event.moved && event.moved.newIndex != event.moved.oldIndex) {
          const newOrder = event.moved.newIndex + 1;
          event.moved.element.dOrder = newOrder;
          await this.$store.dispatch(
            "processPhase/updateOrder",
            new GQLForm({
              id: event.moved.element.id,
              operationId: event.moved.element.operationId,
              dOrder: newOrder
            })
          );
        }
        if (event.added) {
          const newOrder = event.added.newIndex + 1;
          event.added.element.dOrder = newOrder;
          await this.$store.dispatch(
            "processPhase/update",
            new GQLForm({
              id: event.added.element.id,
              operationId: this.item.id,
              dOrder: newOrder,
              companyRoles: event.added.element.companyRoles.map(i => i.id),
              title: event.added.element.title,
              description: event.added.element.description
            })
          );
        }
        // eslint-disable-next-line
      } catch (ex) {
        console.log(ex);
        //dont care about the error
      } finally {
        this.orderBusy = false;
      }
    },
    closePhaseForm() {
      this.$store.dispatch("app/showInnerOverlay", false);
      this.$refs.newPhaseCard.changeMode(null);
    },
    editingPhase(editing) {
      this.editingCard = editing;
      this.$emit("editing", editing);
    },
    cancelEdit() {
      this.$emit("editing", false);
      this.$store.dispatch("app/showInnerOverlay", false);
      this.$validator.pause();
      this.$validator.reset();
      this.editing = false;
      this.editItem = null;
      this.editForm = null;
      this.showOverlay = false;
    }
  }
};
</script>