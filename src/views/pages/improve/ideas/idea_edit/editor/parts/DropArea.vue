<template>
  <div>
    <div class="overlay top-all" @click="overlayClick"></div>
    <div>
      <b-card
        style="
          position: absolute;
          width: 500px;
          height: 500px;
          z-index: 1000;
          background: #fff;
          right: 40%;
          left: 40%;
        "
      >
        UPLOAD ZONE
      </b-card>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    editor: {
      type: Object,
      required: true,
    },
    attributes: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      form: {
        src: "",
        width: "",
        height: "",
        alt: "",
        title: "",
        class: "",
        srcset: "",
        sizes: "(min-width: 768px) 80vw, (min-width: 1024px) 75vw, 100vw",
        loading: "lazy",
      },
      classes: [],
      srcsets: [],
    };
  },
  mounted() {
    console.log("MOUNTED");
  },
  methods: {
    overlayClick() {
      this.$emit("close");
      console.log("ASD");
    },
  },
};
</script>
