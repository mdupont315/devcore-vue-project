var render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"search-bar"},[_c('b-input-group',{staticClass:"search",staticStyle:{"margin-top":"5px"}},[_c('b-form-input',{staticClass:"search",attrs:{"placeholder":_vm.$t('Search projects') + " (" + (_vm.items.length) + ")"},on:{"input":_vm.filterResults},model:{value:(_vm.currentFilter),callback:function ($$v) {_vm.currentFilter=$$v},expression:"currentFilter"}})],1)],1)}
var staticRenderFns = []

export { render, staticRenderFns }