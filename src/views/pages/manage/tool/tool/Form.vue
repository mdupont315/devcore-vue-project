<template>
  <b-form class="hide-labels" @submit.prevent="save" @keyup="$validator.validateAll()">
    <b-row>
      <b-col class="col-12">
        <div class="form-label-group required">
          <suggestions
            v-model="form.name"
            class="sm"
            :v-validate="'required'"
            :options="{debounce:250, inputClass:'form-control form-control-sm', autofocus:true, placeholder:$t('Name')}"
            :state="$validateState('tool_id', form)"
            :on-input-change="onToolInputChange"
            :on-item-selected="onToolSelected"
            :class="{'is-invalid':$validateState('tool_id', form)===false, 'is-valid':$validateState('tool_id', form)===true}"
          >
            <div slot="item" slot-scope="props" class="single-item">
              <span class="name">{{props.item.name}}</span>
            </div>
          </suggestions>
          <b-form-invalid-feedback>{{ $displayError('tool_id', form) }}</b-form-invalid-feedback>
        </div>
      </b-col>

    </b-row>

    <b-row>
      <b-col class="col-12">
        <hr class="mt-0" />
        <loading-button
          size="lg"
          block
          type="submit"
          :disabled="vErrors.any()||form.busy"
          :loading="form.busy"
          variant="primary"
        >{{ $t('Save changes')}}</loading-button>
        <div
          v-if="mode==='edit' && $can('core/companyTool/delete', input)"
          class="mt-3 text-center"
        >
          <hr />
          <b-button variant="outline-danger" type="button" block @click.prevent="deleteItem">
            <i class="mdi mdi-trash-can"></i>
            {{ $t('Delete') }}
          </b-button>
        </div>
      </b-col>
    </b-row>
  </b-form>
</template>
<script>
import { /* mapState, */ mapGetters } from "vuex";
import GQLForm from "@/lib/gqlform";

export default {
  props: {
    value: {
      type: Object,
      required: false
    },
    mode: {
      type: String,
      required: false,
      default: "create"
    }
  },
  data: () => ({
    input: null,
    form: new GQLForm({
      id: null,
      name: null,
      toolId: null
      // quantity: null,
      // yearlyCosts: null,
      // priceModel: null
    })
  }),
  computed: {
    ...mapGetters({
      currentUser: "auth/user",
      priceModels: "priceModel/all"
    })
  },
  async mounted() {
    this.input = this.value;
    await this.$store.dispatch("companyTool/findAll");
    await this.initForm();
    // await this.$store.dispatch("toolArea/findAll");
  },
  methods: {
    async initForm() {
      Object.keys(this.input || {})
        .filter(key => key in this.form)
        .forEach(key => (this.form[key] = this.input[key]));
    },
    async save() {
      try {
        await this.$validator.validateAll();
        if (!this.vErrors.any()) {
          await this.$validator.reset();
          if (this.mode === "edit") {
            this.input = await this.$store.dispatch(
              "companyTool/update",
              this.form
            );
          } else {
            this.input = await this.$store.dispatch(
              "companyTool/create",
              this.form
            );
          }
          await this.initForm();
          await this.$store.dispatch("companyTool/findAll", {
            force: true
          });
          this.$emit("input", this.input);
          this.$emit("done");
        }
      } catch (ex) {

        console.error(ex.message);
      }
    },
    async deleteItem() {
      if (this.$can("core/companyTool/delete", this.input)) {
        await this.$swal({
          title: this.$t("Are you sure?"),
          text: this.$t("You won't be able to revert this!"),
          type: "warning",
          showCancelButton: true,
          confirmButtonText: this.$t("Yes, delete it!"),
          showLoaderOnConfirm: true,
          preConfirm: async () => {
            try {
              const result = await this.$store.dispatch(
                "toolCategory/delete",
                new GQLForm(
                  {
                    id: this.input.id
                  },
                  null
                )
              );
              this.$emit("done");
              return result;
            } finally {
              this.$swal.close();
            }
          }
        });
      }
    },
    async onToolSelected(item) {
      this.form.toolId = item.id;
      this.form.name = item.name;
    },
    async onToolInputChange(query) {
      this.form.toolId = null;

      if (query.trim().length < 2) {
        return [];
      }

      const response = await this.$store.dispatch("tool/findAll", {
        where: {
          field: "name",
          op: "cn",
          value: query
        }
      });

      return response;
    }
  }
};
</script>
