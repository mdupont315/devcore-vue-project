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

      <menu-file-field
        v-else-if="item.type === 'file'"
        :key="index + '-file'"
        :item="item"
        :editor="editor"
      />

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
  </div>
</template>

<script>
import MenuItem from "./MenuItem.vue";
import MenuList from "./MenuList.vue";
import MenuFile from "./MenuFile";
import MenuPrompt from "./MenuPrompt";
// import MenuGrid from "./MenuGrid.vue";
import { CommentIcon } from "@/assets";

export default {
  components: {
    "menu-item": MenuItem,
    "menu-list": MenuList,
    "menu-file-field": MenuFile,
    "menu-prompt": MenuPrompt,
    CommentIcon,
  },
  methods: {
    toggleDropArea() {
      this.dropAreaOpen = !this.dropAreaOpen;
    },
  },
  props: {
    editor: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      dropAreaOpen: false,
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
          icon: "image-line",
          iconType: "remix",
          type: "file",
          title: "Image",
          action: (file) => this.editor.commands.setImage(file),
        },
        {
          icon: "vidicon-line",
          iconType: "remix",
          title: "video",
          type: "prompt",
          action: (file) =>
            this.editor.commands.setExternalVideo({
              src: file.src,
              width: file.width,
              height: file.height,
            }),
        },
        {
          icon: "list-unordered",
          iconType: "remix",
          title: "Bullet List",
          action: () => this.editor.chain().focus().toggleBulletList().run(),
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
          icon: "separator",
          iconType: "remix",
          title: "Horizontal Rule",
          action: () => this.editor.chain().focus().setHorizontalRule().run(),
        },
        {
          icon: "grid-line",
          iconType: "remix",
          title: "table",
          action: () =>
            this.editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run(),
          isActive: () => this.editor.isActive("table"),
        },
        {
          icon: CommentIcon,
          iconType: "inline",
          title: "comment",
          action: () => console.log("HELLO"),
          // action: () =>
          //   this.editor
          //     .chain()
          //     .focus()
          //     .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          //     .run(),
          // isActive: () => this.editor.isActive("table"),
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
  max-height: 50px;
  max-width: 50px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  margin: 0;
  place-content: center;
  cursor: pointer;
}
</style>
