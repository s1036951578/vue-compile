import { compileFunction } from './compiler';
import { initState } from './state';

export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    const vm = this;
    vm.$options = options;
    // 初始化数据
    initState(vm);
    let template = null;
    //  if (vm.$options.template) {
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
