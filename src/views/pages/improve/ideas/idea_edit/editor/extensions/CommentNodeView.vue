<template>
  <node-view-wrapper
    as="div"
    class="comment-component"
    :class="`comment-container-${ideaUUID}`"
  >
    <inner-overlay
      v-if="isReplying"
      @click="closeOverlay()"
      style="z-index: 2"
    />

    <node-view-content class="content-dom" />

    <section v-if="comments.length > 0" class="comment-details">
      <template class="comment" v-for="(comment, i) in comments">
        <article v-if="!isCommentReplied(comment)" :key="i" class="comment">
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
              :title="$t('Leave a reply')"
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
      </template>
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
      activeCommentIndex: null,
    };
  },
  created() {
    if (this.editor && this.editor.isActive("comment")) {
      setTimeout(() => {
        this.editor.commands.dedupeComments(this.node);
      });
    }
  },
  beforeDestroy() {
    if (this.editor && this.editor.isActive("comment")) {
      setTimeout(() => {
        this.editor.commands.transformComments(this.node);
      }, 300);
    }
  },

  methods: {
    openReplyForm(comment, index) {
      this.activeCommentIndex = index;
      this.isReplying = comment.id;
    },
    savedReply(id) {
      this.isReplying = null;

      const data = {
        uuid: this.commentEntity.uuid,
        ideaUuid: this.commentEntity.ideaUuid,
        comments: this.commentEntity.comments.filter((x) => x.id !== id),
      };

      this.updateAttributes({
        comment: JSON.stringify(data),
      });

      const { getPos, node } = this;

      const from = getPos();
      const to = from + node.nodeSize;

      if (this.editor) {
        //textSelection({})
        this.editor.commands.focus("start");
        this.editor.commands.saveReply(to);
      }
    },
    closeOverlay() {
      this.activeCommentIndex = null;
      this.isReplying = null;
    },
    openUrl(link) {
      window.open(link, "__blank");
    },
    isCommentReplied(comment) {
      return !!comment.replied;
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
    ideaUUID() {
      //TODO: ideauuid gets overwritten when reply and updateattributes doesnt set it
      return this.commentEntity?.uuid || "";
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
    border-radius: 4px;
    padding: 4px;
    color: #707070 !important;
    font-size: 14px !important;
    font-family: FuturaLight !important;
  }

  .comment-details {
    border-radius: 8px;
    padding: 8px;

    .idea_comment_IMPROVEMENT {
      background: #d0e4f3;
      color: #707070;
      border-radius: 5px;
      padding: 0px 5px;
      margin: 2px 0px;
    }
    .idea_comment_PROBLEM {
      background: #d0424d;
      border-radius: 5px;
      padding: 0px 5px;
      margin: 2px 0;
    }

    // @keyframes opacityanimation {
    //   from {
    //     opacity: 0;
    //   }
    //   to {
    //     opacity: 1;
    //   }
    // }

    .comment {
      color: #fff;
      display: flex;
    // animation-name: opacityanimation;
   //   animation-duration: 1s;

      .file {
        margin-left: 10px;
        a {
          cursor: pointer;
          pointer-events: all;
          text-decoration: underline;
        }
      }

      .comment-icon {
        transform: translate(0px, 2px);
        cursor: pointer;
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
