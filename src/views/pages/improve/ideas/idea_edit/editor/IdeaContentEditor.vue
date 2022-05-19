<template>
  <div
    class="idea_editor_content"
    id="idea_editor_content"
  >
    <div class="editor" v-if="editor">
      <div class="editor_header_border">
        <menu-bar class="editor__header" :editor="editor" />
      </div>
      <editor-content
        class="editor__content"
        id="editor__content"
        :editor="editor"
        style="min-height: 70vh"
        ref="editor_content"
      />

      <div class="editor__footer"></div>
    </div>
  </div>
</template>

	<script>
import { mapGetters } from "vuex";
import { EditorContent, BubbleMenu } from "@tiptap/vue-2";
import { MenuBar } from "./parts";
import ContentEditor from "./EditorLoader.js";

/* eslint-disable */
export default {
  components: {
    EditorContent,
    MenuBar,
    BubbleMenu,
  },
  props: {
    idea: {
      type: Object,
      required: false,
    },
    contentType: {
      type: String,
      required: true,
    },
    value: {
      type: Object,
      default: () => {},
    },
    isEditable: {
      type: Boolean,
      default: () => false,
    },
    isSaving: {
      type: Boolean,
      default: () => false,
    },
    scrollToSelection: {
      type: Number,
      default: () => null,
    },
  },
  computed: {
    ...mapGetters({
      user: "auth/user",
    }),
  },
  watch: {
    "value.markup": {
      handler(newVal) {
        //Todo scroll to content
      },
    },
    isEditable: {
      handler(newVal) {
        this.editor.setEditable(newVal);
        if (newVal) {
          this.focusEditor();
        }
      },
    },
  },

  data() {
    return {
      provider: null,
      editor: null,
      status: "connecting",
    };
  },
  methods: {
    focusEditor() {
			console.log("focusing")
      this.editor?.commands.focus();
    },
    transformProcessedCommentNodesToParagraph() {
      const comments = [];

      const {
        state: { doc, tr, schema },
        view: { dispatch },
      } = this.editor;

      doc.descendants((node, pos) => {
        if (node.type.name !== "comment") return;

        comments.push({
          from: pos,
          to: pos + node.nodeSize,
          comment: JSON.parse(node.attrs.comment),
          shouldDelete: false,
          content: node.content,
        });
      });

      for (const comment of comments) {
        const { from, to, comment: commentData } = comment;

        const shouldRemoveComment = !commentData.comments.length;

        if (!shouldRemoveComment) continue;

        const newParagraphWithContent = schema.nodes.paragraph.create(
          {},
          comment.content
        );

        const replaceTransaction = tr.replaceRangeWith(
          from,
          to,
          newParagraphWithContent
        );

        dispatch(replaceTransaction);
      }
    },

    initEditor() {
      if (this.editor) this.editor.destroy();
      if (this.provider) this.editor.destroy();

      const fileHandlers = {
        addFile: async (file) => {
          this.$emit("fileAdded", file);
        },
        removeFile: (file) => {
          this.$emit("fileRemoved", file);
        },
        notify: (file, limit) => {
          const formatSize = (bytes, decimalPoint) => {
            if (bytes == 0) return "0 Bytes";
            var k = 1000,
              dm = decimalPoint || 2,
              sizes = ["Bytes", "KB", "MB", "GB"],
              i = Math.floor(Math.log(bytes) / Math.log(k));
            return (
              parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
            );
          };

          const message = this.$t("File size too big", {
            file: file.name,
            size: formatSize(file.size, 2),
            limit: formatSize(limit),
          });
          window.vm.$snotify.error(window.vm.$t(message));
        },
      };

      const saveContent = async (scrollToSelection) => {
        this.transformProcessedCommentNodesToParagraph();

        setTimeout(() => {
          this.$emit("contentScrollPosition", scrollToSelection);
          this.$emit("saveContent");
        }, 200);
      };

      const editorInstance = new ContentEditor(
        this.isEditable,
        this.value.markup,
        {
          onUpdate: (content) => {
            this.$emit("input", {
              contentType: this.value.contentType,
              markup: content,
            });
          },
        },
        fileHandlers,
        saveContent
      );

      this.editor = editorInstance.editor;
      this.$emit("initialized");
      if (this.scrollToSelection) {
        console.log(this.scrollToSelection);
        setTimeout(() => {
          console.log(this.scrollToSelection);
          this.editor.commands.focus(this.scrollToSelection);
          this.$emit("contentScrollPosition", null);
        });
      }
    },
    addParagraphAtEnd() {
      if (!this.editor) throw new Error("editor not defined");

      this.editor.commands.focus("end");
      this.editor.commands.insertContent("<p> </p>");
    },
  },

  mounted() {
    this.initEditor();
  },
  beforeDestroy() {
    this.editor.destroy();
    // this.provider.destroy();
  },
};
</script>


<style lang="scss" >
/* Setup */

.editor__header {
  border-top: 1px solid lightgray;
}

.editor_header_border {
  border-bottom: 1px solid lightgray;
}

.idea_editor_content {
  background: #fff;
  flex-grow: 1;
  border-radius: 3px;
  max-height: calc(100% - 60px);
  height: 100%;
}
.editor {
  display: flex;
  flex-direction: column;
  max-height: 26rem;
  color: #0d0d0d;
  background-color: #fff;
  border-radius: 0.75rem;
  min-height: 100%;

  &__header {
    display: flex;
    align-items: center;
    flex: 0 0 auto;
    flex-wrap: wrap;
    height: 50px;
    padding: 0 20px 5px 5px;
  }

  &__content {
    padding: 1.25rem 2rem;
    cursor: text;
    flex: 1 1 auto;
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  &__footer {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    white-space: nowrap;
    font-size: 12px;
    font-weight: 600;
    color: #0d0d0d;
    white-space: nowrap;
    padding: 0.25rem 0.75rem;
  }

  /* Some information about the status */
  &__status {
    display: flex;
    align-items: center;
    border-radius: 5px;

    &::before {
      content: " ";
      flex: 0 0 auto;
      display: inline-block;
      width: 0.5rem;
      height: 0.5rem;
      background: rgba(#0d0d0d, 0.5);
      border-radius: 50%;
      margin-right: 0.5rem;
    }

    &--connecting::before {
      background: #616161;
    }

    &--connected::before {
      background: #b9f18d;
    }
  }

  &__name {
    button {
      background: none;
      border: none;
      font: inherit;
      font-size: 12px;
      font-weight: 600;
      color: #0d0d0d;
      border-radius: 0.4rem;
      padding: 0.25rem 0.5rem;

      &:hover {
        color: #fff;
        background-color: #0d0d0d;
      }
    }
  }
}
/* Table */
.ProseMirror {
  height: 100%;
  table {
    border-collapse: collapse;
    table-layout: fixed;
    width: 100%;
    margin: 0;
    overflow: hidden;

    tbody > tr:nth-child(odd) {
      background: #c7dbfc;
    }

    td,
    th {
      min-width: 1em;
      border: 2px solid #ced4da;
      padding: 3px 5px;
      vertical-align: top;
      box-sizing: border-box;
      position: relative;
      font-size: 14px;
      > * {
        margin-bottom: 0;
      }
    }

    td {
      font-family: FuturaLight;
      color: #707070;
    }

    th {
      font-weight: bold;
      text-align: left;
      background-color: #4294d0;
      color: #fff;
      font-size: 14px;
      font-family: FuturaMedium;
    }

    .selectedCell:after {
      z-index: 2;
      position: absolute;
      content: "";
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      background: rgba(200, 200, 255, 0.4);
      pointer-events: none;
    }

    .column-resize-handle {
      position: absolute;
      right: -2px;
      top: 0;
      bottom: -2px;
      width: 4px;
      background-color: #adf;
      pointer-events: none;
    }
  }
  p {
    color: #707070 !important;
    font-size: 14px !important;
    font-family: FuturaLight !important;
    font-weight: 400;
    margin-bottom: 4px !important;
    margin-top: 4px !important;
    margin-block-start: 4px !important;
    margin-block-end: 4px !important;
  }
	p > a {
		cursor:pointer;
	}
  h1 {
    color: #242526 !important;
    font-size: 18px !important;
    font-family: FuturaBold !important;
    font-weight: 400;
    margin-bottom: 0.5em;
  }
  h2 {
    color: #242526 !important;
    font-size: 14px !important;
    font-family: FuturaMedium !important;
    font-weight: 400;
  }
  h3 {
    color: #4294d0 !important;
    font-size: 14px !important;
    font-family: FuturaMedium !important;
    font-weight: 400;
  }

  p > span {
    color: #707070 !important;
    font-size: 14px !important;
    font-family: FuturaLight !important;
    font-weight: 400;
  }
  h1 > span {
    color: #242526 !important;
    font-size: 18px !important;
    font-family: FuturaBold !important;

    font-weight: 400;
  }
  h2 > span {
    color: #242526 !important;
    font-size: 14px !important;
    font-family: FuturaMedium !important;
    font-weight: 400;
  }
  h3 > span {
    color: #4294d0 !important;
    font-size: 14px !important;
    font-family: FuturaMedium !important;
    font-weight: 400;
  }
}

/* Give a remote user a caret */
.collaboration-cursor__caret {
  position: fixed;
  margin-left: -1px;
  margin-right: -1px;
  word-break: normal;
  pointer-events: none;
}

/* Render the username above the caret */
.collaboration-cursor__label {
  position: absolute;
  top: -1.4em;
  left: -1px;
  font-size: 12px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  user-select: none;
  color: #0d0d0d;
  padding: 0.1rem 0.3rem;
  border-radius: 3px 3px 3px 0;
  white-space: nowrap;
}

/* Basic editor styles */
.ProseMirror {
  outline: none;
  font-weight: 400;
  letter-spacing: 1px;
}
.ProseMirror {
  > * + * {
    margin-top: 0.5em;
  }

  ul,
  ol {
    padding: 0 1rem;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    line-height: 1.1;
  }

  code {
    background-color: rgba(#616161, 0.1);
    color: #616161;
  }

  pre {
    background: #0d0d0d;
    color: #fff;
    font-family: "JetBrainsMono", monospace;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;

    code {
      color: inherit;
      padding: 0;
      background: none;
      font-size: 0.8rem;
    }
  }

  mark {
    background-color: #faf594;
  }

  img {
    max-width: 100%;
    height: auto;
  }

  hr {
    margin: 1rem 0;
  }

  blockquote {
    padding-left: 1rem;
    border-left: 2px solid rgba(#0d0d0d, 0.1);
  }

  hr {
    border: none;
    border-top: 2px solid rgba(#0d0d0d, 0.1);
    margin: 2rem 0;
  }

  ul[data-type="taskList"] {
    list-style: none;
    padding: 0;

    li {
      display: flex;
      align-items: center;

      > label {
        flex: 0 0 auto;
        margin-right: 0.5rem;
        user-select: none;
      }

      > div {
        flex: 1 1 auto;
      }
    }
  }
}
.idea-editor-custom-table {
  width: 100%;
}

.table-actions-rowButtons {
  width: 10%;
  display: flex;
  flex-direction: column;
  align-items: center;
  align-self: center;
}

.table-container {
  display: flex;
  overflow: hidden;
  flex-wrap: wrap;
}

.table-container > table {
  width: 90%;
  height: 90%;
}

.table-actions-colButtons {
  display: flex;
}

.table-actions-rowButtons > button,
.table-actions-colButtons > button {
  width: 40px;
  height: 40px;
  display: flex;
  place-content: center;
  align-items: center;
}
.table-actions-rowButtons {
  // position: absolute;
  // right: 0;
}

.tableWrapper {
  max-width: 100%;

  .table-first-row {
    display: flex;
    width: 100%;
    gap: 4px;

    .tableLeftSection {
      width: 90%;
      overflow-x: auto;
    }

    .tableRightSection {
      display: flex;
      align-items: center;

      .col-control-button-container {
        display: flex;
        flex-direction: column;
        gap: 1em;
      }
    }
  }

  ::-webkit-scrollbar {
    width: 5px;
    height: 8px;
    display: block;
    background-color: #f8f8f8;
  }

  ::-webkit-scrollbar-thumb {
    background: lightgray;
    width: 100px;
    height: 10px;
  }
  .table-second-row {
    padding-top: 1em;
    display: flex;
    justify-content: space-between;
    width: 90%;

    .delete-table-button {
      background-color: transparent;
      color: red;
      border: 1px solid gray;
    }

    .row-control-button-container {
      display: flex;
      flex-direction: row;
      gap: 1em;
    }
  }

  .table-control-button {
    display: flex;
    justify-content: center;
    align-items: center;
    border: 2px dashed gray;
    color: gray;
    background-color: transparent;
    height: 3em;
    width: 3em;
  }
}
.table-actions-colButtons {
  // position: absolute;
  // right: 50%;
  // top: 100%;
}
.table-actions-colButtons {
  width: 100px;
  display: flex;
  justify-content: space-between;
}

.table-actions-removeTable {
  width: calc(45% - 50px);
}
.table-actions-removeTable,
.table-actions-rowButtons,
.table-actions-colButtons {
  margin-top: 10px;
}

.table-actions-removeTable > button {
  width: 100px;
  height: 40px;
}

.table-container-table {
  max-height: 100px;
}

[data-tooltip] {
  position: relative;
}
[data-tooltip]:hover::before {
  content: "";
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 4px 6px 0 6px;
  border-style: solid;
  border-color: rgba(0, 0, 0, 0.7) transparent transparent transparent;
  z-index: 100;
}
[data-tooltip]:hover::after {
  content: attr(data-tooltip);
  position: absolute;
  left: 50%;
  top: -6px;
  transform: translateX(-50%) translateY(-100%);
  background: rgba(0, 0, 0, 0.7);
  text-align: center;
  color: #fff;
  padding: 4px 2px;
  font-size: 12px;
  min-width: 80px;
  border-radius: 5px;
  pointer-events: none;
}
</style>
