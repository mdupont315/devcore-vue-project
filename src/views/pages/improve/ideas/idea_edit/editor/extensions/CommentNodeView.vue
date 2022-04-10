<template>
  <node-view-wrapper as="div" class="comment-component">
    <node-view-content class="content-dom" />

    <section v-if="comments.length" class="comment-details">
      <article class="comment" v-for="(comment, i) in comments" :key="i">
        {{ comment.content }}

        <div class="comment-actions">
          <span v-if="comment.file && comment.file.link" class="file">
            <a
              @click.prevent.stop="openUrl(comment.file.link)"
              :href="comment.file.link"
              :data-title="comment.file.name"
              target="__blank"
            >
              <img
                slot="reference"
                class="folder-icon"
                :src="FolderIcon"
                alt=""
              />
            </a>
          </span>

          <!-- <popper trigger="clickToToggle" :options="{ placement: 'top' }" class="test">
          <div class="popper">
            <span> Here, it'll show the rating system and stuff. </span>
          </div> -->
          <span>
            <img
              slot="reference"
              @click="isReplying = !isReplying"
              class="comment-icon"
              :src="CommentIcon"
              alt=""
            />
          </span>
        </div>
        <!-- </popper> -->

        <div v-if="isReplying">
          <div>{{ comment.content }}}</div>
          <!-- <improvement-feedback
            style="margin-left: 20px; max-height: 46px"
            :item="item"
            :itemDescription="item.description"
            :user="item.author"
            refTarget="improvementFeedbackIcon"
            :textPlaceholder="$t('Improvement feedback')"
            type="improvementFeedback"
            @toggle="togglePopOverFeedback"
            @save="saveImprovementReply"
            @close="closeImprovementForFeedback"
            :openState="isReplying"
          >
            <small
              class="d-block text-gray"
              style="line-height: 1em; align-self: center"
              >{{ $t("Feedback") }}</small
            >
          </improvement-feedback> -->
        </div>
      </article>
    </section>
  </node-view-wrapper>
</template>

<script>
import { NodeViewWrapper, nodeViewProps, NodeViewContent } from "@tiptap/vue-2";
import Popper from "vue-popperjs";
import "vue-popperjs/dist/vue-popper.css";

import { CommentIcon } from "@/assets";
import { FolderIcon } from "@/assets";

export default {
  components: {
    NodeViewWrapper,
    NodeViewContent,
    // Popper,
  },

  props: nodeViewProps,

  data() {
    return {
      CommentIcon,
      FolderIcon,

      isReplying: false,
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
	.comment-actions{
    margin-left:10px
  }
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
			display:flex;

      .file {
        margin-left: 10px;
        a {
          cursor: pointer;
          pointer-events: all;
          text-decoration: underline;

          &:hover {
            &::after {
              content: attr(data-title);
              margin: 0 4px;
							z-index:1;
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
