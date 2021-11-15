(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`; // 匹配标签名的  aa-xxx

  const qnameCapture = `((?:${ncname}\\:)?${ncname})`; //  aa:aa-xxx

  const startTagOpen = new RegExp(`^<${qnameCapture}`); //  此正则可以匹配到标签名 匹配到结果的第一个(索引第一个) [1]

  const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配标签结尾的 </div>  [1]

  const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的
  // [1]属性的key   [3] || [4] ||[5] 属性的值  a=1  a='1'  a=""

  const startTagClose = /^\s*(\/?)>/; // 匹配标签结束的  />    >

  const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // {{   xxx  }}

  function compileFunction(template) {
    let ast = parstHTML(template);
    let code = formatting(ast);
    let render = new Function(`with(this){${code}}`);
    console.log(render);
  } // 格式化

  function formatting(ast) {
    // 解析格式
    // https://template-explorer.vuejs.org
    // return _c('div', {
    //    attrs: {
    //      "id": "app"
    //    }
    //  }, [_v(_s(msg))])
    let code = '';
    code = `_c(${ast.tag},{attr:${JSON.stringify(formaAttrs(ast.attr))}},${ast.children.length ? JSON.stringify(formatChild(ast.children)) : '[]'})`;
    return code;
  } // 格式化child


  function formatChild(child) {
    let cus = [];
    child.map(item => {
      // 元素类型
      if (item.type === 1) {
        cus.push(formatting(item));
      } // 文本


      if (item.type === 2) {
        if (defaultTagRE.test(item.content)) {
          let content = item.content;
          let reg = null;
          let str = [];
          let index = defaultTagRE.lastIndex = 0; //   匹配到{{xxx}} 并拿到lastIndex下标

          while (reg = defaultTagRE.exec(content)) {
            const currIndex = reg.index;

            if (currIndex > index) {
              let start = content.slice(index, currIndex);
              str.push(JSON.stringify(start));
            }

            str.push(`_s(${JSON.stringify(reg[1].trim())})`);
            index = currIndex + reg[0].length;
          } // {{xxxx}} xxxx 截取后 后面还有数据但是正则不匹配 进入字符串截取


          if (index < content.length) {
            let end = content.slice(index);
            str.push(JSON.stringify(end));
          }

          cus.push(`_v(${str.join('+')})`);
        } else {
          cus.push(`_v(${JSON.stringify(item.content)})`);
        }
      }
    });
    return cus;
  } // 格式化属性


  function formaAttrs(attr) {
    if (!attr.length) return {};
    let attobj = {};
    attr.map(item => {
      let sp = item.split('=');
      attobj[sp[0]] = sp[1];
    });
    return JSON.stringify(attobj);
  }

  function parstHTML(html) {
    let arr = [];
    let root = null;

    function createASTElement(tag, attr, parent) {
      return {
        tag,
        attr,
        type: 1,
        parent,
        children: []
      };
    }

    let elobj = {
      tag: null,
      type: null,
      attr: [],
      text: null,
      parent: null,
      children: []
    };

    while (html) {
      let i = html.indexOf('<');

      if (i === 0) {
        let match;

        if (match = html.match(startTagOpen)) {
          elobj.tag = match[1];
          elobj.type = 1;
          substr(match[0].length);
          let attr;
          let box = []; // 多属性

          while (attr = html.match(attribute)) {
            elobj.attr.push(attr[0]);
            box.push(attr[0]);
            substr(attr[0].length);
          } // 当前节点的父节点


          let parent = arr[arr.length - 1];
          let element = createASTElement(match[1], box, parent);

          if (!root) {
            root = element;
          }

          if (parent) {
            element.parent = parent;
            parent.children.push(element);
          }

          arr.push(element);
        } // console.log(createASTElement(match, box));
        // if ((attr = html.match(attribute))) {
        // }


        let endclose;

        if (endclose = html.match(startTagClose)) {
          substr(endclose[0].length);
        }

        let endtag;

        if (endtag = html.match(endTag)) {
          arr.pop();
          substr(endtag[0].length);
        }
      }

      if (i > 0) {
        let strtext = html.substring(0, i);
        let parent = arr[arr.length - 1];
        parent.children.push({
          type: 2,
          content: strtext
        });
        elobj.text = strtext;
        substr(strtext.length);
      }
    }

    return root;

    function substr(length) {
      html = html.substring(length);
    }
  }

  function isFunction(item) {
    return typeof item === 'function';
  }
  function isObject(object) {
    return Object.prototype.toString.call(object) === '[object Object]';
  }
  function isArray(object) {
    return Object.prototype.toString.call(object) === '[object Array]';
  }

  let oldArrayPrototype = Array.prototype;
  const methods = ['push', 'splice', 'pop', 'shift', 'unshift', 'reverse', 'sort'];
  let newArrayPrototype = Object.create(oldArrayPrototype);
  methods.map(item => {
    newArrayPrototype[item] = function (...arg) {
      oldArrayPrototype[item].call(this, ...arg);
      let obList = null; // 添加数组的元素 添加劫持

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
      Object.keys(data).map(item => {
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
      value.map(item => {
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
      }

    });
  }

  function initState(vm) {
    if (vm.$options.data) {
      initData.call(vm, vm.$options.data);
    }
  } // 数据代理

  function proxy(obj, key, tag) {
    Object.defineProperty(obj, key, {
      set(newVal) {
        obj[tag][key] = newVal;
      },

      get() {
        return obj[tag][key];
      }

    });
  }

  function initData(data) {
    this._data = data = isFunction(data) ? data.call(this) : data;
    Object.keys(data).map(item => {
      proxy(this, item, '_data');
    });
    new Observer(data);
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      const vm = this;
      vm.$options = options; // 初始化数据

      initState(vm);
      //    // console.log('挂载逻辑');
      //    template = vm.$options.template;
      //  }

      if (vm.$options.el) {
        vm.$mount(vm.$options.el);
      }
    };

    Vue.prototype.$mount = function (el) {
      let template = document.querySelector(el).outerHTML;
      compileFunction(template);
    };
  }

  function Vue(options) {
    this._init(options);
  }

  initMixin(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
