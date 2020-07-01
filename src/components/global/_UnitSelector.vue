var render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"unit-selector"},_vm._l((_vm.units),function(unit){return _c('div',{key:_vm.getValue(unit),staticClass:"unit",class:_vm.getClass(unit),on:{"click":function ($event){ return _vm.changeValue(unit); }}},[_vm._v(_vm._s(_vm.$t(_vm.getLabel(unit))))])}),0)}
var staticRenderFns = []

export { render, staticRenderFns }