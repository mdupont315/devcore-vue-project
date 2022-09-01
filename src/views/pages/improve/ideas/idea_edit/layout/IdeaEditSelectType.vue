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
        :class="{
          'is-active': index == selected,
        }"
        @click="changeContentType(item)"
      >
        <div
          class="idea_content-type-select_btnNewIdeaTemplate-item-contentType"
        >
          <div>
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
            comments.improvementsCount
          }}</b-badge>
          <b-badge pill variant="danger">{{ comments.problemCount }}</b-badge>
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
    comments: {
      type: Object,
      required: true,
      default: () => {},
    },
    selected: {
      type: Number,
      default: 0,
    },
  },
  methods: {
    createContentType() {
      this.$emit("create");
    },
    editContentType(item) {
      this.$emit("expand", item);
    },
    changeContentType(item) {
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
  margin: 10px;
  flex-direction: row;
  background: transparent;
  position: fixed;
  width: 400px;
  top: 185px;
  margin-left: -281px;
  & > .icon-container {
    margin-right: 10px;
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
  padding: 5px 10px;
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

.idea_content-type-select_btnNewIdeaTemplate-item-contentType {
  width: 115px;
  display: flex;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0px 5px;
  flex-grow: 10;

  & > div {
    overflow: hidden;
    text-overflow: ellipsis;
		cursor: pointer;
  }
  & > span {
    margin-left: 5px;
  }
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
}

.idea_content-type-select_btnNewIdeaTemplate-item-comments {
  display: flex;
  flex-grow: 1;
  justify-content: flex-end;
  & > span {
    margin: 2.5px;
    border-radius: 20%;
  }
}
</style>
