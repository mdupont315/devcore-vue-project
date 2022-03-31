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
      <!-- <menu-grid v-else-if="item.type === 'grid'" :key="index" :item="item" /> -->

      <menu-file-field
        v-else-if="item.type === 'file'"
        :key="index + '-file'"
        :item="item"
        :editor="editor"
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
// import MenuGrid from "./MenuGrid.vue";

export default {
  components: {
    "menu-item": MenuItem,
    "menu-list": MenuList,
    "menu-file-field": MenuFile,
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
          listItems: [
            {
              icon: "h-1",
              title: "Chapter",
              action: () => {
                this.editor.commands.setChapterText();
                this.editor.commands.setFontFamily("FuturaBold");
                this.activeHeading = "h-1";
              },
              isActive: () => this.editor.isActive("heading", { level: 1 }),
            },
            {
              icon: "h-2",
              title: "Title",
              action: () => {
                this.editor.commands.setTitleText();
                this.editor.commands.setFontFamily("FuturaMedium");
                this.activeHeading = "h-2";
              },
              isActive: () => this.editor.isActive("heading", { level: 2 }),
            },
            {
              icon: "h-3",
              title: "Subtitle",
              action: () => {
                this.editor.commands.setSubTitleText();
                this.editor.commands.setFontFamily("FuturaMedium");
                this.activeHeading = "h-2";
              },
              isActive: () => this.editor.isActive("heading", { level: 3 }),
            },
            {
              icon: "paragraph",
              title: "Paragraph",
              action: () => {
                this.editor.commands.setParagraphText();
                this.editor.commands.setFontFamily("FuturaLight");
                this.activeHeading = "h-4";
              },
              isActive: () => this.editor.isActive("heading", { level: 4 }),
            },
          ],
        },

        {
          icon: "bold",
          title: "Bold",
          action: () => this.editor.chain().focus().toggleBold().run(),
          isActive: () => this.editor.isActive("bold"),
        },
        {
          icon: "italic",
          title: "Italic",
          action: () => this.editor.chain().focus().toggleItalic().run(),
          isActive: () => this.editor.isActive("italic"),
        },
        {
          type: "divider",
        },

        {
          icon: "image-line",
          type: "file",
          title: "Image",
					action: (file) => this.editor.commands.setImage(file)
        },
        {
          icon: "list-unordered",
          title: "Bullet List",
          action: () => this.editor.chain().focus().toggleBulletList().run(),
          isActive: () => this.editor.isActive("bulletList"),
        },
        {
          icon: "list-ordered",
          title: "Ordered List",
          action: () => this.editor.chain().focus().toggleOrderedList().run(),
          isActive: () => this.editor.isActive("orderedList"),
        },
        {
          type: "divider",
        },
        {
          icon: "separator",
          title: "Horizontal Rule",
          action: () => this.editor.chain().focus().setHorizontalRule().run(),
        },
        {
          icon: "grid-line",
          title: "table",
          action: () =>
            this.editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run(),
          isActive: () => this.editor.isActive("table"),
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
  width: 50px;
}
</style>
