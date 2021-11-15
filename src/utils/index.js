export function isFunction(item) {
  return typeof item === 'function';
}

export function isObject(object) {
  return Object.prototype.toString.call(object) === '[object Object]';
}

export function isArray(object) {
  return Object.prototype.toString.call(object) === '[object Array]';
}
