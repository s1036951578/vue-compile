import { isArray, isObject } from '../utils';

let oldArrayPrototype = Array.prototype;

const methods = [
  'push',
  'splice',
  'pop',
  'shift',
  'unshift',
  'reverse',
  'sort',
];

let newArrayPrototype = Object.create(oldArrayPrototype);
methods.map((item) => {
  newArrayPrototype[item] = function (...arg) {
    oldArrayPrototype[item].call(this, ...arg);

    let obList = null;
    // 添加数组的元素 添加劫持
    if (item === 'splice') {
      obList = arg.slice(2);
    }
    if (item === 'push' || item === 'unshift') {
      obList = arg;
    }
    const ob = this.__ob__;
    obList && ob.observeArray(obList);
  };
});

export default newArrayPrototype;
