import Vue from 'vue'
import store from '../store';

// function for check the users permissions
Vue.use({
    install(Vue) {

        Vue.prototype.$can = function(...args) {
            const user = store.getters['auth/user'];
            if (!user) {
                return false;
            }

            if (args[1] && args[1].can && args[1]._permissions) {
                return args[1].can(args[0]);
            }

            return user.can(...args);
        }
    }
});