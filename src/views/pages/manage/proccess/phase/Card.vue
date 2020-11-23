<template>
  <div
    class="list-group-item list-group-item-action"
    :class="{'enable-drag':!editing, 'active':editing}"
  >
    <div class="header p-0">
      <div class="title pl-0">
        <h2 class="h5 m-0 text-capitalize text-left text-overflow text-bold">{{ item.title }}</h2>
        <div class="tools">
          <span v-if="$can('process/phase/update', item)" class="btn-action" @click="toggleEdit">
            <i class="mdi mdi-pencil"></i>
          </span>
        </div>
      </div>
    </div>
    <div class="body">
      <p class="text-justify mb-0 text-multiline">{{ item.description }}</p>
      <div class="companyRoles">
        <div v-if="item.companyRoles && item.companyRoles.length>0">
          <div class="stacked-avatars">
            <div
              v-for="role in item.companyRoles"
              :key="role.id"
              v-b-tooltip="{  placement: 'top', boundary:'viewport' }"
              class="avatar-item"
              :title="role.name"
            >
              <img :src="role.getAvatarUrl('50x50')" height="22" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="editForm" class="form">
      <layer :key="intent" @closed="cancelEdit">
        <div ref="editRolesPlaceholder" style="height:1px"></div>
        <div v-if="showRolesPopover" class="overlay transparent" @click="closeRolesPopover" />
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
                      style="min-height:20px; height:30px; overflow:hidden"
                      :state="$validateState('title', editForm)"
                      :placeholder="$t('Phase name')"
                      name="title"
                    ></b-input>
                    <b-form-invalid-feedback>{{ $displayError('title', editForm) }}</b-form-invalid-feedback>
                  </div>
                  <div class="form-group my-0">
                    <b-textarea
                      :key="intent"
                      v-model="editForm.description"
                      v-autoresize
                      class="no-style my-0"
                      style="min-height:20px; overflow:hidden"
                      :placeholder="$t('Phase description')"
                      :state="$validateState('description', editForm)"
                      name="description"
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
            :key="intent"
            placement="rightbottom"
            :show="true"
            :target="()=>$refs.editRolesPlaceholder"
            custom-class="no-arrow transparent offset-t-5"
          >
            <b-card class="bg-light shadow-sm" no-body style="width:210px">
              <b-card-body>
                <ul
                  v-if="editForm.companyRoles && editForm.companyRoles.length>0"
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
                <span v-else class="text-dark">{{ $t('No') }} {{ $t('roles') }} {{ $t('selected') }}</span>
              </b-card-body>
              <b-card-footer class="mx-2">
                <b-button
                  ref="btnAssignRoles"
                  block
                  variant="white"
                  class="text-primary"
                  size="md"
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
                      :key="intent"
                      v-model="editForm.companyRoles"
                      selector-class="rounded"
                      :show-input="false"
                      :show-footer-display="false"
                      :show-footer-selection="false"
                      :items="availableRoles"
                      :show-add-btn="$can('core/companyRole/create')"
                      @close="toggleRolesPopover"
                    ></company-role-selector>
                  </div>
                </b-popover>
              </b-card-footer>
            </b-card>
            <div v-if="$can('process/phase/delete', editItem)" class="mt-2">
              <confirm-button
                variant="transparent"
                :confirm-message="$t('This action cannot be undone!')"
                :confirm-title="$t('Delete phase')+'?'"
                :confirm-text="$t('Delete phase')"
                btn-class="text-white border outline-none"
                size="xs"
                :show-overlay="false"
                block
                @confirm="deleteItem"
              >{{ $t('Delete phase') }}</confirm-button>
            </div>
          </b-popover>
        </b-form>
      </layer>
    </div>
  </div>
</template>
<script>
import { /* mapState, */ mapGetters } from "vuex";
import GQLForm from "@/lib/gqlform";
import { ProcessPhase } from "@/models";

export default {
  components: {},
  props: {
    item: {
      required: false
    },
    operation: {
      required: true
    },
    mode: {
      required: false
    }
  },
  data: () => ({
    showOverlay: false,
    showMenu: false,
    editing: false,
    editForm: null,
    editItem: null,
    intent: 0,
    showRolesPopover: false
  }),
  computed: {
    ...mapGetters({
      allRoles: "companyRole/all"
    }),
    availableRoles: {
      get() {
        // return this.operation.companyRoles.map(r =>
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
    }
  },
  async mounted() {
    await this.$store.dispatch("companyRole/findAll");
  },
  methods: {
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
          this.editItem = new ProcessPhase().deserialize(this.item);
          this.editForm = new GQLForm({
            id: this.editItem.id,
            operationId: this.editItem.operationId,
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
        await this.$store.dispatch("processPhase/update", this.editForm);
        this.cancelEdit();
      }
    },
    async deleteItem() {
      this.$emit("editing", false);
      await this.$store.dispatch("processPhase/delete", this.editForm);
      this.cancelEdit();
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