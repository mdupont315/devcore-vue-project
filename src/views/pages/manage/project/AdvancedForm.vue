 <template>
  <div class="page animated fadeIn" style="padding-top: 0px">
    <b-form
      class="hide-labels"
      @submit.prevent="save"
      @keyup="$validator.validateAll()"
    >
      <div class="form-group">
        <b-col cols="12">
          <div class="form-group">
            <b-card-header class="header">
              <div
                style="
                  justify-content: space-between;
                  justify-items: flex-end;
                  display: flex;
                "
              >
                <div style="flex-grow: 5">
                  <div
                    class="h4 m-0 text-capitalize text-center text-overflow text-bold"
                    style="
                      display: flex;
                      justify-content: center;
                      font-size: 15px;
                    "
                  >
                    <div>Issue evaluation roles</div>
                  </div>
                </div>
                <div
                  style="cursor: pointer; align-self: center"
                  class="btn-action"
                  @click="toggleIssueRoleEdit"
                >
                  <i class="mdi mdi-pencil"></i>
                </div>
              </div>
              <hr class="m-0 mt-2" />
              <div class="companyRoles">
                <div>
                  <div
                    class="stacked-avatars left"
                    style="display: block; height: 30px"
                  >
                    <div v-if="getSelectedRoles.length > 0">
                      <div
                        v-for="role in getSelectedRoles"
                        :key="role.id"
                        v-b-tooltip="{ placement: 'top', boundary: 'viewport' }"
                        class="avatar-item"
                        style="max-width: 20px; max-height: 20px"
                        :title="role.name"
                      >
                        <img :src="role.getAvatarUrl('50x50')" height="20" />
                      </div>
                    </div>
                    <span v-else class="text-dark"
                      >{{ $t("No") }} {{ $t("roles") }}
                      {{ $t("selected") }}</span
                    >
                  </div>

                  <hr class="my-0" />
                </div>
              </div>
            </b-card-header>
        <b-form @submit.prevent="save">
              <div>
                <b-row>
                  <b-col>
                    <b-card class="bg-white shadow-sm" no-body>
                      <div
                        ref="editRolesPlaceholder"
                        style="height: 1px; position: absolute; width: 100%"
                      ></div>
                    </b-card>
                    <div class="mt-3">
                      <loading-button
                        :loading="form.busy"
                        :disabled="vErrors.any() || form.busy"
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
                v-if="issueRoleEdit"
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
                      v-if="advancedForm.issueEvaluationRoles.length > 0"
                      class="list-inline break mb-0"
                    >
                      <li
                        v-for="role in getSelectedRoles"
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
                      >{{ $t("No") }} {{ $t("roles") }}
                      {{ $t("selected") }}</span
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
                      <div
                        style="width: 210px; overflow: hidden"
                        class="rounded"
                      >
                        <company-role-selector
                          :key="intent"
                          v-model="advancedForm.issueEvaluationRoles"
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
              </b-popover>
            </b-form>
          </div>
        </b-col>
      </div>
    </b-form>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  computed: {
    ...mapGetters({
      companyRoles: "companyRole/all",
      show_inner_overlay: "app/show_inner_overlay",
    }),
    getAllRoles: {
      get() {
        return this.companyRoles;
      },
    },
    getSelectedRoles: {
      get() {
        return this.companyRoles
          .filter((r) => this.advancedForm.issueEvaluationRoles.includes(r.id))
          .sort((a, b) => (a.name > b.name ? 1 : -1));
      },
    },
  },
  props: {
    form: {
      type: Object,
      default: null,
    },
    users: null,
  },
  data: () => ({
    showRolesPopover: false,
    intent: 0,
    issueRoleEdit: false,

    advancedForm: {
      issueEvaluationRoles: [],
    },
  }),
  mounted() {
    this.advancedForm.issueEvaluationRoles =
      this.form.issueEvaluationRoles ?? this.companyRoles.map((x) => x.id);
  },
  methods: {
    save() {
      this.form.busy = true;
			console.log(this.advancedForm);
      this.$emit("input", this.advancedForm);
      this.$emit("done");
      this.form.busy = false;
    },
    toggleRolesPopover() {
      this.showRolesPopover = !this.showRolesPopover;
    },
    toggleIssueRoleEdit() {
      this.issueRoleEdit = !this.issueRoleEdit;
    },
  },
};
</script>

<style>
</style>
