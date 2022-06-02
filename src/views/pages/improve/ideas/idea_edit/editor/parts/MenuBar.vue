<template>
  <div
    id="idea_editor_header_togglables-container"
    :class="'__header__bar__width-' + headerBarWidth"
  >
    <template v-for="(item, index) in getItems">
      <div
        class="divider"
        v-if="headerBarWidth > showAllWidth && item.type === 'divider'"
        :key="`divider${index}`"
      />
      <menu-list
        v-else-if="item.type === 'list'"
        :key="index + '-list'"
        :item="item"
        :activeIcon="activeHeading"
        class="idea_editor_header_item"
      />
      <menu-grid
        v-else-if="item.type === 'grid'"
        :key="index + '-grid'"
        :item="item"
        :allItems="items.filter((x) => x.type === 'item')"
        :activeIcon="activeHeading"
        class="idea_editor_header_item"
      />

      <!-- <menu-file-field
        v-else-if="item.type === 'file'"
        :key="index + '-file'"
        :item="item"
        :editor="editor"
      /> -->

      <!-- <menu-prompt
        v-else-if="item.type === 'prompt'"
        :key="index + '-item'"
        :item="item"
        class="idea_editor_header_item"
      /> -->

      <menu-item
        v-else-if="headerBarWidth > showAllWidth && item.type === 'item'"
        :key="index + '-item'"
        :item="item"
        class="idea_editor_header_item"
        :class="'editor__header__item-' + index"
      />

      <menu-item
        v-else-if="item.type === 'comment'"
        :key="index + '-item'"
        :item="item"
        class="idea_editor_header_item"
      />
    </template>

    <table-modal v-model="showTablePrompt" @tableCreate="createTable" />
    <file-modal
      v-model="showImagePrompt"
      @setFiles="setFiles"
      :fileModalTexts="fileModalTexts"
    />
    <embed-modal
      v-model="showEmbedPrompt"
      @setEmbed="setEmbed"
      :configs="getConfigs"
      :type="embedType"
    />
  </div>
</template>

<script>
import MenuItem from "./MenuItem.vue";
import MenuList from "./MenuList.vue";
import MenuGrid from "./MenuGrid.vue";
import { TableModal, FileModal, EmbedModal } from "./modals";
import { CommentIcon } from "@/assets";
import { NodeSelection, TextSelection } from "prosemirror-state";
import { MAX_FILE_SIZE } from "./modals/constants";
import { v4 as uuidv4 } from "uuid";

export default {
  components: {
    "menu-item": MenuItem,
    "menu-list": MenuList,
    "menu-grid": MenuGrid,
    "table-modal": TableModal,
    "file-modal": FileModal,
    "embed-modal": EmbedModal,
  },
  mounted() {
    this.onResize();
    this.$nextTick(() => {
      window.addEventListener("resize", this.onResize);
    });
  },
  beforeDestroy() {
    console.log("REMOVED)");
    window.removeEventListener("resize", this.onResize);
  },
  methods: {
    onResize() {
      let width = 0;
      const container = document.getElementById(
        "idea_editor_header_togglables-container"
      );
      if (container) {
        width = container.clientWidth;
      }
      this.headerBarWidth = width;
    },
    extractTextFromSelection(state) {
      const selection = state.tr.selection;
      let ret = "";
      state.doc.nodesBetween(selection.from, selection.to, (node, position) => {
        // we only processing text, must be a selection
        if (!node.isTextblock || selection.from === selection.to) return;
        // grab the content
        const substringFrom = Math.max(0, selection.from - position - 1);
        const substringTo = Math.max(0, selection.to - position - 1);
        ret = node.textContent.substring(substringFrom, substringTo);
      });
      return ret;
    },
    replaceSelectionTextWithText(replaceContent, state, dispatch) {
      // grab the current transaction and selection
      let tr = state.tr;
      const selection = tr.selection;

      // check we will actually need a to dispatch transaction
      let shouldUpdate = false;

      let startPosition = null;
      let endPosition = null;
      let newNode = null;

      state.doc.nodesBetween(selection.from, selection.to, (node, position) => {
        // we only processing text, must be a selection
        if (!node.isTextblock || selection.from === selection.to) return;

        // calculate the section to replace
        startPosition = Math.max(position + 1, selection.from);
        endPosition = Math.min(position + node.nodeSize, selection.to);

        newNode = state.schema.text(replaceContent, node.marks);
        // replace
        tr = tr.replaceWith(startPosition, endPosition, newNode);
        shouldUpdate = true;
      });

      if (dispatch && shouldUpdate) {
        dispatch(tr.scrollIntoView());
      }
      return {
        startPosition: startPosition,
        endPosition: endPosition,
        content: newNode,
      };
    },
    isYoutubeUrl(url) {
      return true;
    },
    parseYoutubeUrl(url) {
      const regExp =
        /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
      const match = url.match(regExp);
      return match && match[7].length === 11 ? match[7] : false;
    },
    setVideo(dataUrl) {
      let url = null;
      if (this.isYoutubeUrl(dataUrl)) {
        const embedParse = this.parseYoutubeUrl(dataUrl);
        url = `https://www.youtube.com/embed/${embedParse}`;

        if (url) {
          this.editor.commands.setExternalVideo({
            src: url,
          });
        }
      }
    },
    setEmbed(data) {
      if (data.type === "video") {
        this.setVideo(data.url);
      }

      if (data.type === "link") {
        const {
          state,
          view: { dispatch },
        } = this.editor;
        let tr = state.tr;
        if (!state.selection.empty) {
          this.replaceSelectionTextWithText(data.text, state, dispatch);
        } else {
          this.editor.commands.focus();
          const { from } = state.selection;
          const to = from + 1 + data.text.length;
          let insertTr = tr.insertText(data.text, from, from + 1);
          dispatch(insertTr);
          setTimeout(() => {
            let newEditorState = this.editor.state;
            let newTr = newEditorState.tr;
            let newDoc = newEditorState.doc;
            console.log(from, to);
            const [$from, $to] = [newDoc.resolve(from), newDoc.resolve(to)];

            const sel = new TextSelection($from, $to);

						console.log(sel)
            dispatch(newTr.setSelection(sel));
          });
        }

        setTimeout(() => {
					console.log(uuidv4());
          if (!data.url) return;
					console.log(uuidv4());
          this.editor.commands.setLink({
            href: data.url,
            target: "_blank",
            uuid: uuidv4(),
          });
        }, 100);
      }

      this.embedPromptOpen = false;
      this.embedType = null;
    },
    setFiles(files) {
      this.filePromptOpen = !this.filePromptOpen;
      this.editor.commands.setImage(files);
    },
    createTable(data) {
      const setRows = data.rows ?? 1;
      const setCols = data.cols ?? 1;

      //set selection to end of paragraph if inserting in the middle

      //   if (this.editor.isActive("table")) return;
      let $anchor = this.editor.view.state.selection.$anchor;

      //  let pos = this.editor.view.state.selection;

      // this.editor
      //   .chain()
      //   .selectParentNode(this.editor.view.state.selection).focus('end')
      //   .setHighlight({ color: "#ffcc00" }).run();

      // if (this.editor && this.editor.isActive("comment")) {
      if ($anchor && $anchor.nodeAfter) {
        const posAfter = new NodeSelection($anchor);
        $anchor = posAfter.to;
      } else {
        $anchor = $anchor.pos;
      }

      // } else {
      //   $anchor = $anchor.head;
      // }

      this.editor
        .chain()
        .focus($anchor)
        .insertTable({ rows: setRows, cols: setCols, withHeaderRow: true })
        .run();

      this.tablePromptOpen = !this.tablePromptOpen;
    },

    setFilePromptOpen(type) {
      switch (type) {
        case "nonpreview":
          this.fileModalTexts = {
            type: "nonpreview",
            primary: this.$t("Select or Drag Attachment"),
            secondary: this.$t("You can upload attachment up to size", {
              size: MAX_FILE_SIZE,
            }),
          };
          break;
        default:
          this.fileModalTexts = {
            type: "preview",
            primary: this.$t("Select or Drag Image"),
            secondary: this.$t("You can upload image up to size", {
              size: MAX_FILE_SIZE,
            }),
          };
      }
      this.filePromptOpen = !this.filePromptOpen;
    },
  },
  watch: {
    anyModalOpen: {
      handler(newVal) {
        this.$emit("modalOpen", newVal);
      },
    },
  },
  props: {
    editor: {
      type: Object,
      required: true,
    },
  },
  computed: {
    getItems: {
      get() {
        const isLarge = this.headerBarWidth > this.showAllWidth;
        if (isLarge) {
          return this.items.filter((item) => item.showOnLarge);
        } else {
          return this.items.filter((item) => item.showOnSmall);
        }
      },
    },
    getConfigs: {
      get() {
        if (!this.editor) return;
        if (this.embedType === "link") {
          const { state } = this.editor;
          const { from, to } = state.selection;
          let configs = {
            url: "",
            title: this.$t("InsertLinkTitle"),
            inputPlaceholder: this.$t("InsertLinkText"),
            urlPlaceholder: "Https://",
            text: "",
          };

          let marks = [];

          if (!state.selection.isEmpty) {
            configs.text = this.extractTextFromSelection(state);
          }

          state.doc.nodesBetween(from, to, (node) => {
            marks = [...marks, ...node.marks];
          });
          const mark = marks.find((markItem) => markItem.type.name === "link");
          if (mark && mark.attrs && mark.attrs.href) {
            configs.url = mark.attrs.href;
          }
          return configs;
        }
        if (this.embedType == "video") {
          let configs = {
            url: "",
            title: this.$t("InsertVideoTitle"),
            inputPlaceholder: this.$t("InsertLinkText"),
            urlPlaceholder: "Https://",
            text: null,
          };
          return configs;
        }
        return null;
      },
    },
    anyModalOpen: {
      get() {
        return (
          this.showTablePrompt || this.showImagePrompt || this.showEmbedPrompt
        );
      },
    },
    showTablePrompt: {
      get() {
        return this.tablePromptOpen;
      },
      set(val) {
        this.tablePromptOpen = val;
      },
    },
    showImagePrompt: {
      get() {
        return this.filePromptOpen;
      },
      set(val) {
        this.filePromptOpen = val;
      },
    },
    showEmbedPrompt: {
      get() {
        return this.embedPromptOpen;
      },
      set(val) {
        this.embedPromptOpen = val;
      },
    },
  },
  data() {
    return {
      showAllWidth: 570,
      embedType: "",
      fileModalTexts: {
        primary: this.$t("Select or Drag Image"),
        secondary: this.$t("You can upload up to size", {
          size: MAX_FILE_SIZE,
        }),
      },
      headerBarWidth: null,
      tablePromptOpen: false,
      filePromptOpen: false,
      embedPromptOpen: false,
      activeHeading: "h-3",
      items: [
        {
          icon: "menu-line",
          title: "Menu",
          type: "list",
          showOnSmall: true,
          showOnLarge: true,
          iconType: "remix",
          listItems: [
            {
              icon: "h-1",
              title: "Chapter",
              iconType: "remix",
              action: () => {
                // this.editor.commands.setChapterText();
                // this.editor.commands.setFontFamily("FuturaBold");
                this.activeHeading = "h-1";
                this.editor.chain().focus().toggleHeading({ level: 1 }).run();
              },
              isActive: () => this.editor.isActive("heading", { level: 1 }),
            },
            {
              icon: "h-2",
              title: "Title",
              iconType: "remix",
              action: () => {
                // this.editor.commands.setTitleText();
                // this.editor.commands.setFontFamily("FuturaMedium");
                this.activeHeading = "h-2";
                this.editor.chain().focus().toggleHeading({ level: 2 }).run();
              },
              isActive: () => this.editor.isActive("heading", { level: 2 }),
            },
            {
              icon: "h-3",
              title: "Subtitle",
              iconType: "remix",
              action: () => {
                // this.editor.commands.setSubTitleText();
                // this.editor.commands.setFontFamily("FuturaMedium");
                this.activeHeading = "h-3";
                this.editor.chain().focus().toggleHeading({ level: 3 }).run();
              },
              isActive: () => this.editor.isActive("heading", { level: 3 }),
            },
            {
              icon: "paragraph",
              title: "Paragraph",
              iconType: "remix",
              action: () => {
                // this.editor.commands.setParagraphText();
                // this.editor.commands.setFontFamily("FuturaLight");
                this.activeHeading = "paragraph";
                this.editor.chain().focus().setParagraph().run();

                //	 this.editor.chain().focus().toggleHeading({ level: 4 }).run();
              },
              isActive: () => this.editor.isActive("heading", { level: 4 }),
            },
          ],
        },

        {
          icon: "bold",
          iconType: "remix",
          type: "item",
          showOnSmall: false,
          showOnLarge: true,
          title: "Bold",
          action: () => this.editor.chain().focus().toggleBold().run(),
          isActive: () => this.editor.isActive("bold"),
        },
        {
          icon: "italic",
          iconType: "remix",
          showOnSmall: false,
          showOnLarge: true,
          type: "item",
          title: "Italic",
          action: () => this.editor.chain().focus().toggleItalic().run(),
          isActive: () => this.editor.isActive("italic"),
        },
        {
          type: "divider",
          showOnSmall: false,
          showOnLarge: true,
        },
        {
          icon: "indent-decrease",
          iconType: "remix",
          showOnSmall: false,
          showOnLarge: true,
          type: "item",
          title: "outdent",
          action: () => this.editor.chain().focus().outdent().run(),
          isActive: () => this.editor.isActive("outdent"),
        },
        {
          icon: "indent-increase",
          iconType: "remix",
          showOnSmall: false,
          showOnLarge: true,
          type: "item",
          title: "indent",
          action: () => {
            if (this.editor.isActive("comment")) return;
            return this.editor.chain().focus().indent().run();
          },
          isActive: () => this.editor.isActive("indent"),
        },
        {
          icon: "list-unordered",
          iconType: "remix",
          showOnSmall: false,
          showOnLarge: true,
          type: "item",
          title: "BulletList",
          action: () => {
            if (this.editor.isActive("comment")) return;
            return this.editor.chain().focus().toggleBulletList().run();
          },
          isActive: () => this.editor.isActive("bulletList"),
        },
        {
          icon: "list-ordered",
          iconType: "remix",
          showOnSmall: false,
          showOnLarge: true,
          type: "item",
          title: "OrderedList",
          action: () => this.editor.chain().focus().toggleOrderedList().run(),
          isActive: () => this.editor.isActive("orderedList"),
        },
        {
          type: "divider",
          showOnSmall: false,
          showOnLarge: true,
        },
        {
          icon: "link",
          iconType: "remix",
          type: "item",
          showOnSmall: false,
          showOnLarge: true,
          title: "link",
          action: (file) => {
            this.embedType = "link";
            this.embedPromptOpen = !this.embedPromptOpen;
          },
          isActive: () => this.editor.isActive("link"),
        },
        {
          icon: "separator",
          iconType: "remix",
          showOnSmall: false,
          showOnLarge: true,
          type: "item",
          title: "Horizontal Rule",
          action: () => this.editor.chain().focus().setHorizontalRule().run(),
        },

        {
          icon: "vidicon-line",
          iconType: "remix",
          title: "video",
          showOnSmall: false,
          showOnLarge: true,
          type: "item",
          action: (file) => {
            this.embedType = "video";
            this.embedPromptOpen = !this.embedPromptOpen;
          },
        },

        {
          icon: "image-line",
          iconType: "remix",
          showOnSmall: false,
          showOnLarge: true,
          title: "Image",
          type: "item",
          action: () => {
            this.setFilePromptOpen("preview");
          },
        },
        {
          icon: "file-3-line",
          iconType: "remix",
          showOnSmall: false,
          showOnLarge: true,
          type: "item",
          title: "Attachment",
          action: () => {
            this.setFilePromptOpen("nonpreview");
          },
        },
        {
          icon: "grid-line",
          iconType: "remix",
          showOnSmall: false,
          showOnLarge: true,
          type: "item",
          title: "grid",
          action: () => (this.tablePromptOpen = !this.tablePromptOpen),
          isActive: () => this.editor.isActive("table"),
        },
        {
          type: "divider",
          showOnSmall: false,
          showOnLarge: true,
        },
        {
          icon: "more-line",
          iconType: "remix",
          showOnSmall: true,
          showOnLarge: false,
          type: "grid",
          title: "more-line",
          action: () => console.log("ACTION"),
          isActive: (item) => this.editor.isActive(item),
        },
        {
          icon: CommentIcon,
          iconType: "inline",
          type: "comment",
          showOnSmall: true,
          showOnLarge: true,
          title: "comment",
          //  action: () => this.editor.commands.scrollToNextComment(),

          action: () => this.editor.chain().focus().scrollToNextComment().run(),
          isActive: () => this.editor.isActive("comment"),
        },
      ],
    };
  },
};
</script>

<style lang="scss">
.divider {
  width: 2px;
  height: 1.25rem;
  background-color: rgba(#000, 0.1);
  margin-left: 0.5rem;
  margin-right: 0.75rem;
}

.idea_editor_header_item {
  max-height: 35px;
  max-width: 35px;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  margin: 0;
  place-content: center;
  cursor: pointer;
}
</style>
