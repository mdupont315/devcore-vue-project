import Vue from 'vue'
import store from '../store';
import {
    numberFormat
} from '../lib/functions';
// function for check the users permissions
Vue.use({
    install(Vue) {

        Vue.prototype.$currency = function(value) {
            const user = store.getters['auth/user'];
            if (!user || !user.company) {
                return value;
            }
            value = numberFormat(value);
            return `${user.company.currency.symbol} ${new Intl.NumberFormat('en-US', { style: 'decimal' }).format(value)}`;

        }

        Vue.prototype.$currencyReverse = function(value) {
          const user = store.getters['auth/user'];
          if (!user || !user.company) {
              return value;
          }
          value = numberFormat(value);
          return `${new Intl.NumberFormat('en-US', { style: 'decimal' }).format(value)} ${user.company.currency.symbol}`;

      }
    }
});
