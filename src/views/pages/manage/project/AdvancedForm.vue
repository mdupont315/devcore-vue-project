 <template>
  <div class="page" style="width: 300px; min-height: 50px">
    <b-card-header
      class="header"
      ref="editRolesPlaceholder"
      style="border: none"
    >
      <div class="advanced_evaluation_restriction" @click="toggleIssueRoleEdit">
        <div class="advanced_evaluation_restriction-text">
          {{ this.$t("Evaluation Restriction") }}

          <b-popover
            target="advanced_evaluation_restriction-text-info-id"
            container="advanced_evaluation_restriction-text-info-id"
            placement="top"
            triggers="hover focus"
            :content="this.$t('Evaluation Restriction Info')"
          >
          </b-popover>

          <div
            class="advanced_evaluation_restriction-text-info"
            id="advanced_evaluation_restriction-text-info-id"
          >
            <i class="mdi mdi-information restriction-text-info-icon"></i>
          </div>
        </div>

        <div
          class="companyRoles"
          :class="{
            'advancedRoles-border-active': advancedForm.issueEvaluationRoles,
          }"
          style="flex-grow: 3; border-radius: 5px"
        >
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
                  style="max-width: 20px; max-height: 20px; display: flex"
                  :title="role.name"
                >
                  <img :src="role.getAvatarUrl('50x50')" height="20" />
                </div>
              </div>
              <div v-else class="text-dark advanced-role-noroles"
                >{{ $t("No") }} {{ $t("roles") }} {{ $t("selected") }}</div
              >
            </div>
          </div>
        </div>
      </div>
    </b-card-header>
    <b-popover
      v-if="issueRoleEdit"
      :key="intent"
      placement="right"
      :show="true"
			offset="10"
      :target="() => $refs.editRolesPlaceholder"
      custom-class="no-arrow transparent"
    >
      <b-card
        class="bg-light shadow-sm"
        no-body
        style="width: 210px; top: 20px"
      >
        <b-card-body style="min-height:60px">
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
          <div v-else class="text-dark"
            >{{ $t("No") }} {{ $t("roles") }} {{ $t("selected") }}</div
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
                v-model="advancedForm.issueEvaluationRoles"
                @input="saveSelection"
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
        if (this.advancedForm.issueEvaluationRoles) {
          return this.companyRoles
            .filter((r) =>
              this.advancedForm.issueEvaluationRoles.includes(r.id)
            )
            .sort((a, b) => (a.name > b.name ? 1 : -1));
        }
        return [];
      },
    },
  },
  props: {
    form: {
      type: Object,
      default: null,
    },
    value: {
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
    if (this.form.issueEvaluationRoles) {
      this.advancedForm.issueEvaluationRoles =
        this.form.issueEvaluationRoles ?? [];
    }
    if (this.value && this.value.issueEvaluationRoles) {
      this.advancedForm.issueEvaluationRoles =
        this.value.issueEvaluationRoles ?? [];
    }
  },
  methods: {
    saveSelection() {
      this.$emit("input", this.advancedForm);
    },
    save() {
      this.form.busy = true;
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

<style scoped>
.advancedRoles-border-active {
  border: 1px solid grey;
}
.advanced-role-noroles {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
.advanced_evaluation_restriction {
  -webkit-box-pack: justify;
  -ms-flex-pack: justify;
  justify-content: space-between;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
}

.advanced_evaluation_restriction-text {
  font-size: 15px;
  flex-grow: 4;
  align-self: center;
  align-items: center;
  display: flex;
  cursor: pointer;
}

.advanced_evaluation_restriction-text-info > .restriction-text-info-icon {
  color: #4294d0;
  padding-left: 3px;
  font-size: 20px;
  padding-right: 3px;
}
.advanced_evaluation_restriction-text-info > .popover {
  padding: 5px;
  max-width: 250px;
}
</style>
