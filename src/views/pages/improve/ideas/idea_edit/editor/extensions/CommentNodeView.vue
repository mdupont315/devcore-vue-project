<template>
  <node-view-wrapper as="div" class="comment-component">
    <node-view-content class="content-dom" />

    <section v-if="comments.length" class="comment-details">
      <article class="comment" v-for="(comment, i) in comments" :key="i">
        {{ comment.content }}

        <span v-if="comment.file.link" class="file">
          <a
            @click.prevent.stop="openUrl(comment.file.link)"
            :href="comment.file.link"
            target="__blank"
          >
            {{ comment.file.name || comment.file.link }}
          </a>
        </span>

        <popper
          trigger="clickToToggle"
          :options="{ placement: 'top' }"
        >
          <div class="popper">
            <span>
              Here, it'll show the rating system and stuff.
            </span>
          </div>

          <img
            slot="reference"
            class="comment-icon"
            :src="CommentIcon"
            alt=""
          />
        </popper>
      </article>
    </section>
  </node-view-wrapper>
</template>

<script>
import { NodeViewWrapper, nodeViewProps, NodeViewContent } from "@tiptap/vue-2";
import Popper from "vue-popperjs";
import "vue-popperjs/dist/vue-popper.css";

import { CommentIcon } from "@/assets";

export default {
  components: {
    NodeViewWrapper,
    NodeViewContent,
    Popper,
  },

  props: nodeViewProps,

  data() {
    return {
      CommentIcon,
    };
  },

  methods: {
    /**
     * Example of how to update attributes
     */
    // increase() {
    //   this.updateAttributes({
    //     count: this.node.attrs.count + 1,
    //   });
    // },
    openUrl(link) {
      window.open(link, "__blank");
    },
  },

  computed: {
    commentEntity() {
      const stringCommentEntity = this.node?.attrs?.comment;

      return stringCommentEntity ? JSON.parse(stringCommentEntity) : {};
    },
    comments() {
      return this.commentEntity?.comments || [];
    },
  },
};
</script>

<style lang="scss">
.comment-component {
  .content-dom {
    background-color: #d0e4f3;
    border-radius: 4px;
    padding: 4px;
  }

  .comment-details {
    border-radius: 8px;
    padding: 8px;

    .comment {
      color: #4294d0;

      .file {
        a {
          cursor: pointer;
          pointer-events: all;
          text-decoration: underline;

          &:hover {
            &::after {
              content: "File: " attr(href);
              margin: 0 4px;
              position: absolute;
              background: white;
              border-radius: 8px;
              padding: 4px;
              box-shadow: 0 0 5px rgba(gray, 0.5);
              text-decoration: underline;
            }
          }
        }
      }

      .comment-icon {
        cursor: pointer;
        margin-left: 1em;
        height: 16px;
      }
    }
  }
}
</style>
