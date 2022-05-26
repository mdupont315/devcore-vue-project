<template>
  <div>
    <template v-for="(item, index) in items">
      <div
        class="divider"
        v-if="item.type === 'divider'"
        :key="`divider${index}`"
      />
      <menu-list
        v-else-if="item.type === 'list'"
        :key="index + '-list'"
        :item="item"
        :activeIcon="activeHeading"
        class="idea_editor_header_item"
      />

      <!-- <menu-file-field
        v-else-if="item.type === 'file'"
        :key="index + '-file'"
        :item="item"
        :editor="editor"
      /> -->

      <menu-prompt
        v-else-if="item.type === 'prompt'"
        :key="index + '-item'"
        :item="item"
        class="idea_editor_header_item"
      />

      <menu-item
        v-else
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
import MenuPrompt from "./MenuPrompt";
import { TableModal, FileModal, EmbedModal } from "./modals";
import { CommentIcon } from "@/assets";
import { NodeSelection } from "prosemirror-state";
import { MAX_FILE_SIZE } from "./modals/constants";

export default {
  components: {
    "menu-item": MenuItem,
    "menu-list": MenuList,
    "menu-prompt": MenuPrompt,
    "table-modal": TableModal,
    "file-modal": FileModal,
    "embed-modal": EmbedModal,
  },
  methods: {
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
        this.editor.commands.setLink({ href: data.url, target: "_blank" });
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
      console.log("selection ", this.editor.view.state.selection);
      let $anchor = this.editor.view.state.selection.$anchor;

      //  let pos = this.editor.view.state.selection;

      // this.editor
      //   .chain()
      //   .selectParentNode(this.editor.view.state.selection).focus('end')
      //   .setHighlight({ color: "#ffcc00" }).run();

      // if (this.editor && this.editor.isActive("comment")) {
      console.log($anchor);
      if ($anchor && $anchor.nodeAfter) {
        const posAfter = new NodeSelection($anchor);
        console.log({ posAfter });
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
  props: {
    editor: {
      type: Object,
      required: true,
    },
  },
  computed: {
    getConfigs: {
      get() {
        if (!this.editor) return;
        if (this.embedType === "link") {
          const { state } = this.editor;
          const { from, to } = state.selection;
          let configs = {
            url: "",
            title: this.$t("InsertLinkTitle"),
            placeholder: "Https://",
						text: ""
          };

          let marks = [];
          state.doc.nodesBetween(from, to, (node) => {
            marks = [...marks, ...node.marks];
          });
          const mark = marks.find((markItem) => markItem.type.name === "link");
					console.log(mark)
          if (mark && mark.attrs && mark.attrs.href) {
            configs.url = mark.attrs.href;
          }
          return configs;
        }
        if (this.embedType == "video") {
          let configs = {
            url: "",
            title: this.$t("InsertVideoTitle"),
            placeholder: "Https://",
						text: null
          };
          return configs;
        }
        return null;
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
      embedType: "",
      fileModalTexts: {
        primary: this.$t("Select or Drag Image"),
        secondary: this.$t("You can upload up to size", {
          size: MAX_FILE_SIZE,
        }),
      },
      tablePromptOpen: false,
      filePromptOpen: false,
      embedPromptOpen: false,
      activeHeading: "h-3",
      items: [
        {
          icon: "menu-line",
          title: "Menu",
          type: "list",
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
          title: "Bold",
          action: () => this.editor.chain().focus().toggleBold().run(),
          isActive: () => this.editor.isActive("bold"),
        },
        {
          icon: "italic",
          iconType: "remix",
          title: "Italic",
          action: () => this.editor.chain().focus().toggleItalic().run(),
          isActive: () => this.editor.isActive("italic"),
        },
        {
          type: "divider",
        },
        {
          icon: "indent-decrease",
          iconType: "remix",
          title: "outdent",
          action: () => this.editor.chain().focus().outdent().run(),
          isActive: () => this.editor.isActive("outdent"),
        },
        {
          icon: "indent-increase",
          iconType: "remix",
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
          title: "Bullet List",
          action: () => {
            if (this.editor.isActive("comment")) return;
            return this.editor.chain().focus().toggleBulletList().run();
          },
          isActive: () => this.editor.isActive("bulletList"),
        },
        {
          icon: "list-ordered",
          iconType: "remix",
          title: "Ordered List",
          action: () => this.editor.chain().focus().toggleOrderedList().run(),
          isActive: () => this.editor.isActive("orderedList"),
        },
        {
          type: "divider",
        },
        {
          icon: "link",
          iconType: "remix",
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
          title: "Horizontal Rule",
          action: () => this.editor.chain().focus().setHorizontalRule().run(),
        },

        {
          icon: "vidicon-line",
          iconType: "remix",
          title: "video",
          action: (file) => {
            this.embedType = "video";
            this.embedPromptOpen = !this.embedPromptOpen;
          },

          // this.editor.commands.setExternalVideo({
          //   src: file.src,
          //   width: file.width,
          //   height: file.height,
          // }),
        },

        {
          icon: "image-line",
          iconType: "remix",
          title: "Image",
          action: () => {
            this.setFilePromptOpen("preview");
          },
        },
        {
          icon: "file-3-line",
          iconType: "remix",
          title: "Attachment",
          action: () => {
            this.setFilePromptOpen("nonpreview");
          },
        },
        {
          icon: "grid-line",
          iconType: "remix",
          title: "table",
          action: () => (this.tablePromptOpen = !this.tablePromptOpen),
          // action: () =>
          //   this.editor
          //     .chain()
          //     .focus()
          //     .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          //     .run(),
          isActive: () => this.editor.isActive("table"),
        },
        {
          type: "divider",
        },
        {
          icon: CommentIcon,
          iconType: "inline",
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
