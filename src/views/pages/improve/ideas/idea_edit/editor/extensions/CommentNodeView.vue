<template>
  <node-view-wrapper as="div" class="comment-component">
    <layer v-if="isReplying" @closed="closeOverlay()" />

    <node-view-content class="content-dom" />

    <section v-if="comments.length" class="comment-details">
      <article class="comment" v-for="(comment, i) in comments" :key="i">
        <span :class="`idea_comment_${comment.type}`">
          {{ comment.content }}
        </span>

        <div
          class="comment-actions"
          :class="`comment-actions-${comment.id}`"
          ref="test"
        >
          <span
            v-if="comment.file && comment.file.link"
            class="file"
            v-b-tooltip="{ placement: 'top', boundary: 'viewport' }"
            :title="comment.file.name"
          >
            <a
              @click.prevent.stop="openUrl(comment.file.link)"
              :href="comment.file.link"
              :data-title="comment.file.name"
              target="__blank"
            >
              <img
                slot="folder_reference"
                class="folder-icon"
                :src="FolderIcon"
                alt=""
              />
            </a>
          </span>

          <span
            v-b-tooltip="{ placement: 'top', boundary: 'viewport' }"
            :title="$t('reply')"
            :class="`comment_replyIcon-${comment.id}`"
            :ref="`comment_replyIcon-${comment.id}`"
          >
            <img
              slot="comment_reference"
              style="margin-top: -3px"
              @click="openReplyForm(comment, i)"
              class="comment-icon"
              :src="CommentIcon"
              alt=""
            />
          </span>
        </div>
        <!-- getReplyIconRef(comment.id) -->
        <b-popover
          ref="popover"
          :target="() => $refs[`comment_replyIcon-${comment.id}`][0]"
          boundary="window"
          placement="top"
          :show="isReplying === comment.id"
          custom-class="general-reply-form"
        >
          <reply-form
            @close="isReplying = null"
            @savedReply="savedReply"
            :anonymous="comment.anonymous"
            :userId="comment.user"
            :content="comment.content"
            :comment="comment"
          ></reply-form>
        </b-popover>
      </article>
    </section>
  </node-view-wrapper>
</template>

<script>
import { NodeViewWrapper, nodeViewProps, NodeViewContent } from "@tiptap/vue-2";

import { CommentIcon, FolderIcon } from "@/assets";
import ReplyForm from "@/components/global/ReplyForm.vue";

export default {
  components: {
    NodeViewWrapper,
    NodeViewContent,
    "reply-form": ReplyForm,
  },

  props: nodeViewProps,

  data() {
    return {
      CommentIcon,
      FolderIcon,
      isReplying: null,
    };
  },

  methods: {
    openReplyForm(comment) {
      console.log("OPEN FORM!");
      console.log(comment);
      this.isReplying = comment.id;
    },
    savedReply(id) {
      this.isReplying = null;
      this.editor.commands.unsetComment(this.node?.attrs?.comment, id);
    },
    closeOverlay() {
      this.isReplying = null;
    },

    getReplyIconRef(id) {
      console.log();
      console.log("GET REF TARGET");
      console.log(id);

      return `comment_replyIcon-${id}`;
    },
    /**
     * Example of how to update attributes
     */
    // increase() {
    //   this.updateAttributes({
    //     count: this.node.attrs.count + 1,
    //   });
    // },
    getCommentRef(comment) {
      console.log(comment);
      const ref = `comment_replyIcon-${comment.id}`;
			console.log(ref)
			console.log(this.$refs)
      return `comment_replyIcon-${comment.id}`;
    },
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
  .comment-actions {
    margin-left: 10px;
  }
  .content-dom {
    background-color: #d0e4f3;
    border-radius: 4px;
    padding: 4px;
  }

  .comment-details {
    border-radius: 8px;
    padding: 8px;

    .idea_comment_IMPROVEMENT {
      color: #4294d0;
    }
    .idea_comment_PROBLEM {
      color: #d0424d;
    }

    .comment {
      display: flex;

      .file {
        margin-left: 10px;
        a {
          cursor: pointer;
          pointer-events: all;
          text-decoration: underline;

          // &:hover {
          //   &::after {
          //     content: attr(data-title);
          //     margin: 0 4px;
          //     z-index: 1;
          //     position: absolute;
          //     background: white;
          //     border-radius: 8px;
          //     padding: 4px;
          //     box-shadow: 0 0 5px rgba(gray, 0.5);
          //     text-decoration: underline;
          //   }
          // }
        }
      }

      .comment-icon {
        transform: translate(0px, 2px);
        cursor: pointer;
        margin-left: 1em;
        height: 16px;

        &:hover {
          &::after {
            content: "ASDASDAS";
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
  }
}
</style>
