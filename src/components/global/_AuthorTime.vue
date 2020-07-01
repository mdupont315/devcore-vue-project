var render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return (_vm.user)?_c('div',{staticClass:"author-time"},[_c('img',{staticClass:"rounded-circle border",attrs:{"src":_vm.user.getAvatarUrl('50x50'),"height":"30"}}),_c('span',{staticClass:"right"},[_c('span',{staticClass:"name"},[_vm._v(_vm._s(_vm.user.fullName))]),(_vm.time)?_c('time-ago',{staticClass:"time",attrs:{"time":_vm.time}}):_vm._e()],1)]):_vm._e()}
var staticRenderFns = []

export { render, staticRenderFns }