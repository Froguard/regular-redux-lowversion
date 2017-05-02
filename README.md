# regular-redux-lowversion

> 受启发于 [regular-redux](https://github.com/jinze/regular-redux)

> 让redux在 **低版本** 上也能正常工作，且已经在实际的项目应用中投入使用，Regular@v0.4.3

> 改进1：dispatch与actionCreators的结合，降低组件中对于store的直接感知，详见mergeDispatchAndActionCreators

> 改进2：DIY常用redux工具函数，combineReducers，checkActionTypesUnique，mergeDispatchAndActionCreators

> 改进3：provider作为一个特殊的container，并不额外增加组件，而是采用mixin方式，将root根组件转变成provider

> 改进4：友好的提示，可能出现的错误以及同时提供修改建议

建议：

> 低版本Regular，关于store的传递通过 *$parent* 进行传递，弊端是isolate和new操作下，链条断开。解决方法两个，要么new操作的时候传入store，要么去掉isolate

> 关于store上的dispatch，并不需要直接操作，通过connect的封装，可以直接像 [react-redux](https://www.npmjs.com/package/react-redux) 那样，通过actions.actionCreatorName(...agrs)的方式,直接构建并触发一个action

> 配合 [redux-promise-middleware](https://www.npmjs.com/package/redux-promise-middleware) 插件一起食用，效果更好

