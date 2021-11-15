import { isArray, isObject } from '../utils';
import newArrayPrototype from './array';

class Observer {
  constructor(data) {
    //  if (!isObject(data)) return;
    if (isArray(data)) {
      this.observeArray(data);
    } else if (isObject(data)) {
      console.log(data);
      this.walk(data);
    }
  }

  walk(data) {
    Object.keys(data).map((item) => {
      if (isObject(data[item])) {
        this.walk(data[item]);
      }
      if (isArray(data[item])) {
        data[item].__proto__ = newArrayPrototype;
        data[item].__ob__ = this;
      } else {
        defineReactive(data, item, data[item]);
      }
    });
  }

  observeArray(value) {
    value.map((item) => {
      new Observer(item);
    });
  }
}
function defineReactive(obj, key, val) {
  //   console.log(obj, key, val);
  Object.defineProperty(obj, key, {
    get() {
      return val;
    },
    set(newVal) {
      if (newVal !== val) {
        //   console.log(val, newVal);
        val = newVal;
        if (isArray(newVal)) {
          val.__proto__ = newArrayPrototype;
          val.__ob__ = new Observer();
        }
      }
    },
  });
}

export default Observer;
