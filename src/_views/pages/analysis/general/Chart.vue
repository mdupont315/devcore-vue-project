var render, staticRenderFns
import script from "./Chart.vue?vue&type=script&lang=js&"
export * from "./Chart.vue?vue&type=script&lang=js&"


/* normalize component */
import normalizer from "!../../../../../node_modules/vue-loader/lib/runtime/componentNormalizer.js"
var component = normalizer(
  script,
  render,
  staticRenderFns,
  false,
  null,
  null,
  null
  
)

export default component.exports