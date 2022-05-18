<template>
  <div class="menubar-prompt-input-field-container">
    <div class="menubar-prompt-input">
      <label
        class="menubar-prompt-input-field"
        v-b-modal.modal-1
        style="margin: 0"
      >
        <svg class="remix" v-b-modal.modal-1>
          <use :xlink:href="`${remixiconUrl}#ri-${item.icon}`" />
        </svg>
      </label>
    </div>
    <div>
      <b-modal
        id="modal-1"
        ref="idea_insert_iframe"
        :title="$t('setUrl')"
        hide-footer
      >
        <b-form>
          <b-row>
            <b-col class="col-12" ref="insert_iframe-url">
              <div class="form-label-group required form-group">
                <b-form-input
                  id="insert_iframe_url"
                  name="insert_iframe_url"
                  v-model="form.url"
                  v-validate="'required'"
                  v-autofocus
                  :placeholder="$t('url')"
                  type="text"
                ></b-form-input>
              </div>
            </b-col>
            <!-- <b-col class="col-12" ref="insert_iframe-widthHeight">
              <b-row style="margin: auto">
                <div class="form-label-group required form-group">
                  <b-form-input
                    id="insert_iframe-width"
                    name="insert_iframe-width"
                    v-model="form.width"
                    v-validate="'required'"
                    v-autofocus
                    placeholder="Insert Width"
                    type="text"
                  ></b-form-input></div
              ></b-row>
              <b-row style="margin: auto">
                <div class="form-label-group required form-group">
                  <b-form-input
                    id="insert_iframe-height"
                    name="insert_iframe-height"
                    v-model="form.height"
                    v-validate="'required'"
                    v-autofocus
                    placeholder="Insert Height"
                    type="text"
                  ></b-form-input></div
              ></b-row>
            </b-col> -->

            <b-col cols="3">
              <b-button
                class="mt-3"
                variant="outline-primary"
                block
                @click="save"
                >{{ $t("Save") }}</b-button
              >
            </b-col>
            <b-col cols="3">
              <b-button
                class="mt-3"
                variant="outline-danger"
                block
                @click="cancel"
                >{{ $t("close") }}</b-button
              >
            </b-col>
          </b-row>
        </b-form>
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

  data: () => ({
    remixiconUrl,
    form: {
      url: null,
      width: 560,
      height: 315,
    },
  }),

  methods: {
    close() {
      this.$refs["idea_insert_iframe"].hide();
    },
    save() {
      const src = `https://www.youtube.com/embed/${this.handleUrl(
        this.form.url
      )}`;
      const width = this.form.width;
      const height = this.form.height;
      this.item.action({ src, width, height });
      this.close();
    },
    cancel() {
      this.close();
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
    handleUrl(url) {
      let ret = null;

      if (this.isYoutubeUrl(url)) {
        ret = this.parseYoutubeUrl(url);
      }

      return ret;
    },
    previewFiles(event) {
      this.item.action(event.target.files);
    },
  },
};
</script>

<style lang="scss" scoped>
.menubar-prompt-input {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  border-radius: 5px;
  &:hover {
    background: #4294d0;
    > label > svg {
      fill: #fff;
    }
  }
}
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
  background-color: #4294d0;
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
    &:active,
    :focus {
      outline: none;
    }
    & > use {
      &:active,
      :focus {
        outline: none;
      }
    }
  }
}
</style>
