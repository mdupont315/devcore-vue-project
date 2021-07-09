<template>
  <div
    v-if="item"
    ref="operation"
    class="process-operation"
    :class="{ 'enable-drag': !editing, active: editing, collapsed: collapsed }"
    style="position: relative"
  >
    <b-card no-body class="shadow-sm mb-3 bg-white border stage-card">
      <div v-if="item">
        <b-card-header class="header">
          <div
            class="title pl-0"
            style="
              justify-content: space-between;
              justify-items: flex-end;
              display: flex;
							padding: 0;
            "
          >
            <div style="align-self: center">
              <div
                class="h5 m-0 text-capitalize text-left text-overflow text-bold"
                style="flex-grow: 4"
              >
                {{ item.title }}
              </div>
            </div>
            <div style="display:flex">
              <div
                class="btn-action2"
                @click="toggleView"
                style="margin-right: 10px;cursor:pointer"
              >
                <i class="mdi mdi-eye"></i>
              </div>
              <div
                v-if="$can('process/operation/update', item)"
                class="btn-action2"
                @click="toggleEdit"
								style="cursor:pointer"
              >
                <i class="mdi mdi-pencil"></i>
              </div>
            </div>
          </div>
        </b-card-header>
        <b-card-body class="pt-0">
          <p class="p-0 m-0 text-gray text-justify text-multiline" style>
            {{ item.description }}
          </p>
          <div>
            <div
              v-if="item.companyRoles && item.companyRoles.length > 0"
              class="stacked-avatars px-0"
            >
              <div
                v-for="role in item.companyRoles"
                :key="role.id"
                v-b-tooltip="{ placement: 'top', boundary: 'viewport' }"
                class="avatar-item"
                :title="role.name"
              >
                <img :src="role.getAvatarUrl('50x50')" height="21" />
              </div>
            </div>
          </div>
          <div class="list-group border-0 border-top-1">
            <dragable
              v-model="phases"
              class
              v-bind="{
                disabled: orderBusy || editingCard,
                group: 'phases',
                draggable: '.enable-drag',
                animation: 200,
                filter: '.busy',
              }"
              @change="onPhaseDrag"
            >
              <phase-card
                v-for="phase in phases"
                :key="phase.id"
                class="item"
                :item="phase"
                :operation="item"
                @editing="editingPhase"
              ></phase-card>
            </dragable>
            <action-card
              ref="newPhaseCard"
              class="primary list-group-item"
              @beforeModeChange="preparePhase"
              @beforeToggle="preparePhase"
            >
              <template slot="placeholder">
                <b-button
                  variant="transparent"
                  class="text-primary p-3"
                  size="md"
                  block
                >
                  <i class="mdi mdi-plus"></i>
                  {{ $t("Add phase") }}
                </b-button>
              </template>
              <phase-form
                v-model="newPhase"
                :operation="item"
                @close="closePhaseForm"
              ></phase-form>
            </action-card>
          </div>
        </b-card-body>
      </div>
      <div v-else>create new phase</div>
    </b-card>

    <div v-if="viewing" class="view-container">
      <layer>
        <div style="height: 1px"></div>
        <div
          v-if="showViewPopover"
          class="overlay transparent"
          @click="closeViewPopover"
        />
        <div>
          <b-row>
            <b-col>
              <b-card class="bg-white shadow-sm" style="padding: 10px" no-body>
                <div class="form-group my-0 title">
                  {{ item.title }}
                </div>
                <div class="form-group my-0">
                  {{ item.description }}
                </div>
                <div>
                  <ul
                    v-if="item.companyRoles && item.companyRoles.length > 0"
                    class="list-inline break mb-0"
                  >
                    <li
                      v-for="role in item.companyRoles"
                      :key="role.id"
                      class="list-inline-item my-1 mx-1"
                    >
                      <img
                        v-b-tooltip.hover
                        :src="role.getAvatarUrl('50x50')"
                        class="rounded rounded-circle border"
                        height="30"
                        :title="role.name"
                      />
                    </li>
                  </ul>
                </div>
              </b-card>
            </b-col>
          </b-row>
        </div>
      </layer>
    </div>
    <div v-if="editForm" class="form">
      <layer :key="intent" @closed="cancelEdit">
        <div ref="editRolesPlaceholder" style="height: 1px"></div>
        <div
          v-if="showRolesPopover"
          class="overlay transparent"
          @click="closeRolesPopover"
        />
        <b-form @submit.prevent="saveItem">
          <div>
            <b-row>
              <b-col>
                <b-card class="bg-white shadow-sm" no-body>
                  <div class="form-group my-0">
                    <b-input
                      :key="intent"
                      v-model="editForm.title"
                      v-autofocus="true"
                      v-autoresize
                      v-validate="'required|min:4'"
                      class="no-style my-0"
                      style="min-height: 20px; height: 30px; overflow: hidden"
                      :state="$validateState('title', editForm)"
                      :placeholder="$t('Operation name')"
                      name="title"
                    ></b-input>
                    <b-form-invalid-feedback>{{
                      $displayError("title", editForm)
                    }}</b-form-invalid-feedback>
                  </div>
                  <div class="form-group my-0">
                    <b-textarea
                      :key="intent"
                      v-model="editForm.description"
                      v-autoresize
                      class="no-style my-0"
                      style="min-height: 20px; overflow: hidden"
                      :placeholder="$t('Operation description')"
                      :state="$validateState('description', editForm)"
                      name="description"
                    ></b-textarea>
                    <b-form-invalid-feedback>{{
                      $displayError("description", editForm)
                    }}</b-form-invalid-feedback>
                  </div>
                </b-card>
                <div class="mt-3">
                  <loading-button
                    size="md"
                    :loading="editForm.busy"
                    :disabled="vErrors.any() || editForm.busy"
                    type="submit"
                    class="padding shadow-sm"
                    >{{ $t("Save") }}</loading-button
                  >
                </div>
              </b-col>
            </b-row>
          </div>
          <b-popover
            :key="intent"
            placement="rightbottom"
            :show="true"
            :target="() => $refs.editRolesPlaceholder"
            custom-class="no-arrow transparent offset-t-5"
          >
            <b-card class="bg-light shadow-sm" no-body style="width: 210px">
              <b-card-body>
                <ul
                  v-if="
                    editForm.companyRoles && editForm.companyRoles.length > 0
                  "
                  class="list-inline break mb-0"
                >
                  <li
                    v-for="role in selectedRoles"
                    :key="role.id"
                    class="list-inline-item my-1 mx-1"
                  >
                    <img
                      v-b-tooltip.hover
                      :src="role.getAvatarUrl('50x50')"
                      class="rounded rounded-circle border"
                      height="30"
                      :title="role.name"
                    />
                  </li>
                </ul>
                <span v-else class="text-dark"
                  >{{ $t("No") }} {{ $t("roles") }} {{ $t("selected") }}</span
                >
              </b-card-body>
              <b-card-footer class="mx-2">
                <b-button
                  ref="btnAssignRoles"
                  block
                  variant="white"
                  class="text-primary"
                  size="md"
                  @click="toggleRolesPopover"
                  >+ {{ $t("Assign roles") }}</b-button
                >
                <b-popover
                  :target="() => $refs.btnAssignRoles"
                  placement="bottom"
                  custom-class="offset-t-5"
                  :show.sync="showRolesPopover"
                >
                  <div style="width: 210px; overflow: hidden" class="rounded">
                    <company-role-selector
                      :key="intent"
                      v-model="editForm.companyRoles"
                      selector-class="rounded"
                      :show-input="false"
                      :show-footer-selection="false"
                      :show-footer-display="false"
                      :items="availableRoles"
                      :show-add-btn="$can('core/companyRole/create')"
                      @close="toggleRolesPopover"
                    ></company-role-selector>
                  </div>
                </b-popover>
              </b-card-footer>
            </b-card>
            <div v-if="$can('process/operation/delete', editItem)" class="mt-2">
              <confirm-button
                variant="transparent"
                :confirm-message="$t('This action cannot be undone!')"
                :confirm-title="$t('Delete operation') + '?'"
                :confirm-text="$t('Delete operation')"
                btn-class="text-white border outline-none"
                size="xs"
                :show-overlay="false"
                block
                @confirm="deleteItem"
                >{{ $t("Delete operation") }}</confirm-button
              >
            </div>
          </b-popover>
        </b-form>
      </layer>
    </div>
  </div>
</template>
<script>
import { /* mapState, */ mapGetters } from "vuex";
import draggable from "vuedraggable";
import GQLForm from "@/lib/gqlform";
import { ProcessOperation, ProcessPhase } from "@/models";
import PhaseCard from "../phase/Card";
import PhaseForm from "../phase/Form";

export default {
  components: {
    dragable: draggable,
    "phase-card": PhaseCard,
    "phase-form": PhaseForm,
  },
  props: {
    item: {
      required: false,
    },
    stage: {
      required: true,
    },
    mode: {
      required: false,
    },
    moving: {
      required: false,
    },
  },
  data: () => ({
    collapsed: true,
    showOverlay: false,
    showMenu: false,
    editing: false,
    viewing: false,
    editingCard: false,
    editForm: null,
    editItem: null,
    orderBusy: false,
    newPhase: null,
    intent: 0,
    showRolesPopover: false,
    showViewPopover: false,
  }),
  computed: {
    ...mapGetters({
      allRoles: "companyRole/all",
    }),
    availableRoles: {
      get() {
        // return this.stage.companyRoles.map(r =>
        //   this.allRoles.find(o => o.id === r.id)
        // );
        return this.allRoles;
      },
    },
    selectedRoles: {
      get() {
        return this.availableRoles
          .filter((r) => this.editForm.companyRoles.includes(r.id))
          .sort((a, b) => (a.name > b.name ? 1 : -1));
      },
    },
    phases: {
      get() {
        return [...this.item.phases].sort((a, b) => {
          return a.dOrder > b.dOrder ? 1 : -1;
        });
      },
      set(value) {
        this.item.phases = value.sort((a, b) => {
          return a.dOrder > b.dOrder ? 1 : -1;
        });
      },
    },
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
      // this.showOverlay=this.showMenu;
    },
    hideMenu() {
      this.showMenu = false;
      // this.showOverlay=false;
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
            companyRoles: this.editItem.companyRoles.map((r) => r.id),
          });
          this.$validator.reset();
          this.$validator.resume();
        }
      }
    },
    toggleView() {
      this.$store.dispatch("app/showInnerOverlay");
      this.showOverlay = !this.showOverlay;
      this.viewing = !this.viewing;
      this.$emit("viewing", this.viewing);
    },
    toggleOverlay() {
      if (this.editing) {
        this.toggleEdit();
      }
    },
    toggleRolesPopover() {
      this.showRolesPopover = !this.showRolesPopover;
    },
    toggleViewPopover() {
      this.showViewPopover = !this.showViewPopover;
    },
    closeRolesPopover() {
      this.showRolesPopover = false;
    },
    closeViewPopover() {
      this.showViewPopover = false;
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
        companyRoles: [],
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
              dOrder: newOrder,
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
              companyRoles: event.added.element.companyRoles.map((i) => i.id),
              title: event.added.element.title,
              description: event.added.element.description,
            })
          );
        }
        // eslint-disable-next-line
      } catch (ex) {
        console.log(ex);
        // dont care about the error
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
    },
  },
};
</script>
