<template>
  <b-card no-body class="idea_content-type-select_container">
    <div @click="createContentType" class="icon-container">
      <icoPlusBox width="30" height="30" />
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
            {{ item.contentType }}
          </div>
          <span @click.stop="editContentType(item)">
            <i class="mdi mdi-pencil"></i>
          </span>
        </div>

        <div class="idea_content-type-select_btnNewIdeaTemplate-item-badge">
          <b-badge
            pill
            variant="primary"
            v-if="item.id && item.id == primary.id"
            >{{ $t("first page") }}</b-badge
          >
        </div>

        <div class="idea_content-type-select_btnNewIdeaTemplate-item-comments">
          <b-badge pill variant="primary">{{
            comments.improvementsCount
          }}</b-badge>
        </div>
        <div class="idea_content-type-select_btnNewIdeaTemplate-item-comments">
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
}
.idea_content-type-select_container {
  display: flex;
  margin: 10px;
  flex-direction: row;
  background: transparent;
  position: absolute;
  width: 350px;
  margin-left: -230px;
  & > .icon-container {
    margin-right: 10px;
    display: flex;
    cursor: pointer;
    & > svg {
      transform: translate(0px, -2px);
    }
  }
}
.idea_content-type-select_btnNewIdeaTemplate-item {
  font-size: 16px;
  margin: 5px 10px;
  cursor: pointer;
  color: #9fa0a0;
  align-items: center;
  display: flex;
  justify-content: space-between;

  &:last-child {
    margin-bottom: 10px;
  }
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
  flex-grow: 20;
  & > div {
    overflow: hidden;
    text-overflow: ellipsis;
  }
  & > span {
    margin-left: 5px;
  }
}
.idea_content-type-select_btnNewIdeaTemplate-item-badge {
  margin: 0 2.5px;
  flex-grow: 1;
  max-width: 65px;
  & > span {
    font-weight: 400;
  }
}

.idea_content-type-select_btnNewIdeaTemplate-item-comments {
  flex-grow: 1;
  max-width: 25px;
  & > span {
    margin: 2.5px;
    border-radius: 20%;
  }
}
</style>
