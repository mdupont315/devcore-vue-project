<template>
  <div>
    <div class="idea_edit_container" v-if="getIdea">
      <idea-edit-content
        :user="user"
        :idea="getIdea"
        :ideaContentCategories="ideaContentCategories"
        :isLoading="isLoading"
        :selectedCategoryIndex="selectedCategoryIndex"
				@fileAdded="setFile"
        @selectedType="setContentType"
        v-model="getIdeaContent"
      ></idea-edit-content>
      <idea-edit-path
        @close="closeIdeaEdit"
        @save="saveIdeaVersion"
        @deleteIdea="deleteIdeaVersion"
        @updateStatus="updateIdeaVersionStatus"
        :isLoading="isLoading"
        v-model="getIdeaPath"
        :idea="getIdea"
      ></idea-edit-path>
    </div>
  </div>
</template>

	<script>
import IdeaEditContent from "./layout/IdeaEditContent.vue";
import IdeaEditPath from "./layout/IdeaEditPath.vue";
import GQLForm from "@/lib/gqlform";
import { mapGetters } from "vuex";

export default {
  components: {
    "idea-edit-content": IdeaEditContent,
    "idea-edit-path": IdeaEditPath,
  },
  async created() {
    // await this.$store.dispatch("ideaContent/findAll", { force: true });
    this.isLoading = true;
    this.filter = {
      data: {
        where: {
          field: "idea_id",
          op: "eq",
          value: this.getIdea.id,
        },
      },
    };
    await this.$store.dispatch("companyTool/findAll");
    await this.$store.dispatch("ideaContent/findAll", {
      filter: this.filter,
      force: true,
    });

    await this.initializeForms();
    this.isLoading = false;
  },
  data: () => ({
    filter: null,
    selectedCategoryIndex: 0,
    ideaForm: new GQLForm({
      id: undefined,
      processId: null,
      stageId: null,
      operationId: null,
      phaseId: null,
      companyToolId: null,
      file: [],
      description: null,
      title: null,
      type: null,
    }),
    contentForm: new GQLForm({
      id: undefined,
      markup: null,
      ideaId: null,
      version: 1,
      contentType: null,
    }),

    ideaContentCategories: [
      {
        name: "Cheatsheet",
        contentForm: new GQLForm({
          id: undefined,
          markup: null,
          ideaId: null,
          version: 1,
          contentType: null,
        }),
      },
      {
        name: "Learn",
        contentForm: new GQLForm({
          id: undefined,
          markup: null,
          ideaId: null,
          version: 1,
          contentType: null,
        }),
      },
      {
        name: "Custom",
        contentForm: new GQLForm({
          id: undefined,
          markup: null,
          ideaId: null,
          version: 1,
          contentType: null,
        }),
      },
    ],

    isLoading: false,
  }),
  props: {
    idea: {
      type: Object,
      required: false,
    },
    user: {
      type: Object,
      required: false,
    },
  },
  computed: {
    ...mapGetters({
      ideaContents: "ideaContent/all",
      ideaInEdit: "idea/ideaInEdit",
    }),
    getIdea: {
      get() {
        console.log(this.ideaInEdit);
        return this.ideaInEdit.editIdea;
      },
    },
    getIdeaPath: {
      get() {
        return this.ideaForm;
      },
    },
    getIdeaContent: {
      get() {
        const contentForm =
          this.ideaContentCategories[this.selectedCategoryIndex].contentForm;
        return {
          contentType: contentForm.contentType,
          markup: JSON.parse(contentForm.markup),
        };
      },
      set(value) {
        const contentForm =
          this.ideaContentCategories[this.selectedCategoryIndex].contentForm;
        contentForm.markup = JSON.stringify(value.markup);
        contentForm.contentType = value.contentType;
      },
    },
  },
  methods: {
		setFile(file) {
			this.ideaForm.file = file
			this.saveIdeaVersion()
		},
    setContentType(item) {
      this.isLoading = true;
      this.selectedCategoryIndex = this.ideaContentCategories.findIndex(
        (content) => content.name === item.name
      );
      this.$nextTick(() => {
        this.isLoading = false;
      });
    },
    formFieldMapper(mapTo, mapFrom) {
      console.log(mapFrom);
      Object.keys(mapTo.fields || {})
        .filter((key) => key in mapFrom)
        .forEach((key) => {
          mapTo[key] = mapFrom[key];
        });

      console.log(mapTo);
    },
    async initializeForms() {
      this.ideaFormFieldMapper();
      this.ideaContentFormFieldMapper();
    },
    ideaFormFieldMapper() {
      const mapToIdea = this.ideaForm;
      console.log(this.getIdea.stageId);
      const mapFromIdea = Object.assign(this.getIdea, {});
      this.formFieldMapper(mapToIdea, mapFromIdea);
    },
    ideaContentFormFieldMapper() {
      if (this.getIdea && this.getIdea.ideaContentId) {
        this.ideaContents.map((content) => {
          const mapToCategory = this.ideaContentCategories.find(
            (category) => category.name === content.contentType
          );
          const mapFromIdeaContent = Object.assign(content, {});
          this.formFieldMapper(mapToCategory.contentForm, mapFromIdeaContent);
        });
      }
    },
		async saveIdea(){
			 const ideaSave = await this.$store.dispatch(
          `idea/update`,
          this.ideaForm
        );
				return ideaSave
		},
    async saveIdeaVersion() {
      this.isLoading = true;
      try {
				const ideaSave = await this.saveIdea()

        if (ideaSave && ideaSave.id) {
          let ideaContent = null;
          const contentForm =
            this.ideaContentCategories[this.selectedCategoryIndex].contentForm;

          contentForm.ideaId = ideaSave.id;
          contentForm.contentType =
            this.ideaContentCategories[this.selectedCategoryIndex].name;

          if (contentForm.id) {
            console.log("UPDATING!");
            console.log(contentForm);
            ideaContent = await this.$store.dispatch(
              `ideaContent/update`,
              contentForm
            );
          } else {
            console.log("CREATING!");
            ideaContent = await this.$store.dispatch(
              `ideaContent/create`,
              contentForm
            );
            const mapTo = contentForm;
            const mapFrom = Object.assign(ideaContent, {});
            this.formFieldMapper(mapTo, mapFrom);
          }
        }
				return ideaSave
      } catch (e) {
        console.log(e);
      } finally {
        this.isLoading = false;
      }
    },
    async updateIdeaVersionStatus() {
      const editForm = new GQLForm({
        id: this.getIdea.id,
        status: this.getIdea.status === "NEW" ? "TESTING" : "ADOPTED",
      });
      await this.$store.dispatch(`idea/changeStatus`, editForm);
      this.$store.dispatch(`idea/findByProcess`, {
        id: this.getIdea.processId,
        force: true,
      });
      this.closeIdeaEdit();
    },
    async deleteIdeaVersion() {
      this.form.busy = true;
      const editForm = new GQLForm({
        id: this.form.id,
      });
      await this.$store.dispatch(`idea/delete`, editForm);
      this.$store.dispatch(`idea/findByProcess`, {
        id: this.form.processId,
        force: true,
      });
      this.$store.dispatch("process/findById", {
        id: this.form.processId,
        force: true,
      });
      this.form.busy = false;
    },
    async closeIdeaEdit() {
      this.$emit("close");
      await this.$store.dispatch("idea/setIdeaInEdit", null);
    },
  },
};
</script>


<style scoped>
.idea_edit_container {
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  height: 100%;
  margin-top: 0px;
  min-height: 80vh;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
}
</style>
