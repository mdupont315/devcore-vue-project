import numeral from 'numeral';

String.prototype.ucFirst = function() {
    return this.charAt(0).toUpperCase() + this.slice(1)
}

export function numberFormat(value, decimals = 2, format = "0.00") {
    value = +(`${Math.round(`${value}e+${decimals}`)}e-${decimals}`);
    return numeral(Number(value)).format(format); // displaying other groupings/separators is possible, look at the docsƒ
}

