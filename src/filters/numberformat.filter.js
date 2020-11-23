import Vue from 'vue';
import numeral from 'numeral';

Vue.filter("numberFormat", function(value, format) {
    value = +(`${Math.round(`${value}e+2`)}e-2`);
    return numeral(Number(value)).format(format); // displaying other groupings/separators is possible, look at the docs
});