//由HTMLDOM生成虚拟DOM
// 将这个函数当做compiler函数，编译成抽象语法树的函数
function getVNode(node) {
  let nodeType = node.nodeType;
  let _vnode = null;
  if (nodeType == 1) {
    // 元素节点
    let nodeName = node.nodeName;
    // 伪数组
    let attrs = node.attributes;
    let _attrObj = {};
    for (let i = 0; i < attrs.length; i++) {
      // 属性节点（nodeType =2 ,有nodeName和nodeValue属性）
      _attrObj[attrs[i].nodeName] = attrs[i].nodeValue;
    }
    _vnode = new VNode(nodeName, _attrObj, undefined, nodeType);

    //考虑node下的子元素
    let childNodes = node.childNodes;
    for (let i = 0; i < childNodes.length; i++) {
      _vnode.appendChild(getVNode(childNodes[i]));
    }
  } else if (nodeType == 3) {
    // 文本节点
    _vnode = new VNode(undefined, undefined, node.nodeValue, nodeType);
  }
  return _vnode;
}

// 将虚拟DOM转换为实际的DOM
function parseVNode(vnode) {
  // 创建真实的DOM
  let type = vnode.type;
  let _node = null;
  if (type === 3) {
    // 文本节点
    return document.createTextNode(vnode.value);
  } else if (type === 1) {
    _node = document.createElement(vnode.tag);

    // 属性
    let data = vnode.data; //现在只是键值对
    Object.keys(data).forEach((key) => {
      let attrName = key;
      let attrValue = data[key];
      _node.setAttribute(attrName, attrValue);
    });

    // 子元素
    let children = vnode.children;
    // 递归转换子元素,
    // 将子元素的虚拟DOM转化为真实DOM
    children.forEach((subvnode) => {
      _node.appendChild(parseVNode(subvnode));
    });
  }
  return _node;
}

// 正则表达式
let kuohao = /\{\{(.+?)\}\}/g;

// 根据路径访问对象成员
function getValueByPath(obj, path) {
  let paths = path.split(".");
  let res = obj;
  let prop;
  while ((prop = paths.shift())) {
    res = res[prop];
  }
  return res;
}

// 将带有坑的VNode与数据结合，生成新的有数据的VNode
// 模拟AST -->>VNode 的行为
function combine(vnode, data) {
  let _type = vnode.type;
  let _data = vnode.data;
  let _value = vnode.value;
  let _tag = vnode.tag;
  let _children = vnode.children;
  let _vnode = null;
  if (_type === 3) {
    // 文本节点
    // 对文本处理
    _value = _value.replace(kuohao, function (_, g) {
      return getValueByPath(data, g.trim());
    });
    _vnode = new VNode(_tag, _data, _value, _type);
  } else if (_type === 1) {
    // 元素节点
    _vnode = new VNode(_tag, _data, _value, _type);
    _children.forEach((subvnode) => {
      _vnode.appendChild(combine(subvnode, data));
    });
  }
  return _vnode;
}
