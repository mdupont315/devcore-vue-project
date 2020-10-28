<template>
  <div
    class="list-group-item list-group-item-action"
    :class="{'enable-drag':!editing, 'active':editing}"
  >
    <div class="header p-0">
      <div class="title pl-0">
        <h2 class="h5 m-0 text-capitalize text-left text-overflow text-bold">{{ item.title }}</h2>
        <div class="tools">
          <span class="btn-action" @click="toggleEdit" v-if="$can('process/phase/update', item)">
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
              class="avatar-item"
              :title="role.name"
              v-b-tooltip="{  placement: 'top', boundary:'viewport' }"
            >
              <img :src="role.getAvatarUrl('50x50')" height="22" />
            </div>
          </div>
        </div>
      </div>
    </div>

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
                      :placeholder="$t('Phase name')"
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
                      :placeholder="$t('Phase description')"
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
                      :showFooterDisplay="false"
                      :show-footer-selection="false"
                      @close="toggleRolesPopover"
                      :items="availableRoles"
                      :show-add-btn="$can('core/companyRole/create')"
                    ></company-role-selector>
                  </div>
                </b-popover>
              </b-card-footer>
            </b-card>
            <div class="mt-2" v-if="$can('process/phase/delete', editItem)">
              <confirm-button
                variant="transparent"
                :confirmMessage="$t('This action cannot be undone!')"
                :confirmTitle="$t('Delete phase')+'?'"
                :confirmText="$t('Delete phase')"
                btnClass="text-white border outline-none"
                size="xs"
                :showOverlay="false"
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
import GQLForm from "@/lib/gqlform";
import { ProcessPhase } from "@/models";
import { /*mapState,*/ mapGetters } from "vuex";
export default {
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
  components: {},
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