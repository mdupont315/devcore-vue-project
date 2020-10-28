<template>
  <div
    class="process-stage"
    :class="{'enable-drag':!editing, 'active':editing, 'collapsed':collapsed}"
  >
    <b-card no-body class="stage-card" >
      <div v-if="item" >
        <b-card-header class="header">
         
          <layer v-if="editing" @closed="initEdit">
            <div class="edit" style="width:300px; left:0">
              <label class="label">{{ $t('Name of process') }}</label>
              <div class="d-flex flex-row">
                <div class="flex-grow-1 position-relative">
                  <b-input
                    v-model="editForm.title"
                    size="sm"
                    name="title"
                    :disabled="editForm.busy"
                    ref="editInput"
                    class="no-focus-style"
                    style="margin:0!important"
                    :state="$validateState('title', editForm)"
                    v-validate="'required|min:4'"
                  />
                  <b-form-invalid-feedback>{{ $displayError('title', editForm) }}</b-form-invalid-feedback>
                </div>
                <b-button
                  :disabled="vErrors.any()"
                  size="xs"
                  variant="transparent"
                  class="action mdi mdi-check text-success font-15x m-0 outline-none"
                  @click="saveItem"
                  :title="$t('Save')"
                ></b-button>
                <b-button
                  size="xs"
                  variant="transparent"
                  class="action mdi mdi-close text-danger font-15x m-0 outline-none"
                  @click="cancelEdit"
                  :title="$t('Cancel')"
                ></b-button>
              </div>
            </div>
          </layer>

          <div >
          <div class="title">
            <h2 class="h4 m-0 text-capitalize text-center text-overflow text-bold pointer-selection" @click="changeProcess" >{{ item.title }}</h2>
            <div class="tools">
            <span
                    class="btn-action"
                    @click="toggleEdit"
                    
                  >
                    <i class="mdi mdi-pencil"></i>
                  </span>
             </div>
          </div>
          <div class="card-body pointer-selection" @click="changeProcess">
                <div class="h3 text-center">
                  <i class="mdi mdi-flask-empty-outline text-gray-light" style="font-size:80px;font-weight:100"></i>
                </div>
          </div>
          </div>
          <hr class="m-0 mt-2" />
        </b-card-header>
     
      </div>
      
    </b-card>
    <div class="form" v-if="editForm">
      <layer :key="intent" @closed="cancelEdit" style="width:100%">
        <div class="overlay transparent" @click="closeRolesPopover" v-if="showRolesPopover" />
        <b-form @submit.prevent="saveItem">
          <div>
            <b-row>
              <b-col>
                <b-card class="bg-white shadow-sm" no-body>
                  <div ref="editRolesPlaceholder" style="height:1px;position:absolute;width:100%"></div>
                  <div class="form-group my-0">
                    <b-textarea
                      v-model="editForm.title"
                      class="no-style my-0"
                      style="min-height:70px; overflow:hidden"
                      v-autofocus="true"
                      v-autoresize
                      :state="$validateState('title', editForm)"
                      v-validate="'required|min:4'"
                      name="title"
                      :key="intent"
                    ></b-textarea>
                    <b-form-invalid-feedback>{{ $displayError('title', editForm) }}</b-form-invalid-feedback>
                  </div>
                </b-card>
                <div class="mt-3">
                  <loading-button
                    :loading="editForm.busy"
                    :disabled="vErrors.any()||editForm.busy"
                    size="md"
                    type="submit"
                    class="padding shadow-sm"
                  >{{ $t('Save') }}</loading-button>
                </div>
              </b-col>
            </b-row>
          </div>
          <b-popover
            placement="right"
            :show="true"
            :target="()=>$refs.editRolesPlaceholder"
            custom-class="no-arrow transparent"
            :key="intent"
          >
        
          </b-popover>
        </b-form>
      </layer>
    </div>
  </div>
</template>

<script>
import GQLForm from "@/lib/gqlform";
import { ProcessStage, ProcessOperation } from "@/models";

import { /*mapState,*/ mapGetters } from "vuex";
export default {
  props: {
    item: {
      required: false
    },
    mode: {
      required: false
    }
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
    newOperation: null
  }),
  computed: {
    ...mapGetters({
      companyRoles: "companyRole/all"
    }),
    selectedRoles: {
      get() {
        return this.companyRoles
          .filter(r => this.editForm.companyRoles.includes(r.id))
          .sort((a, b) => (a.name > b.name ? 1 : -1));
      }
    },
    operations: {
      get: function() {
        return [...this.item.operations].sort((a, b) => {
          return a.dOrder > b.dOrder ? 1 : -1;
        });
      },
      set: function(value) {
        this.item.operations = value.sort((a, b) => {
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
          this.editItem = new ProcessStage().deserialize(this.item);
          this.editForm = new GQLForm({
            id: this.editItem.id,
            title: this.editItem.title,
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
    editingOperation(editing) {
      this.editingCard = editing;
      this.$emit("editing", editing);
    },
    prepareOperation() {
      this.newOperation = new ProcessOperation().deserialize({
        stageId: this.item.id,
        companyRoles: []
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
    changeProcess() {
      this.$emit("selectProcess", this.item)
    },
    initEdit() {
      if (!this.editing) {
        this.$validator.pause();
        this.$validator.reset();
        if (this.item) {
          this.intent++;
          this.editForm = new GQLForm({
            id: this.item.id,
            title: this.item.title
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

    },
    async saveItem() {
      await this.$validator.validateAll();
      if (!this.vErrors.any()) {
        this.$nextTick(async () => {
          await this.$store.dispatch("process/update", this.editForm);
        
          this.initEdit();
        });
      }
    },
    cancelEdit() {
      this.initEdit();
    },
  }
};
</script>