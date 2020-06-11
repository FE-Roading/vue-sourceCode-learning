function JGVue(options) {
  this._options = options;
  this._data = options.data;
  // vue是字符串，这里是DOM
  this._template = document.querySelector(options.el);
  this._parent = this._template.parentNode;
  // 将data进行响应式装换，进行代理
  this.initData();
  this.mount(); //挂载
}
