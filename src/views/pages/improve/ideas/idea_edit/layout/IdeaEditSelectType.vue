<template>
  <b-card no-body class="idea_content-type-select_container">
    <div @click="createContentType" class="icon-container">
      <icoPlusBox width="42" height="42" />
    </div>
    <b-card-body class="idea_content-type-select_container-items">
      <div
        v-for="(item, index) in categories"
        :key="index"
        class="idea_content-type-select_btnNewIdeaTemplate-item"
      >
        <div
          class="idea_content-type-select_btnNewIdeaTemplate-item-contentType"
        >
          <confirm-button
            v-if="selectedIdeaContentHasChanges(item)"
            class="
              idea_content-type-select_btnNewIdeaTemplate-item-confirm-button
            "
            @confirm="changeContentType(item)"
            :customButton="true"
            :confirmPlacement="'left'"
            :confirmMessage="getConfirmMessage(item)"
          >
            <div
              :class="{
                'is-active': isIndexSelected(index),
              }"
              class="
                idea_content-type-select_btnNewIdeaTemplate-item-contentType-title
              "
            >
              {{ !item.contentType ? $t("unnamed_type") : item.contentType }}
            </div>
          </confirm-button>
          <div
            v-else
            @click="changeContentType(item)"
            class="
              idea_content-type-select_btnNewIdeaTemplate-item-contentType-title
            "
            :class="{
              'is-active': isIndexSelected(index),
            }"
          >
            {{ !item.contentType ? $t("unnamed_type") : item.contentType }}
          </div>
        </div>

        <div class="idea_content-type-select_btnNewIdeaTemplate-item-badge">
          <b-badge
            pill
            variant="primary"
            v-if="item.id && item.id == primary.id"
            >{{ $t("first page") }}</b-badge
          >
        </div>

        <div class="idea_content-type-select_btnNewIdeaTemplate-item-edit">
          <span @click.stop="editContentType(item)">
            <i class="mdi mdi-pencil"></i>
          </span>
        </div>

        <div class="idea_content-type-select_btnNewIdeaTemplate-item-comments">
          <b-badge pill variant="primary">{{
            getImprovementsFrom(item)
          }}</b-badge>
          <b-badge pill variant="danger"> {{ getProblemsFrom(item) }}</b-badge>
        </div>
      </div>
    </b-card-body>
  </b-card>
</template>

<script>
import icoPlusBox from "@/assets/img/icons/svg/ico-plus-box.svg?inline";

export default {
  components: {
    icoPlusBox: icoPlusBox,
  },
  props: {
    categories: {
      type: Array,
      required: true,
      default: () => [],
    },
    primary: {
      type: Object,
      required: true,
      default: () => {},
    },
    ideaContentIsDirty: {
      type: String,
      default: null,
    },
    comments: {
      type: Array,
      required: true,
      default: () => [],
    },
    selected: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  methods: {
    isIndexSelected(index) {
      return index == this.selected;
    },
    getConfirmMessage(item) {
      return this.$t("Unsaved Idea Data In Type", {
        title: item.contentType ?? this.$t("unnamed_type"),
      });
    },
    selectedIdeaContentHasChanges(item) {
      const selectedCategory = this.categories[this.selected];

      return (
				selectedCategory &&
        selectedCategory.id &&
        this.ideaContentIsDirty &&
        selectedCategory.id == this.ideaContentIsDirty &&
        item.id !== this.ideaContentIsDirty
      );
    },
    getImprovementsFrom(item) {
      const commentObj = this.comments.find((x) => x.id === item.id);
      return commentObj.comments.improvements ?? 0;
    },
    getProblemsFrom(item) {
      const commentObj = this.comments.find((x) => x.id === item.id);
      return commentObj.comments.problems ?? 0;
    },
    createContentType() {
      this.$emit("create");
    },
    editContentType(item) {
      this.$emit("expand", item);
    },
    changeContentType(item) {
      if (
        item.id &&
        this.categories[this.selected].id &&
        item.id === this.categories[this.selected].id
      ) {
        return;
      }
      this.$emit("select", item);
    },
  },
};
</script>

<style lang="scss">
.idea_content-type-select_container-items {
  padding: 0;
  background: #fff;
  border-radius: 3px;
  display: flex;
  flex-direction: column;
  height: 100%;
  display: flex;
}
.idea_content-type-select_container {
  display: flex;
  margin: 7.5px;
  flex-direction: row;
  background: transparent;
  position: fixed;
  width: 450px;
  top: 180px;
  margin-left: -331px;
  & > .icon-container {
    margin-right: 5px;
    margin-top: 1px;
    display: flex;
    align-items: flex-start;
    display: flex;

    & > svg {
      transform: translate(0px, -2px);
      cursor: pointer;
    }
  }
}
.idea_content-type-select_btnNewIdeaTemplate-item {
  font-size: 16px;
  padding: 5px 13px 5px 10px;
  color: #9fa0a0;
  align-items: center;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  height: 40px;

  &.is-active {
    color: #4294d0;
  }
}
.idea_content-type-select_btnNewIdeaTemplate-item-confirm-button {
  font-size: 16px;
  color: #9fa0a0;
  align-items: center;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  height: 40px;
  width: 100%;
  margin-left: 0;
  & > .confirm-buttom-custom {
    margin-left: 0;
    font-size: 14px;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
    border-radius: 3px;
    > .idea_content-type-select_btnNewIdeaTemplate-item-contentType-title {
      color: #9fa0a0;
    }

    > div {
      padding: 3px 5px;
    }
  }
}

.idea_content-type-select_btnNewIdeaTemplate-item-contentType-title:not(.is-active):hover {
  color: #fff;
  background: #4294d0 !important;
  border-color: #4294d0;
}

.idea_content-type-select_btnNewIdeaTemplate-item-contentType {
  width: 115px;
  display: flex;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0px 5px 0 0;
  flex-grow: 10;
  font-size: 14px;
  font-family: FuturaLight;

  & > .idea_content-type-select_btnNewIdeaTemplate-item-contentType-title {
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
    padding: 3px 5px;
    border-radius: 3px;
  }
  & > span {
    margin-left: 5px;
  }
}
.idea_content-type-select_btnNewIdeaTemplate-item-contentType-title.is-active {
  color: #4294d0;
}
.idea_content-type-select_btnNewIdeaTemplate-item-badge {
  margin: 0 2.5px;
  flex-grow: 1;
  max-width: 65px;
  width: 40px;
  display: flex;
  justify-content: flex-end;
  & > span {
    font-weight: 400;
  }
}

.idea_content-type-select_btnNewIdeaTemplate-item-edit {
  flex-grow: 1;
  display: flex;
  justify-content: flex-end;
  cursor: pointer;
  & > span {
    width: 100%;
    border-radius: 3px;
    display: flex;
    place-content: center;
  }
  &:hover {
    & > span {
      color: #fff;
      background: #4294d0 !important;
      border-color: #4294d0;
    }
  }
}

.idea_content-type-select_btnNewIdeaTemplate-item-comments {
  display: flex;
  flex-grow: 1;
  justify-content: flex-end;
  max-width: 55px;
  & > span {
    margin: 2.5px;
    border-radius: 20%;
  }
}
</style>
