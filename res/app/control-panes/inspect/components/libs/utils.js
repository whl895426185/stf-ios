
var utils = {}
function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

function objectClassName(obj) {
  return Object.keys(obj).reduce((prev, key) => {
    return obj[key] ? (prev + ' ' + key) : prev;
  }, '');
}

function arrayClassName(arr) {
  return arr.map(value => {
    return isObject(value) ? objectClassName(value) : value;
  }).join(' ');
}

/**
 * className for human
 * @example
 * className('button', 'primary', { disabled: true })
 */
utils.className = function(...args) {
  return arrayClassName(args);
};

/**
 * clone part of object.
 * @example
 * pick({ a: 3, b: 4}, { a: true, _c: true })
 * -> { a: 3}
 */
utils.pick = function(dict, term) {
  const newer = {};
  for (let key in term) {
    if (term[key] && dict.hasOwnProperty(key)) {
      newer[key] = dict[key];
    }
  }
  return newer;
}
module.exports = utils
