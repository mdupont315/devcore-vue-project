<template>
  <div>
    <div v-if="getValue && type && configs">
      <layer style="z-index: 2" @closed="$emit('input', false)" />

      <div class="embed-modal-prompt-wrapper">
        <div class="embed-modal-prompt-container">
          <div>
            <div class="embed-modal-prompt-container-title">
              {{ configs.title }}
            </div>
            <b-form>
              <b-row>
                <b-col class="col-12" ref="insert_iframe-url">
                  <div class="form-label-group required form-group">
                    <b-form-input
                      v-if="configs.text !== null"
                      id="idea_edit_insert__url"
                      name="idea_edit_insert__url"
                      v-model="text"
											autocomplete="off"
                      :placeholder="configs.inputPlaceholder"
                      type="text"
                    ></b-form-input>
                  </div>
                  <div class="form-label-group required form-group">
                    <b-form-input
                      id="idea_edit_insert__url"
                      name="idea_edit_insert__url"
                      v-model="url"
											autocomplete="off"
                      :placeholder="configs.urlPlaceholder"
                      type="text"
                    ></b-form-input>
                  </div>
                </b-col>
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
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Boolean,
      default: () => false,
    },
    type: {
      type: String,
      default: () => "",
    },
    configs: {
      type: Object,
      default: () => null,
    },
  },
  methods: {
    save() {
      this.$emit("setEmbed", {
        type: this.type,
        text: this.text,
        url: this.url,
      });
    },
    cancel() {
      this.url = null;
      this.$emit("input", false);
    },
  },
  watch: {
    value: {
      handler(newVal) {
        if (!newVal) {
          this.url = "https://";
          this.text = "";
        }
      },
    },
    configs: {
      deep: true,
      handler(newVal) {
        if (newVal) {
          this.url = newVal.url;
          this.text = newVal.text;
        }
      },
    },
  },
  data() {
    return {
      url: "https://",
      text: null,
    };
  },
  computed: {
    getValue: {
      get() {
        return this.value;
      },
    },
  },
};
</script>

<style lang="scss" scoped>
.embed-modal-prompt-wrapper {
  z-index: 2;
  position: absolute;
  margin: auto;
  position: absolute;
  top: 45%;
  left: 40%;
  margin-top: -50px;
  margin-left: -50px;
  border-radius: 3px;
}

.embed-modal-prompt-container {
  background: #fff;
  width: 100%;
  height: 100%;
  display: flex;
  padding: 20px;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 3px;
}

.embed-modal-prompt-container-title {
  font-family: "FuturaBold";
  font-size: 18px;
  padding-bottom: 20px;
}
</style>




