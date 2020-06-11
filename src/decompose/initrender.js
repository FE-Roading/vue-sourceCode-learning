JGVue.prototype.mount = function () {
  // 需要提供一个render方法:生成虚拟DOM
  // 带有缓存作用
  this.render = this.createRenderFn();

  this.mountComponent();
};

JGVue.prototype.mountComponent = function () {
  // 执行mountComponent()函数
  let mount = () => {
    // update 渲染页面
    // render生成虚拟DOM
    this.update(this.render());
  };
  mount.call(this); //发布者模式：本质上应该交给wathcer调用
  // 为何不直接写
  // this.update(this.render())
  // 使用发布订阅模式，渲染和计算的行为应该交给观察者完成
};

// 生成render函数，目的是缓存抽象语法树（用虚拟DOM模拟抽象语法树）
JGVue.prototype.createRenderFn = function () {
  //利用闭包缓存抽象语法树
  let ast = getVNode(this._template);

  //Vue中，将AST+data => VNode
  // 此处简化，将带有坑的VNode加上data生成一个含有数据的VNode
  return function render() {
    let temp = combine(ast, this._data);
    return temp;
  };
};

// 将虚拟DOM渲染到页面中， diff算法在此处使用
JGVue.prototype.update = function (vnode) {
  // 简化，直接生成HTML DOM
  // replaceChild到页面中
  let realHTMLDOM = parseVNode(vnode);
  this._parent.replaceChild(
    realHTMLDOM,
    document.querySelector(this._options.el)
  );
  // 这个算法是不负责任的
  // 每次会将页面中的DOM全部替换
};
