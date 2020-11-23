/**
 * import and init global mixins
 */

import Vue from 'vue'

import currentUser from "./currentUser"
import jumpTo from "./jumpTo"
import formatDateTime from "./formatDateTime"

Vue.mixin(currentUser)
Vue.mixin(jumpTo)
Vue.mixin(formatDateTime)
