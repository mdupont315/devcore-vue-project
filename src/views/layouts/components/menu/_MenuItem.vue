var render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('li',{class:{'active': _vm.active},on:{"click":function($event){return _vm.toggle(_vm.item,$event)}}},[(_vm.item.url)?_c('router-link',{staticClass:"title",attrs:{"to":_vm.item.url}},[(_vm.item.icon)?_c('i',{staticClass:"mdi icon",class:_vm.item.icon}):_vm._e(),_vm._v(" "+_vm._s(_vm.item.title)+" ")]):_c('span',{staticClass:"title"},[(_vm.item.icon)?_c('i',{staticClass:"mdi icon",class:_vm.item.icon}):_vm._e(),_vm._v(" "+_vm._s(_vm.item.title)+" ")]),(_vm.item.children)?_c('ul',{staticClass:"nav sub-menu"},_vm._l((_vm.item.children),function(subitem,subindex){return _c('li',{key:subindex,staticClass:"item link",class:{'active':_vm.$route.matched.some(function (ref) {
	var name = ref.name;

	return name === subitem.name;
})},on:{"click":function($event){$event.stopPropagation();return _vm.subItemClick($event, _vm.item)}}},[_c('router-link',{staticClass:"title",attrs:{"to":subitem.url}},[_vm._v(" "+_vm._s(subitem.title)+" ")])],1)}),0):_vm._e()],1)}
var staticRenderFns = []

export { render, staticRenderFns }