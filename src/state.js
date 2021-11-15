import Observer from './observe/index';
import { isFunction } from './utils/index';

export function initState(vm) {
  if (vm.$options.data) {
    initData.call(vm, vm.$options.data);
  }
}
// 数据代理
function proxy(obj, key, tag) {
  Object.defineProperty(obj, key, {
    set(newVal) {
      obj[tag][key] = newVal;
    },
    get() {
      return obj[tag][key];
    },
  });
}

function initData(data) {
  this._data = data = isFunction(data) ? data.call(this) : data;
  Object.keys(data).map((item) => {
    proxy(this, item, '_data');
  });
  new Observer(data);
}
