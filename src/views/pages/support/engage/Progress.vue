<template>
  <div class="engage_progress_container">
    <inner-overlay
      v-if="innerOverlayOpen"
      style="z-index: 2"
      @click="toggleCreateForm"
    ></inner-overlay>
    <div
      class="engage_progress_container-header-edit"
      :class="{ 'is-elevated-layer': isEditing }"
    >
      <div class="engage_progress_container_header-action">
        <div
          class="engage_progress_container_header-action-edit"
          v-if="!isEditing"
          @click="toggleEdit"
        >
          <i class="mdi mdi-pencil engage-header-edit-icon"></i
          ><span class="engage_progress_container-header-edit-text">{{
            $t("Edit")
          }}</span>
        </div>
        <div
          v-else
          @click="saveEdits"
          style="display: flex; flex-direction: column; height: 100%"
        >
          <div class="engage_progress_container_header-action-edit">
            <div
              v-if="loading"
              class="engage_progress_container_header-action-edit-spinner"
            >
              <b-spinner small></b-spinner>
            </div>
            <div v-else class="engage_progress_container_header-action-edit">
              <i class="mdi mdi-pencil engage-header-edit-icon"></i
              ><span class="engage_progress_container-header-edit-text">{{
                $t("Save")
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="engage_progress_container-body">
      <div
        class="engage_body_scrollContainer"
        id="engage_body_scrollContainer"
        v-dragscroll.x
      >
        <div
          v-for="(part, index) in getProgressPart"
          :key="index"
          class="engage_progress_container_body_item"
        >
          <progress-part
            @removePart="removeEditItem"
            :item="part"
            :isEditing="isEditing"
            :itemMeta="{
              itemIndex: index + 1,
              count: getProgressPart.length,
            }"
          >
            <div
              class="engage_progress_container-body-score"
              :class="{ 'is-elevated-layer': isEditing }"
            >
              <span class="engage_progress_container-body-score-text">
                {{ $t("requiredScore") }}
              </span>
              <div v-if="!isEditing">
                <span class="engage_progress_container-body-score-value"
                  >{{ part.requiredScore }}
                </span>
              </div>
              <div v-else>
                <input
                  type="text"
                  style="border-radius: 20px"
                  class="form-control engage_progress_container-edit-input"
                  :placeholder="part.requiredScore"
                  v-model="editItems[index].requiredScore"
                />
              </div>
            </div>

            <div
              class="engage_progress_container-body-text"
              disabled
              :class="{ 'is-elevated-layer': isEditing }"
            >
              <b-card
                v-if="!isEditing"
                style="
                  overflow: hidden;
                  max-height: 100%;
                  min-height: 170px;
                  padding: 10px;
                "
              >
                <b-card-title>
                  <div
                    :id="`body-text-title-${part.id}`"
                    v-b-tooltip="{
                      title: part.title ? part.title : '',
                      placement: 'topright',
                      variant: 'light',
                    }"
                    :disabled="isTextOverArea(`body-text-title-${part.id}`)"
                    style="
                      overflow: hidden;
                      white-space: nowrap;
                      text-overflow: ellipsis;
                    "
                  >
                    {{ `${index + 1}. ${part.title}` }}
                  </div>
                </b-card-title>
                <div style="max-height: 100px; overflow: scroll">
                  <span style="overflow: scroll">
                    {{
                      part.description ? part.description : $t("No description")
                    }}
                  </span>
                </div>
              </b-card>

              <b-card style="padding: 10px; height: 150px" v-else>
                <b-card-title>
                  <input
                    type="text"
                    class="form-control engage_progress_container-edit-input"
                    v-model="editItems[index].title"
                    :placeholder="part.title"
                /></b-card-title>

                <div class="form-group">
                  <b-form-textarea
                    no-resize
                    trigger="hover"
                    :placeholder="part.description"
                    v-model="editItems[index].description"
                    class="form-control rounded-0"
                    rows="3"
                  ></b-form-textarea>
                </div>
              </b-card>
            </div>
          </progress-part>
          <progress-button
            :item="part"
            :isEditing="isEditing"
            :itemMeta="{
              itemIndex: index + 1,
              count: getProgressPart.length,
              scores: getRequiredScores,
            }"
            @toggle="toggleCreateForm"
          >
          </progress-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ProgressPart from "./ProgressPart.vue";
import ProgressButton from "./ProgressButton.vue";
import MilestoneModel from "@/models/milestone.model";
import GQLForm from "@/lib/gqlform";

export default {
  components: {
    "progress-part": ProgressPart,
    "progress-button": ProgressButton,
  },
  props: {
    items: {
      type: Array,
      required: false,
      default: () => [],
    },
  },
  data: () => {
    return {
      loading: false,
      defaultItem: {
        description: "description",
        id: "1",
        /*    reward: "reward", */
        title: "title",
        requiredScore: 0,
        userCount: 0,
        users: [],
        _clickedIndex: null,
      },
      editItems: [
        {
          description: "description",
          id: "1",
          /*  reward: "reward", */
          title: "title",
          requiredScore: 0,
          userCount: 0,
          users: [],
          _clickedIndex: null,
        },
      ],
      isEditing: false,
    };
  },
  computed: {
    innerOverlayOpen() {
      if (this.items.length > 0) {
        return this.items.some((x) => x._clickedIndex) || this.isEditing;
      } else {
        return this.editItems.some((x) => x._clickedIndex) || this.isEditing;
      }
    },
    getProgressPart() {
      if (!this.isEditing) {
        if (this.items.length == 0) {
          const model = new MilestoneModel().deserialize(this.editItems[0]);

          return [model];
        } else {
          return this.items;
        }
      } else {
				return this.editItems;
			}
    },
    getRequiredScores() {
      if (this.items.length > 0) {
        return this.items.map((item) => {
          return { requiredScore: item.requiredScore, id: item.id };
        });
      } else {
        return [
          {
            requiredScore: this.editItems[0].requiredScore,
            id: this.editItems[0].id,
          },
        ];
      }
    },
  },
  methods: {
    isTextOverArea(selector) {
      this.$nextTick(() => {
        const el = document.getElementById(selector.toString());
        if (!el) return;

        return el.getBoundingClientRect().width < 150;
      });
    },

    toggleCreateForm(previous) {
      if (this.isEditing) {
        this.isEditing = !this.isEditing;
      }
      if (this.items.length > 0) {
        if (previous) {
          this.items.forEach((item) => (item._clickedIndex = null));
          this.items.find((item) => item.id == previous.id)._clickedIndex =
            previous.id;
        } else {
          this.items.forEach((item) => (item._clickedIndex = null));
        }
      } else {
        if (previous) {
          this.editItems[0]["_clickedIndex"] = previous.id;
        } else {
          this.editItems[0]["_clickedIndex"] = null;
        }
      }
    },
    async toggleEdit() {
      if (this.items.length > 0) {
        this.editItems = this.items.map((item) => {
          return {
            id: item.id,
            requiredScore: item.requiredScore,
            title: item.title,
            description: item.description,
          };
        });
      } else {
        this.editItems = [{ ...this.defaultItem }];
      }

      this.isEditing = !this.isEditing;
    },
    removeEditItem(part) {
      const editItems = this.editItems.filter((item) => item.id !== part.id);
      this.editItems = [...new Set(editItems)];
      console.log(this.editItems);
    },
    async saveEdits() {
      this.loading = true;
      console.log("1");
      console.log(this.editItems);
      const editItems = [
        ...new Set(
          this.editItems.map((item) => {
            console.log("2");
            console.log(item);
            return {
              id: item.id,
              requiredScore: item.requiredScore,
              title: item.title,
              description: item.description,
            };
          })
        ),
      ];
      console.log("3");
      console.log(this.editItems);

      const updateOrDeleteForm = new GQLForm({
        ...editItems,
      });
      await this.$store.dispatch(
        "milestone/updateOrDeleteMany",
        updateOrDeleteForm
      );

      await this.$store.dispatch("milestone/findAll", {
        force: true,
      });
      this.isEditing = !this.isEditing;
      this.loading = false;
    },
  },
};
</script>

<style>
.is-elevated-layer {
  z-index: 2;
}

.engage_progress_container {
  display: flex;
  border-radius: 5px;
  flex-direction: column;
  background: #fff;
  border-radius: 5px;
  margin-bottom: 20px;
}
.engage_progress_container-header {
  background: #fff;
  height: 60px;
  display: flex;
  align-items: flex-end;
  flex-direction: column;
  padding: 0 20px;
}

.engage_progress_container_body_item {
  height: 100%;
  max-width: 25%;
  background: #fff;
  display: flex;
}

.engage_progress_container-body-reward {
  background: white;
  justify-content: center;
  color: #4294d0;
  place-content: center;
}

.engage_progress_container-body-reward,
.engage_progress_container-body-score {
  box-shadow: rgb(0 0 0 / 35%) 0px 5px 15px;
  max-width: 150px;
  align-self: center;
  align-items: center;
  padding: 10px;
  margin-top: 10px;
  border-radius: 50px;
  display: flex;
  height: 40px;
}
.engage_progress_container-body-score {
  justify-content: space-between;
}
.engage_progress_container-body-reward-value,
.engage_progress_container-body-score-value {
  color: #4294d0;
  border: 1px solid #4294d0;
  border-radius: 50px;
  padding: 5px;
  min-width: 45px;
  background: white;
  display: flex;
  justify-content: center;
}

.engage_progress_container-body-score-text,
.engage_progress_container-body-reward-text {
  width: 100%;
  white-space: nowrap;
  margin-right: 5px;
}

.engage_progress_container-body-text {
  box-shadow: rgb(0 0 0 / 35%) 0px 5px 15px;
  overflow: hidden;
  margin: 20px 0;
  min-height: 140px;
}

.engage_progress_container-header-edit-text {
  font-size: 8px;
  color: black;
}

.engage_progress_container-header-edit {
  width: 40px;
  margin-bottom: 20px;
  height: 40px;
  text-align: center;
  margin-right: 40px;
  place-self: flex-end;
  color: #4294d0;
  background: #fff;
  border-radius: 50%;
  box-shadow: rgb(0 0 0 / 35%) 0px 5px 15px;
  cursor: pointer;
  transform: translate(0px, 15px);
}

.engage_progress_container-edit-input {
  font-size: 12px;
  outline: none;
  border: none;
}
.engage_progress_container_header-action {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.engage_progress_container-body {
  width: 100%;
  height: 100%;
	border-radius:5px;
  margin: auto;
  align-self: center;
  overflow: auto;
  justify-content: flex-start;
  background: #fff;
  display: flex;
  flex-direction: row;
}
.engage_body_scrollContainer {
  display: flex;
  flex-direction: row;
  max-width: 100%;
  width: 100%;
  margin: 0 40px;
  cursor: pointer;
  overflow: hidden;
}
.engage-header-edit-icon:before {
  transform: translate(0px, 5px);
}
.engage_progress_container_header-action-edit {
  display: flex;
  height: 100%;
  flex-direction: column;
}

.engage-header-edit-item-icon {
  color: #4294d0;
  transform: translate(0px, -12px);
}

.engage_progress_container_header-action-edit-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  place-content: center;
  height: 100%;
}
</style>
