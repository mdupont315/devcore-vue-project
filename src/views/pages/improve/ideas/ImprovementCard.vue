<template>
  <div>
    <b-card
      class="border shadow-sm mb-3 px-3 pt-3 pb-0"
      style="position: relative"
    >
      <inner-overlay
        v-if="showPopOver"
        style="z-index: 1"
        @click="togglePopOver"
      ></inner-overlay>
      <b-card-body class="p-0">
        <p class="text-justify">{{ item.description }}</p>
      </b-card-body>
      <b-card-footer class="bg-white pl-0 border-0">
        <author-time
          :user="item.author"
          :time="item.createdAt"
          class="d-inline-block"
        ></author-time>
        <div class="float-right" style="position: relative; top: -10px">
          <confirm-button
            class="d-inline-block"
            variant="transparent"
            btn-class="text-danger p-0 border-0"
            btn-style="outline:none!important;box-shadow:none!important"
            @confirm="deleteItem"
          >
            <i class="mdi mdi-close" style="font-size: 2rem"></i>
            <small class="d-block text-gray" style="line-height: 1em">{{
              $t("Delete")
            }}</small>
          </confirm-button>
          <b-button
            ref="btnNew"
            variant="transparent"
            class="text-success p-0 border-0 ml-4"
            style="outline: none !important; box-shadow: none !important"
            @click="startCreation"
          >
            <i class="mdi mdi-check" style="font-size: 2rem"></i>
            <small class="d-block text-gray" style="line-height: 1em">{{
              $t("Create revision")
            }}</small>
          </b-button>
        </div>
      </b-card-footer>
    </b-card>
    <b-popover
      ref="popover"
      v-click-outside
      :target="() => this.$refs['btnNew']"
      :show.sync="showPopOver"
      placement="top"
      class="form-popover"
    >
      <b-card no-body style="width: 400px">
        <b-card-body>
          <idea-form
            :item="newIdea"
            @done="loadIdea"
            @reload="reloadDetail"
            :formFrom="'improveIdea'"
          ></idea-form>
        </b-card-body>
      </b-card>
    </b-popover>
  </div>
</template>
<script>
import { Idea } from "@/models";
import IdeaFrom from "./Form";

export default {
  components: {
    "idea-form": IdeaFrom,
  },
  props: {
    item: {
      type: Object,
      required: true,
    },
    idea: {
      type: Object,
      required: true,
    },
  },
  data: () => ({
    showPopOver: false,
    newIdea: {},
  }),
  methods: {
    async reloadDetail() {
      this.$emit("reload", this.item);
    },
    async deleteItem() {
      this.$emit("confirm", this.item);
    },

    async loadIdea() {
			console.log("LOAD");
      await this.$store.dispatch("idea/findById", {
        id: this.idea.id,
        force: true,
      });
    },
    togglePopOver() {
      this.showPopOver = !this.showPopOver;
      // this.$store.dispatch("app/showOverlay", {
      //   show: this.showPopOver,
      //   onClick: this.togglePopOver
      // });
    },
    async startCreation() {
      this.$nextTick(() => {
        this.newIdea = new Idea();
        this.newIdea.parent = this.idea.parent;

        this.newIdea.title = `${this.idea.title}(${this.idea.version + 1})`;
        this.newIdea.description = this.item.description;
        this.newIdea.processId = this.idea.processId;
        this.newIdea.sourceId = this.item.id;
        this.newIdea.companyToolId = this.idea.companyToolId;
        this.newIdea.type = this.idea.type;
        this.newIdea.sourceType = "idea_issue";
        console.log(this.newIdea.toolId);
      });
      setTimeout(() => {
        this.showPopOver = true;
      }, 500);
    },
  },
};
</script>
