// 数组响应化
let ARRAY_METHOD = [
  "push",
  "pop",
  "shift",
  "unshift",
  "reverse",
  "sort",
  "splice",
];
let array_methods = Object.create(Array.prototype);
ARRAY_METHOD.forEach((method) => {
  array_methods[method] = function () {
    // 调用原来的方法
    console.log(`调用的是拦截的${method}方法`);

    // 将数组进行响应化， 对arguments循环reactify
    for (let i = 0; i < arguments.length; i++) {
      // 此处无法传入 vm, 暂时是一个缺陷，需要watcher引入
      observe(arguments[i]);
    }

    let res = Array.prototype[method].apply(this, arguments);
    return res;
  };
});

// 响应式化部分
function defineReactive(target, key, value, enumerable) {
  // 函数内部是一个局部作用域，这个value只在函数内使用的变量
  // 这只是一个简化的版本
  // 折中处理后， this就是vue实例
  let that = this;
  if (
    typeof value === "object" &&
    value != null
  ) {
    // 为非数组的引用类型
    observe(value, this);
  }

  Object.defineProperty(target, key, {
    configurable: true,
    enumberable: !!enumerable,

    get() {
      console.log(`读取 o的${key}属性 `);
      return value;
    },
    set(newVal) {
      console.log(`设置 o的${key}属性 `);

      // 将重新复制的数据变成响应式，因此如果传入的是对象类型，就需要使用observe将其转换为响应式
      if (typeof newVal === "object" && newVal != null) {
        observe(newVal);
      }
      value = newVal;
      // vue 实例？ watcher不会有这个问题
      // 模板刷新，{现在是虚假的，只是作为展示}

      typeof that.mountComponent === 'function' && that.mountComponent();
      // 临时解决方案，数组没有参与页面的渲染，所以在数组上进行响应式处理，不需要页面的刷新
      // 即使无法调用也没有关系
    },
  });
}

// 将对象o响应式化
// 是将对象的成员响应式化，并没有直接响应式化对象本身
// function reactify(o, vm) {
//   let keys = Object.keys(o);

//   for (let i = 0; i < keys.length; i++) {
//     // 属性名
//     let key = keys[i];
//     let value = o[key];

//     if (Array.isArray(value)) {
//       // 是数组
//       // 给数组的方法添加响应式
//       value.__proto__ = array_methods;
//       for (let j = 0; j < value.length; j++) {
//         // TO-DO 如果成员也是数组怎么办？
//         reactify(value[j], vm);
//       }
//     } else {
//       // 对象，或者是指类型
//       defineReactive.call(vm, o, key, value, true);
//     }
//   }
// }

/**将对象o变成响应式 vm就是vue实力，为了调用时处理上下文*/
function observe(obj, vm) {
  // reatify没有对obj本身进行操作，这一次直接对obj进行判断
  if (Array.isArray(obj)) {
    // 对其每一个元素处理
    obj.__proto__ = array_methods;
    for (let i = 0; i < obj.length; i++) {
      // 递归处理每一个数组元素
      observe(obj[i], vm);
    }
  } else {
    // 对其成员进行处理
    let keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
      // 属性名
      let prop = keys[i];
      defineReactive.call(vm, obj, prop, obj[prop], true);
    }
  }

}

// 代理函数
function proxy(target, prop, key) {
  Object.defineProperty(target, key, {
    enumerable: true,
    configurable: true,
    get() {
      return target[prop][key];
    },
    set(newVal) {
      target[prop][key] = newVal;
    },
  });
}

JGVue.prototype.initData = function () {
  // 遍历this._data的成员，将属性转换为响应式，将直接属性（非递归属性）代理到实例上
  let keys = Object.keys(this._data);
  // 响应式化
  observe(this._data, this);
  // 代理
  for (let i = 0; i < keys.length; i++) {
    // 这里将this._data[keys[i]] 映射到this[keys[i]]上
    // 让this提供keys[i] 这个属性
    // 访问这个属性时，相当于在访问this._data属性
    proxy(this, "_data", keys[i]);
  }
};
