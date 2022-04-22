<template>
  <div class="menubar-prompt-input-field-container">
    <label
      class="menubar-prompt-input-field"
      v-b-modal.modal-1
      style="margin: 0"
    >
      <svg class="remix" v-b-modal.modal-1>
        <use :xlink:href="`${remixiconUrl}#ri-${item.icon}`" />
      </svg>
    </label>
    <div>
      <b-modal id="modal-1" title="BootstrapVue">
        <p class="my-4">Hello from modal!</p>
      </b-modal>
    </div>
  </div>
</template>

<script>
import remixiconUrl from "@/assets/img/remixicon.symbol.svg";

export default {
  props: {
    item: {
      type: Object,
      required: true,
    },
  },

  methods: {
    previewFiles(event) {
      this.item.action(event.target.files);
    },
  },
  data() {
    return {
      remixiconUrl,
    };
  },
};
</script>

<style lang="scss" scoped>
.menubar-prompt-input-field-container {
  width: 100%;
  height: 100%;
  display: flex;
  max-width: 50px;
  max-height: 50px;
  align-items: center;
  height: 100%;
  display: flex;
  place-content: center;
  align-items: center;
}

.idea_edit_menu_prompt_button:focus-visible {
  outline: none;
}

.idea_edit_menu_prompt_button {
  background-color: #fff;
  color: #000;
  border: none;
  width: 100%;
  height: 100%;
}

.idea_edit_menu_prompt_button:hover {
  background-color: #000;
  fill: #fff;
}

.menubar-prompt-input-field {
  width: 50px;
  text-align: center;
  height: 20px;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}
.menu-prompt {
  width: 1.75rem;
  height: 1.75rem;
  display: flex;
  color: #0d0d0d;
  border: none;
  background-color: transparent;
  border-radius: 0.4rem;
  padding: 0.25rem;
  margin-right: 0.25rem;

  svg {
    width: 100%;
    height: 100%;
    fill: currentColor;
  }
}
</style>
