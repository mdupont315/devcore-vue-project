<template>
  <div class="engage_progress_container">
    <!--   <div class="engage_progress_container-header"> -->
    <!-- v-if="items.length > 0 && !isEditing" -->
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
      <!--  </div> -->
    </div>
    <!--   <div v-else class="engage_progress_container-header"></div> -->

    <inner-overlay
      v-if="innerOverlayOpen"
      style="z-index: 1"
      @click="toggleCreateForm"
    ></inner-overlay>
    <div
      class="engage_progress_container-body"
      style="display: flex; flex-direction: row"
    >
      <div
        v-for="(part, index) in getProgressPart"
        :key="index"
        class="engage_progress_container_body_item"
      >
        <progress-part
          :item="part"
          :itemMeta="{
            itemIndex: index + 1,
            count: getProgressPart.length,
          }"
        >
          <!-- Delete -->

          <div
            v-if="isEditing"
            @click="removeItem(part)"
            class="
              deleteIcon
              engage_progress_container_body_item-delete
              is-elevated-layer
            "
          >
            <i class="mdi mdi-trash-can" />
          </div>

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
            class="engage_progress_container-body-reward"
            :class="{ 'is-elevated-layer': isEditing }"
          >
            <div v-if="!isEditing">{{ part.reward }}</div>
            <div v-else>
              <input
                type="text"
                class="form-control engage_progress_container-edit-input"
                :placeholder="part.reward"
                v-model="editItems[index].reward"
              />
            </div>
          </div>

          <div class="engage_progress_container-body-text">
            <b-card v-if="!isEditing">
              <b-card-title
                v-b-tooltip="{
                  title: part.title ? part.title : '',
                  placement: 'topright',
                  variant: 'light',
                }"
                :disabled="isTextOverArea(part.id)"
                :class="{ 'is-elevated-layer': isEditing }"
                style="
                  overflow: hidden;
                  white-space: nowrap;
                  text-overflow: ellipsis;
                "
                >{{ part.title }}</b-card-title
              >
              <b-card-text
                :id="`engage_progress_container-body-text-area-${part.id}`"
                v-b-tooltip="{
                  title: part.description ? part.description : '',
                  placement: 'topright',
                  variant: 'light',
                }"
                :ref="`engage_progress_container-body-text-area-${part.id}`"
              >
                {{ part.description ? part.description : $t("No description") }}
              </b-card-text>
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
                <textarea
                  trigger="hover"
                  :placeholder="part.description"
                  v-model="editItems[index].description"
                  class="form-control rounded-0"
                  rows="3"
                ></textarea>
              </div>
            </b-card>
          </div>
        </progress-part>
        <progress-button
          :item="part"
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
        reward: "reward",
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
          reward: "reward",
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
      if (this.items.length == 0) {
        const model = new MilestoneModel().deserialize(this.editItems[0]);

        return [model];
      } else {
        return this.items;
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
    isTextOverArea(id) {
      const el = document.getElementById(
        `engage_progress_container-body-text-area-${id}`
      );
      if (!el) return;
      console.log(el.clientHeight);
      return el.clientHeight > 150;
    },
    removeItem(part) {
      this.editItems = this.editItems.filter((item) => item.id !== part.id);
      console.log(part);
      if (this.editItems.length === 0) {
        this.editItems = [{ ...this.defaultItem }];
      }
      console.log(this.editItems);
      this.$store.dispatch("milestone/delete", part);
    },
    toggleCreateForm(previous) {
      if (this.isEditing) {
        this.isEditing = !this.isEditing;
      }
      console.log(previous);
      if (this.items.length > 0) {
        if (previous) {
          console.log("HI");
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
            reward: item.reward,
            title: item.title,
            description: item.description,
          };
        });
      } else {
        this.editItems = [{ ...this.defaultItem }];
      }

      this.isEditing = !this.isEditing;
      console.log("toggle edit!");
    },
    async saveEdits() {
      console.log(this.editItems);
      this.loading = true;
      const editItems = this.editItems.map((item) => {
        return {
          id: item.id,
          requiredScore: item.requiredScore,
          reward: item.reward,
          title: item.title,
          description: item.description,
        };
      });

      const updateOrDeleteForm = new GQLForm({
        ...editItems,
      });
      await this.$store.dispatch(
        "milestone/updateOrDeleteMany",
        updateOrDeleteForm
      );
      /* else {
        //Creating via default object
        await this.$store.dispatch(
          "milestone/create",
          new GQLForm({
            title: this.editItems[0].title,
            description: this.editItems[0].description,
            requiredScore: this.editItems[0].requiredScore,
            reward: this.editItems[0].reward,
          })
        );
      } */

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

.engage_progress_container_body_item-delete {
  background: #dc3545;
  color: #fff;
  width: 1.8rem;
  height: 1.8rem;
  display: block;
  border-radius: 3px;
  padding: 3px;
  right: 5px;
  z-index: 1;
  top: 5px;
  cursor: pointer;
  align-self: flex-end;
  align-items: center;
  transform: translate(0px, -120px);
}

.engage_progress_container {
  display: flex;
  flex-direction: column;
  background: #fff;
  height: 100%;
  margin-right: 15px;
  border-radius: 5px;
  margin-left: 15px;
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
  width: 100%;
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
  width: 150px;
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
}

.engage_progress_container-body-text {
  box-shadow: rgb(0 0 0 / 35%) 0px 5px 15px;
  overflow: hidden;
  margin: 20px;
  min-height: 140px;
  max-height: 140px;
}

.engage_progress_container-header-edit-text {
  font-size: 8px;
  color: black;
}

.engage_progress_container-header-edit {
  width: 40px;
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
  margin: auto;
  align-self: center;
  justify-content: flex-start;
  background: #fff;
  display: flex;
  flex-direction: row;
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
