<template>
  <div class="idea_editor_content" @click="focusEditor()">
    <div class="editor" v-if="editor">
      <div class="editor_header_border">
        <menu-bar class="editor__header" :editor="editor" />
      </div>
      <button @click="insertCustomTable()">TEST</button>
      <editor-content
        class="editor__content"
        :editor="editor"
        ref="editor_content"
      />
      <div class="editor__footer">
        <div :class="`editor__status editor__status--${status}`">
          <template v-if="status === 'connected'">
            {{ editor.storage.collaborationCursor.users.length }} user{{
              editor.storage.collaborationCursor.users.length === 1 ? "" : "s"
            }}
            viewing idea {{ idea.title }}
          </template>
          <template v-else> offline </template>
        </div>
        <div class="editor__name">
          <div>
            {{ user.firstName + " " + user.lastName }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

	<script>
import { mapGetters } from "vuex";

import { Editor, EditorContent } from "@tiptap/vue-2";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import Highlight from "@tiptap/extension-highlight";
import CharacterCount from "@tiptap/extension-character-count";
import Underline from "@tiptap/extension-underline";

import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { TableView } from "./extensions/Table/tableView";
//import { Table, TableRow, TableCell, TableHeader } from "./extensions/Table/table";
import { VueNodeViewRenderer } from "@tiptap/vue-2";
// import Table from "./extensions/Table"

import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { MenuBar } from "./parts";
import { Indent } from "./extensions/indent.js";
import { EventHandler } from "./extensions/eventHandler.js";
//import CustomTable from "./extensions/Table/customTable";
import Component from "./extensions/Component.vue";

import { mergeAttributes, getExtensionField, callOrReturn } from "@tiptap/core";
/* eslint-disable */
export default {
  components: {
    EditorContent,
    MenuBar,
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
  },
  computed: {
    ...mapGetters({
      user: "auth/user",
    }),
  },
  watch: {
    contentType: {
      handler(newVal) {
        console.log(newVal);
        console.log("change");
        this.initEditor();
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
    insertCustomTable() {
      this.editor
        .chain()
        .focus()
        .insertTable({
          caption: "title",
        })
        .run();
    },
    focusEditor() {
      console.log("Focus!");
      this.editor.commands.focus();
      // this.editor.commands.focus();
      //	this.editor.commands.setTextSelection(10)
    },
    test() {
      console.log("test");
    },
    initEditor() {
      if (this.editor) this.editor.destroy();
      if (this.provider) this.editor.destroy();
      const ydoc = new Y.Doc();

      this.provider = new HocuspocusProvider({
        document: ydoc,
        url: "ws://127.0.0.1:1234",
        name: `collaboration/${this.contentType}/${this.idea.id}`,
        onAwarenessUpdate: ({ states }) => {
          this.currentStates = states;
        },
        broadcast: false,
      });

      this.provider.on("status", (event) => {
        this.status = event.status;
      });

      this.editor = new Editor({
        extensions: [
          StarterKit.configure({
            history: false,
          }),
          Indent.configure({
            types: ["listItem", "paragraph", "heading"],
            minLevel: 0,
            maxLevel: 8,
          }),
          Highlight,
          Underline,
          TableRow,
          TableHeader,
          TableCell,
          Table.extend({
            name: "testComponent",
            toggle: null,
            addNodeView() {
              return ({ node, HTMLAttributes, getPos, editor }) => {
                console.log(node);
                console.log(HTMLAttributes);
                console.log(getPos());
                console.log(editor);

                const container = document.createElement("table");
								container.className = "table-container-table"
								container.dataset.width = "1000"


                const removeRowButton = document.createElement("button");
                const addRowButton = document.createElement("button");

                const removeColButton = document.createElement("button");
                const addColButton = document.createElement("button");

                addRowButton.appendChild(document.createTextNode("+"));
                removeRowButton.appendChild(document.createTextNode("-"));

                addColButton.appendChild(document.createTextNode("+"));
                removeColButton.appendChild(document.createTextNode("-"));

                const actionsRowButtons = document.createElement("div");
                actionsRowButtons.className = "table-actions-rowButtons";

                const actionsColButtons = document.createElement("div");
                actionsColButtons.className = "table-actions-colButtons";

                actionsRowButtons.appendChild(addRowButton);
                actionsRowButtons.appendChild(removeRowButton);

                actionsColButtons.appendChild(addColButton);
                actionsColButtons.appendChild(removeColButton);

                addColButton.addEventListener("click", (event) => {
                  this.editor.chain().focus().addRowAfter().run();
                });
                removeColButton.addEventListener("click", (event) => {
                  this.editor.chain().focus().deleteRow().run();
                });

                addRowButton.addEventListener("click", (event) => {
                  this.editor.chain().focus().addColumnAfter().run();
                });
                removeRowButton.addEventListener("click", (event) => {
                  this.editor.chain().focus().deleteColumn().run();
                });

                // const actionsColButtons = document.createElement("div");
                // actionsColButtons.className = "table-actions-colButtons"
                // const addColButton = document.createElement("button");
                // const minus = document.createTextNode("-");
                // addColButton.appendChild(minus);
                // actionsColButtons.appendChild(addColButton);

                const div = document.createElement("div");
                //  div.append(actionsRowButtons);
                div.className = "table-container";

                // const content = document.createElement("tbody");
                // container.append();

                console.log(container);
                container.appendChild(document.createElement("div"));
                div.append(container, actionsRowButtons, actionsColButtons);

                // container.append(actionsColButtons);

                return {
                  dom: div,
                  contentDOM: container,
                };
              };
            },
            // addNodeView() {
            //   return VueNodeViewRenderer(Component);
            // },
            addCommands() {
              if (this.parent) console.log(this.parent());
              this.toggle =
                () =>
                ({ chain }) => {
                  return chain()
                    .command(({ tr, commands }) => {
                      console.log("commands");
                      console.log(commands);
                      return commands.addColumnAfter();
                    })
                    .run();
                };

              return {
                ...this.parent?.(),
                addTableRow:
                  () =>
                  ({ chain }) => {
                    return chain()
                      .command(({ tr, commands }) => {
                        console.log("commands");
                        console.log(commands);
                        return commands.addColumnAfter();
                      })
                      .run();
                  },
              };
            },
            extendNodeSchema(extension) {
              const context = {
                name: extension.name,
                options: extension.options,
                storage: extension.storage,
              };

              return {
                tableRole: callOrReturn(
                  getExtensionField(extension, "tableRole", context)
                ),
              };
            },
            addOptions() {
              console.log("addOptions");
              console.log(this);
              if (this.parent) console.log(this.parent());

              const test = () => console.log("hello");
              return {
                ...this.parent?.(),
                HTMLAttributes: {
                  style: "width:500px;overflow-x:scroll",
                  class: `editIdea-test-custom-class-${this.name}`,
                  onclick: "this.toggle()",
                  // onclick: ({ chain }) => {
                  //   return chain()
                  //     .command(({ tr, commands }) => {
                  //       console.log("commands");
                  //       console.log(commands);
                  //       return commands.addColumnAfter();
                  //     })
                  //     .run();
                  // },
                },
                MyCustomAttributes: {
                  style: "width:100px;overflow-x:scroll",
                  class: "editIdea-test-custom-class",
                  onclick: "console.log(this.$refs)",
                },
                cellMinWidth: 200,
              };
            },

            addAttributes() {
              console.log("addAttr");
              return {
                addRow: {
                  renderHTML: (attributes) => {
                    console.log("attrs");
                    console.log(attributes);
                    return {
                      "data-color": attributes.color,
                      style: `color: ${attributes.color}`,
                    };
                  },
                },
                color: {
                  // Set the color attribute according to the value of the `data-color` attribute
                  parseHTML: (element) => {
                    console.log("element");
                    console.log(element);
                    return element.getAttribute("data-color");
                    //return element.getAttribute("data-color");
                  },
                },
              };
            },

            // parseHTML() {
            //   console.log("parseHTML");
            //   console.log(this);
            //   return [
            //     {
            //       tag: "div",
            //       contentElement: (node) => {
            //         console.log(node);
            //         return "button";
            //       },

            //       getAttrs: (node) => {
            //         console.log("getAttrs");
            //         console.log(node);
            //         return node.className === "captioned-table" && null;
            //       },
            //     },
            //   ];
            // },

            renderHTML({ node, HTMLAttributes }) {
              console.log(node);
              console.log("@RenderHTML");

              const { schema } = node.type;
              //console.log(schema);

              console.log("HTMLAttributes");
              console.log(node.attrs);
              console.log(this.options.HTMLAttributes);

              const test = () => console.log("hello");

              // console.log(this.options.HTMLAttributes);
              return [
                "div",
                mergeAttributes(this.options.HTMLAttributes, {
                  class: "captioned-table",
                }),
                ["table", HTMLAttributes, ["tbody", 0]],
                [
                  "button",
                  mergeAttributes({
                    ...this.options.MyCustomAttributes,
                    ...HTMLAttributes,
                  }),
                  "+",
                ],
                [
                  "button",
                  mergeAttributes(
                    this.options.MyCustomAttributes,
                    HTMLAttributes
                  ),
                  "-",
                ],
              ];
            },
          }),
          EventHandler,
          Collaboration.configure({
            document: ydoc,
          }),
          CollaborationCursor.configure({
            provider: this.provider,
            user: {
              name: null,
              color: "#958DF1",
            },
          }),
          CharacterCount.configure({
            limit: 10000,
          }),
        ],
      });

      this.editor.commands.updateUser({
        name: `${this.user.firstName} ${this.user.lastName}`,
      });
    },
  },

  mounted() {
    this.initEditor();
  },

  beforeUnmount() {
    this.editor.destroy();
    this.provider.destroy();
  },
};
</script>


<style lang="scss" >
/* Setup */

.editor_header_border {
  border-bottom: 1px solid lightgray;
}
.editor__content {
  cursor: text;
}

.idea_editor_content {
  background: #fff;
  flex-grow: 1;
  border-radius: 5px;
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
    justify-content: space-between;
    height: 50px;
    padding: 0 20px 5px 20px;
  }

  &__content {
    padding: 1.25rem 2rem;
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

    td,
    th {
      min-width: 1em;
      border: 2px solid #ced4da;
      padding: 3px 5px;
      vertical-align: top;
      box-sizing: border-box;
      position: relative;
      > * {
        margin-bottom: 0;
      }
    }

    th {
      font-weight: bold;
      text-align: left;
      background-color: #f1f3f5;
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

    p {
      margin: 0;
    }
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
    margin-top: 0.75em;
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

  flex-wrap: wrap;
}

.table-container > table {
  width: 90%;
}

.table-actions-colButtons {
  display: flex;
}

.table-actions-rowButtons > button,
.table-actions-colButtons > button {
  width: 20px;
  height: 20px;
  display: flex;
  place-content: center;
  align-items: center;
}
</style>
