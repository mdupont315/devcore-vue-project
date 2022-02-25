<template>
  <div
    class="process-stage"
    :class="{ 'enable-drag': !editing, active: editing, collapsed: collapsed }"
  >
    <b-card no-body class="stage-card">
      <div v-if="item">
        <b-card-header class="header">
          <div class="tools">
            <span class="expander" @click="toggleCollapse"></span>
          </div>
          <div
            style="
              justify-content: space-between;
              justify-items: flex-end;
              display: flex;
            "
          >
            <div class="header p-0" style="width: 90%">
              <div
                class="title pl-0"
                style="display: flex; justify-content: space-between"
              >
                <div
                  class="
                    h5
                    m-0
                    text-capitalize text-left text-overflow text-bold
                  "
                >
                  {{ item.title }}
                </div>
              </div>
            </div>
            <div
              style="
                cursor: pointer;
                align-self: center;
                width: 10%;
                margin-left: 18px;
              "
              v-if="$can('process/stage/update', item)"
              class="btn-action"
              @click="toggleEdit"
            >
              <i class="mdi mdi-pencil"></i>
            </div>
          </div>
          <hr class="m-0 mt-2" />
          <div class="companyRoles">
            <div v-if="item.companyRoles && item.companyRoles.length > 0">
              <div class="stacked-avatars left" style="display: block">
                <div
                  v-for="role in item.companyRoles"
                  :key="role.id"
                  v-b-tooltip="{ placement: 'top', boundary: 'viewport' }"
                  class="avatar-item"
                  style="max-width: 20px; max-height: 20px"
                  :title="role.name"
                >
                  <img :src="role.getAvatarUrl('50x50')" height="20" />
                </div>
              </div>

              <hr class="my-0" />
            </div>
          </div>
        </b-card-header>
        <b-card-body>
          <draggable
            v-model="operations"
            class="sortable-wrapper"
            group="operations"
            v-bind="{
              disabled: orderBusy || editingCard || show_inner_overlay,
              draggable: '.enable-drag',
              animation: 200,
              filter: '.busy',
            }"
            @change="onOperationDrag"
          >
            <operation-card
              v-for="operation in operations"
              :key="operation.id"
              class="operation item"
              :item="operation"
              :stage="item"
              @editing="editingOperation"
            ></operation-card>
          </draggable>
          <action-card
            ref="newOperationCard"
            class="primary busy"
            @beforeModeChange="prepareOperation"
            @beforeToggle="prepareOperation"
          >
            <template slot="placeholder">
              <b-button variant="primary" class size="lg" block>
                <i class="mdi mdi-plus"></i>
                {{ $t("Add operation") }}
              </b-button>
            </template>
            <operation-form
              v-model="newOperation"
              :stage="item"
              @close="closeOperationForm"
            ></operation-form>
          </action-card>
        </b-card-body>
      </div>
      <div v-else>create new stage</div>
    </b-card>
    <div v-if="editForm" class="form">
      <layer :key="intent" style="width: 100%" @closed="cancelEdit">
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
                  <div
                    ref="editRolesPlaceholder"
                    style="height: 1px; position: absolute; width: 100%"
                  ></div>
                  <div class="form-group my-0">
                    <b-textarea
                      :key="intent"
                      v-model="editForm.title"
                      v-autofocus="true"
                      v-autoresize
                      v-validate="'required|min:4'"
                      class="no-style my-0"
                      style="min-height: 70px; overflow: hidden"
                      :state="$validateState('title', editForm)"
                      name="title"
                    ></b-textarea>
                    <b-form-invalid-feedback>{{
                      $displayError("title", editForm)
                    }}</b-form-invalid-feedback>
                  </div>
                </b-card>
                <div class="mt-3">
                  <loading-button
                    :loading="editForm.busy"
                    :disabled="vErrors.any() || editForm.busy"
                    size="md"
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
            placement="right"
            :show="true"
            :target="() => $refs.editRolesPlaceholder"
            custom-class="no-arrow transparent"
          >
            <b-card
              class="bg-light shadow-sm"
              no-body
              style="width: 210px; margin-top: 15px"
            >
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
                      :show-add-btn="$can('core/companyRole/create')"
                      @close="toggleRolesPopover"
                    ></company-role-selector>
                  </div>
                </b-popover>
              </b-card-footer>
            </b-card>
            <div v-if="$can('process/stage/delete', editItem)" class="mt-2">
              <confirm-button
                variant="transparent"
                :confirm-message="$t('This action cannot be undone!')"
                :confirm-title="$t('Delete stage') + '?'"
                :confirm-text="$t('Delete stage')"
                btn-class="text-white border outline-none"
                size="xs"
                :show-overlay="false"
                block
                @confirm="deleteItem"
                >{{ $t("Delete stage") }}</confirm-button
              >
            </div>
          </b-popover>
        </b-form>
      </layer>
    </div>
  </div>
</template>

<script>
import draggable from "vuedraggable";
import { /* mapState, */ mapGetters } from "vuex";
import GQLForm from "@/lib/gqlform";
import { ProcessStage, ProcessOperation } from "@/models";
import OperationCard from "../operation/Card";
import OperationForm from "../operation/Form";

export default {
  components: {
    "operation-card": OperationCard,
    "operation-form": OperationForm,
    draggable,
  },
  props: {
    item: {
      required: false,
    },
    mode: {
      required: false,
    },
  },
  data: () => ({
    showOverlay: false,
    showMenu: false,
    collapsed: true,
    editing: false,
    editingCard: false,
    editForm: null,
    editItem: null,
    intent: 0,
    showRolesPopover: false,
    orderBusy: false,
    newOperation: null,
  }),
  computed: {
    ...mapGetters({
      companyRoles: "companyRole/all",
      show_inner_overlay: "app/show_inner_overlay",
    }),
    selectedRoles: {
      get() {
        return this.companyRoles
          .filter((r) => this.editForm.companyRoles.includes(r.id))
          .sort((a, b) => (a.name > b.name ? 1 : -1));
      },
    },
    operations: {
      get() {
        return [...this.item.operations].sort((a, b) => {
          return a.dOrder > b.dOrder ? 1 : -1;
        });
      },
      set(value) {
        this.item.operations = value.sort((a, b) => {
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
          this.editItem = new ProcessStage().deserialize(this.item);
          this.editForm = new GQLForm({
            id: this.editItem.id,
            processId: this.editItem.processId,
            title: this.editItem.title,
            companyRoles: this.editItem.companyRoles.map((r) => r.id),
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
        await this.$store.dispatch("processStage/update", this.editForm);
        this.cancelEdit();
      }
    },
    async deleteItem() {
      this.$emit("editing", false);
      await this.$store.dispatch("processStage/delete", this.editForm);
      this.cancelEdit();
    },
    cancelEdit() {
      this.$validator.pause();
      this.$validator.reset();
      this.editing = false;
      this.editItem = null;
      this.editForm = null;
      this.showOverlay = false;
      this.$emit("editing", false);
      this.$store.dispatch("app/showInnerOverlay", false);
    },
    async onOperationDrag(event) {
      try {
        this.orderBusy = true;
        if (event.moved && event.moved.newIndex != event.moved.oldIndex) {
          const newOrder = event.moved.newIndex + 1;
          event.moved.element.dOrder = newOrder;
          await this.$store.dispatch(
            "processOperation/updateOrder",
            new GQLForm({
              id: event.moved.element.id,
              dOrder: newOrder,
              stageId: event.moved.element.stageId,
            })
          );
        }
        if (event.added) {
          const newOrder = event.added.newIndex + 1;
          event.added.element.dOrder = newOrder;
          await this.$store.dispatch(
            "processOperation/update",
            new GQLForm({
              id: event.added.element.id,
              stageId: this.item.id,
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
    editingOperation(editing) {
      this.editingCard = editing;
      this.$emit("editing", editing);
    },
    prepareOperation() {
      this.newOperation = new ProcessOperation().deserialize({
        stageId: this.item.id,
        companyRoles: [],
      });
      this.$nextTick(() => {
        document.getElementById("main").scrollTop =
          this.$refs.newOperationCard.$el.offsetTop - 150;
      });
    },
    closeOperationForm() {
      this.$store.dispatch("app/showInnerOverlay", false);
      this.$refs.newOperationCard.changeMode(null);
    },
  },
};
</script>
