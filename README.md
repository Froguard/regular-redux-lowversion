# regular-redux-lowversion

> 受启发于 [regular-redux](https://github.com/jinze/regular-redux)

> 让redux在 **低版本** 上也能正常工作，且已经在实际的项目应用中投入使用，Regular@v0.4.3

> 改进1：dispatch与actionCreators的结合，降低组件中对于store的直接感知，详见mergeDispatchAndActionCreators

> 改进2：DIY常用redux工具函数，combineReducers，checkActionTypesUnique，mergeDispatchAndActionCreators

> 改进3：provider作为一个特殊的container，并不额外增加组件，而是采用mixin方式，将root根组件转变成provider

> 改进4：container的初始化可以传入actionCreators对象，按需进行actions的配置

> 改进5：state变化时，组件的更新策略优化，增加主动更新之后，废除自动更新

> 改进6：友好的提示，可能出现的错误以及同时提供修改建议

建议：

> 低版本Regular，关于store的传递通过 *$parent* 进行传递，弊端是isolate和new操作下，链条断开。解决方法两个，要么new操作的时候传入store，要么去掉isolate

> 关于store上的dispatch，并不需要直接操作，通过connect的封装，可以直接像 [react-redux](https://www.npmjs.com/package/react-redux) 那样，通过actions.actionCreatorName(...agrs)的方式,直接构建并触发一个action

> 配合 [redux-promise-middleware](https://www.npmjs.com/package/redux-promise-middleware) 插件一起食用，效果更好

> 避免组件的data对象过大，有些信息并不是必要的，建议不要将整个store以及整个state都放到data上，这也是这里不提供mapState2Data的原因，因为跟业务逻辑有些挂钩了

潜在问题：

> 如果使用的RegularJs版本低于0.5.0的话，会出现 [regularjs的一个mixin导致event覆盖的坑](https://github.com/regularjs/regular/issues/97)
解决方法有两种:
    
```
方法1：换一种方式实现event中的回调，init或者config中采用this.$on('evtName',function(){});的方式
方法2：升级regularjs版本
```