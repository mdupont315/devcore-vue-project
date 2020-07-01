<template>
  <div class="file-field" :class="{'has-file':file || currentFile}">
    <i class="mdi mdi-folder-open-outline"></i> &nbsp;
    <a
      class="link title text-gray"
      v-if="currentFile && !this.file"
      target="_blank"
      :href="currentFile.downloadUrl"
    >{{ title }}</a>
    <span
      class="title text-capitalize"
      v-if="!this.file && !currentFile"
    >{{ placeholder || $t('Upload file') }}</span>
    &nbsp;
    <span class="field-wrapper">
      <span
        class="title text-gray"
        style="max-width:200px;overflow:hidden"
        v-if="this.file"
      >{{ this.file.name }}</span>
      &nbsp;
      <span class="replace" v-if="file || currentFile">
        <i class="mdi mdi-pencil"></i>
        {{ $t('Change') }}
      </span>&nbsp;
      <input type="file" @change="fileChanged" class="field" />
    </span>
    <span class="remove" v-if="file || currentFile" @click="remove">
      <i class="mdi mdi-delete text-danger"></i>
      {{ $t('Remove') }}
    </span>
  </div>
</template>
<script>
export default {
  name: "file-field",
  props: {
    value: {
      required: false
    },
    currentFile: {
      required: false
    },
    title: {
      required: false
    },
    placeholder: {
      required: false
    }
  },
  data: () => ({
    file: null
  }),
  mounted() {},
  methods: {
    fileChanged(event) {
      if (event.target.files[0]) {
        this.file = event.target.files[0];
      }
      this.$emit("input", this.file);
    },
    remove() {
      this.file = null;
      this.$emit("input", null);
    }
  }
};
</script>