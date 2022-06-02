<template>
  <div class="idea_editor_content" id="idea_editor_content">
    <div class="editor" v-if="editor">
      <div class="editor_header_border">
        <menu-bar
          class="editor__header"
          :editor="editor"
          @modalOpen="setIsModalView"
        />
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
import { TextSelection, NodeSelection } from "prosemirror-state";
import { Fragment } from "prosemirror-model";
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
      isModalView: false,
      provider: null,
      editor: null,
      status: "connecting",
    };
  },
  methods: {
    setIsModalView(val) {
      this.isModalView = val;
    },
    handleKeyup(e) {
      if (e && e.keyCode === 9) {
        if (this.editor.isActive("comment")) e.preventDefault();
        if (this.isModalView) e.preventDefault();
      }
      return;
    },
    focusEditor() {
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

      const linkHandlers = {
        removeLink: (markPos, uuid) => {
          const {
            state: { doc, tr, schema },
            view: { dispatch },
          } = this.editor;
          doc.descendants((node, pos) => {
            if (node.type.name == "paragraph" || node.type.name == "heading" || node.type.name == "comment") {
              const [from, to] = [pos, pos + node.nodeSize];
              const [nodeFrom, nodeTo] = [pos, pos + node.nodeSize];
              if (from <= markPos && to >= markPos) {
                if (node.content && node.content.content) {
                  const { content } = node.content;

                  const newNodeContent = content.filter((innerNode, index) => {

                    if (innerNode.marks && innerNode.marks[0]) {
                      const [mark] = innerNode.marks;
                      if (
                        mark.attrs &&
                        mark.attrs.uuid &&
                        mark.attrs.uuid === uuid
                      ) {
                        return false;
                      }
                    }
                    return true;
                  });
                  const newNode = node.copy(Fragment.from(newNodeContent));
                  const [$from, $to] = [
                    doc.resolve(nodeFrom),
                    doc.resolve(nodeTo),
                  ];
                  const sel = new TextSelection($from, $to);
                  const startPosition = Math.max(pos, sel.from);
                  const endPosition = Math.min(pos + node.nodeSize, sel.to);
                  console.log(newNode);
                  dispatch(tr.replaceWith(startPosition, endPosition, newNode));
                }
              }
            }
          });
        },
      };
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

      const commentHandlers = {
        dedupeComments: async (node) => {
          if (!this.editor.isActive("comment")) return;
          const curNode = JSON.parse(node.attrs.comment);
          const {
            state: { doc, tr, schema },
            view: { dispatch },
          } = this.editor;
          const comments = [];
          doc.descendants((node, pos) => {
            if (node.type.name !== "comment") return;
            const [from, to] = [pos, pos + node.nodeSize];

            const [comment, content] = [
              JSON.parse(node.attrs.comment),
              node.content,
            ];

            comments.push({ from, to, comment, content });
          });

          const currentComments = comments;
          const mapOfUuidAndComments = {};

          for (const comment of currentComments) {
            const uuid = comment.comment.uuid;

            if (mapOfUuidAndComments[uuid])
              mapOfUuidAndComments[uuid].push(comment);
            else mapOfUuidAndComments[uuid] = [comment];
          }

          let replaceTr = tr;
          for (const [, comments] of Object.entries(
            mapOfUuidAndComments
          ).filter(
            ([key, _comments]) => _comments.length > 1 && key === curNode.uuid
          )) {
            //console.log(comments);
            comments.pop();

            for (const comment of comments) {
              const { from } = comment;

              replaceTr.setNodeMarkup(from, schema.nodes.paragraph, {
                id: comment.comment.uuid,
              });

              // const emptyComment = JSON.stringify({
              //   comments: [],
              //   ideaUuid: comment.comment.ideaUuid,
              //   uuid: comment.comment.uuid,
              // });
              // replaceTr.setNodeMarkup(from, schema.nodes.comment, {
              //   comment: emptyComment,
              // });
              // const [$start, $end] = [
              //   doc.resolve(comment.from),
              //   doc.resolve(comment.to),
              // ];
              // replaceTr = replaceTr.setSelection(
              //   new TextSelection($start, $end)
              // );
            }
          }
          // this.editor.commands.clearNodes();
          //	this.editor.commands.toggleHighlight({ color: "#ffcc00" });

          dispatch(replaceTr);
        },
        transformComments: (node) => {
          const curNode = JSON.parse(node.attrs.comment);
          // console.log()
          if (
            !this.editor.view.state.selection.empty ||
            (!this.editor.isActive("paragraph") &&
              this.editor.isActive("comment"))
          ) {
            return;
          }

          const {
            state: { doc, tr, schema },
            view: { dispatch },
          } = this.editor;

          //           const paragraphs = [];
          //           const comments = [];
          //           doc.descendants((node, pos) => {
          //             if (node.type.name !== "comment") return;
          //             const [from, to] = [pos, pos + node.nodeSize];

          //             const [comment, content] = [
          //               JSON.parse(node.attrs.comment),
          //               node.content,
          //             ];

          // console.log(this.editor.view.state.selection)
          // console.log(to)
          // console.log(from)
          //             if (
          //               from >= this.editor.view.state.selection &&
          //               to <= this.editor.view.state.selection
          //             ) {
          //               comments.push({ from, to, comment, content });
          //             }
          //           });

          //           console.log({ comments });

          //           console.log("selection ", this.editor.view.state.selection);
          //           comments.filter();
          this.editor
            .chain()
            .focus()
            .selectParentNode(this.editor.view.state.selection)
            .setComment(JSON.stringify(curNode))
            .run();

          //this.editor.commands.setComment(JSON.stringify(curNode));

          // this.editor.commands.setHighlight({ color: "#ffcc00" });
          // console.log("is empty ", this.editor.view.state.selection.empty);
          // const [$from, $to] = [
          //   doc.resolve(paragraphs[0].from),
          //   doc.resolve(paragraphs[0].to),
          // ];
          // const sel = new TextSelection($from, $to);
          // console.log($from, $to)
          // console.log(sel);
          // dispatch(tr.setSelection(sel));
          // //	const sel = new TextSelection($from, $to);
          // setTimeout(() => {
          //   this.editor.commands.setHighlight({ color: "#ffcc00" });
          // });

          //		this.editor.commands.toggleHighlight();

          // const curComment = comments.filter(
          //   (commentEntity) => commentEntity.comment.uuid === curNode.uuid
          // );
          //  console.log(curComment);
          // console.log({comments})
          //           this.editor.chain().focus().setComment(
          //   JSON.stringify({
          //     this.editor.commands.setComment(JSON.stringify(dataToInsert));,
          //   })

          //   console.log(curNode);
          // console.log(comments);

          //   this.editor.commands.setComment(JSON.stringify(curNode));
        },
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
        saveContent,
        commentHandlers,
        linkHandlers
      );

      this.editor = editorInstance.editor;
      this.$emit("initialized");
      if (this.scrollToSelection) {
        setTimeout(() => {
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
    document.addEventListener("keydown", this.handleKeyup);
    this.initEditor();
  },
  beforeDestroy() {
    this.editor.destroy();
    document.removeEventListener("keydown", this.handleKeyup);
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
			    overflow: hidden;
    }

    th {
      font-weight: bold;
			    overflow: hidden;
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

  h1 > span.is-link,
  h2 > span.is-link,
  h3 > span.is-link,
  p > span.is-link,
  div > span.is-link {
    display: inline-flex;
    padding-right: 5px;
    height: 20px;
    white-space: nowrap;
    & > button {
      height: 100%;
      font-family: "FuturaMedium";
      color: #d0424d;
      border: 1px solid lightgray;
      width: 60px;
      outline: none;
      position: relative;
      border-radius: 3px;
      background: #fff;
      cursor: pointer;
      font-size: 12px;
      &:hover {
        background: #d0424d;
        color: #fff;
        &[data-tooltip] {
          position: relative;
          &:after {
            content: attr(data-tooltip);
            position: absolute;
            left: 50%;
            top: -6px;
            white-space: nowrap;
            transform: translateX(-50%) translateY(-100%);
            background: rgba(0, 0, 0, 0.7);
            text-align: center;
            color: #fff;
            padding: 4px 2px;
            font-size: 12px;
            min-width: 80px;
            border-radius: 5px;
            pointer-events: none;
            padding: 5px;
            font-family: "FuturaMedium";
          }
        }
      }
    }
    & > a {
      flex-direction: row;
      max-width: fit-content;
      display: inline-flex;
      width: 100%;
      border: 1px solid lightgray;
      border-radius: 3px;
      place-items: center;
      color: #4294d0;
      line-height: 5px;
      cursor: pointer;
      padding: 0 10px;
      text-overflow: ellipsis;
      white-space: nowrap;
      // position: absolute;
      margin-right: 10px;
      text-decoration: none;
      user-select: none;
      &[data-tooltip] {
        position: relative;
        &:hover::after {
          content: attr(data-tooltip);
          max-width: 200px;
          position: absolute;
          left: 50%;
          top: -6px;
          white-space: nowrap;
          transform: translateX(-50%) translateY(-100%);
          background: rgba(0, 0, 0, 0.7);
          text-align: center;
          color: #fff;
          padding: 4px 2px;
          font-size: 12px;
          min-width: 80px;
          border-radius: 5px;
          pointer-events: none;
          padding: 10px;
          font-family: "FuturaMedium";
        }
      }
      &:hover {
        background: #4294d0;
        color: #fff;
      }
      &::before,
      &:hover::before {
        padding-right: 5px;
        font-family: "Material Icons";
        font-size: 15px;
        opacity: 0.8;
        display: flex;
        place-items: center;
        content: "link";
        height: 17px;
        &:hover {
          background: #4294d0;
          color: #fff;
        }
      }
    }
  }

  p > a {
    cursor: pointer;
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
      // background-color: transparent;
      // color: red;
      // border: 1px solid gray;
      font-family: "FuturaMedium";
      color: #d0424d;
      border: 1px solid lightgray;
      width: 60px;
      height: 20px;
      position: relative;
      border-radius: 3px;
      background: #fff;
      bottom: 2px;
      &:hover {
        background: #d0424d;
        color: #fff;
      }
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

.table-control-button[data-tooltip],
.delete-table-button[data-tooltip] {
  position: relative;
}
.table-control-button[data-tooltip]:hover::before,
.delete-table-button[data-tooltip]:hover::before {
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
.table-control-button[data-tooltip]:hover::after,
.delete-table-button[data-tooltip]:hover::after {
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
