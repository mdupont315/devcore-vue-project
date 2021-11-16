 <template>
  <div class="page" style="width: 300px; min-height: 50px">
    <restrict-role
      name="evaluation"
      v-model="getIssueEvaluationRoles"
      :labelText="$t('Issue Evaluation Restriction')"
      :infoText="$t('Issue Evaluation Restriction Info')"
      :type="type"
      @opened="setType"
      @changed="saveSelection"
      :items="getAllRoles"
    >
    </restrict-role>
    <restrict-role
      name="template"
      v-model="getIssueTemplateRoles"
      :labelText="$t('Issue Template Restriction')"
      :infoText="$t('Issue Template Restriction Info')"
      :type="type"
      @opened="setType"
      @changed="saveSelection"
      :items="getAllRoles"
    >
    </restrict-role>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import RestrictRoleSelector from "../../../../components/global/RestrictRoleSelector.vue";

export default {
  components: {
    "restrict-role": RestrictRoleSelector,
  },
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
    getIssueEvaluationRoles: {
      get() {
        return this.companyRoles.filter(
          (cr) => this.advancedForm.issueEvaluationRoles.indexOf(cr.id) > -1
        );
      },
      set(value) {
        console.log(value);
        this.advancedForm.issueEvaluationRoles = value;
      },
    },
    getIssueTemplateRoles: {
      get() {
        return this.companyRoles.filter(
          (cr) => this.advancedForm.issueTemplateRoles.indexOf(cr.id) > -1
        );
      },
      set(value) {
        console.log(value);
        this.advancedForm.issueTemplateRoles = value;
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
      default: () => {},
    },
    users: {
      type: Array,
      default: () => [],
    },
  },
  data: () => ({
    type: "",
    showRolesPopover: false,
    intent: 0,
    issueRoleEdit: false,

    advancedForm: {
      issueEvaluationRoles: [],
      issueTemplateRoles: [],
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

    if (this.form.issueTemplateRoles) {
      this.advancedForm.issueTemplateRoles = this.form.issueTemplateRoles ?? [];
    }
    if (this.value && this.value.issueTemplateRoles) {
      this.advancedForm.issueTemplateRoles =
        this.value.issueTemplateRoles ?? [];
    }
  },
  methods: {
    setType(_type) {
      if (this.type !== _type) {
        this.type = _type;
      } else {
        this.type = null;
      }
    },
    saveSelection() {
      this.$emit("input", this.advancedForm);
    },
    toggleRolesPopover() {
      this.showRolesPopover = !this.showRolesPopover;
    },
    toggleIssueRoleEdit() {
      this.type = "evaluation";
      this.issueRoleEdit = !this.issueRoleEdit;
    },
  },
};
</script>

<style scoped>
.companyRoles {
  max-width: 100px;
  flex-grow: 3;
  border-radius: 5px;
  min-width: 100px;
}
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
  display: flex;
}

.advanced_evaluation_restriction-text {
  font-size: 15px;
  flex-grow: 4;
  align-self: center;
  align-items: center;
  display: flex;
  cursor: pointer;
  justify-content: space-between;
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
