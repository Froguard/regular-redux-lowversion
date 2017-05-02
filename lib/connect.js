/**
 * 1.连接组件和store
 * 2.做一些公共的初始化操作
 *   视图更新的调优
 *   dispatch的感知隐藏，统一收缩到actions上的与actionCreator的同名对象上
 *
 * Created by hzwangfei3 on 2017/4/11.
 */
import rdxUtil from './reduxUtil';
/*
 * 获取store，沿着$parent.__reduxStore链条往上找
 * @param component
 * @returns {Object}
 */
let getStore = component => (component ? (component.__reduxStore ? component.__reduxStore : getStore(component.$parent)) : null);

/*
 * 生成stateChange函数
 * @param store
 * @returns {Function}
 */
let genStateChangeFn = store => {
    let curState;// 闭包形式保存curState
    return function(){
        let nextState = store.getState();
        if(nextState !== curState){
            curState = nextState;
            // 这里只做传递，不对curState对象做任何转换
            this.$emit('stateChanged', curState);
            // 如果不想自动更新，可以在events[stateChanged]里边控制__updated4redux的逻辑
            !this.__updated4redux && setTimeout(() => {
                let helpMsg = 'Do auto-delay-update...(set this.__updated4redux=true in method "stateChanged" to prevent it!)';
                console.info(`${this.name?(`<${this.name}> `):''}${helpMsg}`);
                this.$update();
                this.__updated4redux = true;
            }, 0);
        }
    };
};

/*
 * 生成dispatch函数
 * @param store
 * @param actionCreators
 * @return function(actionCreatorName, ...args){}
 */
let genDispatchFn = (store, actionCreators) => (actionCreatorName, ...args) => {
    let actionCreator = actionCreators[actionCreatorName] || false;
    let action = actionCreator && actionCreator(...args);
    if(action){
        store.dispatch(action);
    }else{
        let errMsg = !actionCreator ? `Couldn't found a actionCreator named '${actionCreatorName}',check it,plz!\n` : '';
        errMsg += `Couldn't create a valid action from a actionCreator named '${actionCreatorName}',check it,plz!`;
        console.warn(errMsg);
    }
};

/**
 * 通过链接，将展示组件包装成容器组件
 * 这里之所以不传store参数的原因是，store的获取方式设定：
 *   1.Provider的store是通过component的构造函数在new的时候传入的
 *   2.普通Container的store是有Provider获取的，获取方式本例中是通过$parent.__reduxStore，详见getStore函数
 * 而传递actionCreators的原因是，它基本上是不会变化的
 *
 * 与react-redux中的 connect(mapStateToProps,mapDispatchToProps,mergeProps)的异同点在于：
 *   1.都有mapDispatchToProps功能，且参数类似，react-redux穿的是actions，本例中进行细化，传的是actionCreators
 *     当然，你要传actions也是允许的，非function部分会被忽略
 *   2.剩下的 mapStateToProps,mergeProps,其实也是用于初始化，这部分可以在new conpoment的时候构造传参实现，所以本例中不实现了
 *
 * @param actionCreators
 */
let connect = function(actionCreators){
    // console.log('initConnect...');
    // 1.初始化store
    // 检查store：store接受两种方式，一是从构造参数中获取（Provider方式），而是从父组件那里获取（普通Container方式）
    let storeAlias = this.__reduxStoreAlias || 'store';
    let store = this[storeAlias] = this[storeAlias] || getStore(this);
    if(!store){
        let notFoundStoreMsg = 'Redux Container should connect to a store.';
        notFoundStoreMsg += (this.data.isolate ? 'Remove the property name "isolate", and try again!'
            : ('Use tag "<ComponentName />" instead of "new ComponentName({...})" to create a component instance, ' +
            'or use "new ComponentName({store}"(pass "store" param)'));
        throw new Error(notFoundStoreMsg);
    }

    // 2.初始化actions
    if(!actionCreators){
        console.warn('U\'d better pass a param "actionCreators" to component constructor,in order to connect (component,store,actions)');
        actionCreators = {};
    }
    /*
     * 设置this.actions，操作类似于redux中的bindActionCrreators(actionCreators, dispatch);
     * 效果，
     * 1.封装与actionCreators中成员函数同名的函数到this.actions,但是做得事情是直接完整的调用dispatch
     * 2.template中使用this.actions操作，eg：on-click={this.actions.actionCreatorName(...args)}
     *   实现效果类似于react-redux中的this.props.actions,以便展示组件直接在模板中使用
     */
    if(this.actions){
        throw new Error('Invalid param name! "actions" had been reserved for Redux-Container.');
    }else{
        // this.actions = {};
        // Object.keys(actionCreators).forEach(actName => {
        //     if(typeof(actionCreators[actName]) === 'function'){
        //         this.actions[actName] = (...args) => store.dispatch(actionCreators[actName](...args));
        //     }
        // });
        this.actions = rdxUtil.mergeDispatchAndActionCreators(actionCreators, store);
    }
    // console.log("bindActions:", this.actions);
    // 实现action主动派发函数，仅在组件js中常用
    this.$dispatchAction = genDispatchFn(store, actionCreators);

    // 3.完成订阅，并在销毁时候结束订阅
    let changeState = genStateChangeFn(store).bind(this);
    let unSubscribe = store.subscribe(changeState);
    this.$on('$destroy', unSubscribe);
    // changeState();// 默认触发第一次stateChange
};

export default connect;