/**
 * redux provider
 * Created by hzwangfei3 on 2017/4/11.
 */
import connect from './connect';

/*
 * regularJs-mixin
 * 使用方法：
 *  MyProviderCom.use(Provider(actionCreators));
 *  let myProCom = new MyProviderCom({store});
 */
let Provider = actionCreators => Component => {
    Component.implement({
        events: {
            $config(){
                // 1.获取构造传参中的store 和 actionCreators
                if(this.store){
                    /**
                     * 提供并传递store（用一种委婉曲折的方式）
                     *
                     * 设置 __reduxStore 属性，作为根节点，提供Provider的能力（即提供store的能力）
                     * 1.这一步操作至关重要，设置了__reduxStore，以便于子节点通过 $parent.__reduxStore 进行查找store
                     * 2.这一步需要一个配合操作：即在初始化Provider的时候，穿入一个store实例到构造参数中去
                     *
                     * 备注：仅provider才有这个 __reduxStore 属性，所以可以借由此特性，区分provider节点跟普通container节点
                     *      当然，也可以直接通过 __isReduxProvider 属性排直接甄别
                     **/
                    this.__reduxStore = this.store;
                    this.__isReduxProvider = true;
                    // 通过let state = store.getState();得到当前最新的state信息
                    // 如果state是一个fromJS函数(Immutable.fromJS函数)产生的对象，则还需要通过let stateObj = state.toJS();得到当前store上state的js对象版本

                    // 拦截dispatch，做一些调试日志，目前删掉，因为已经有了Redux Chrome devTool，很方便
                    // let originDispatch = this.store.dispatch.bind(this.store);
                    // this.store.dispatch = function(action){
                    //     console.info('★store.dispatch(action)::action=', action);
                    //     originDispatch();
                    // }.bind(this.store);
                }else{
                    throw new Error('U\'d better pass a param "store"(redux-store-object) to create a Provider-Component');
                }

                // 2.检查$parent链条上的store是否是唯一的
                let parentNode = this.$parent;
                while (parentNode) {
                    if (parentNode.__reduxStore) {
                        throw new Error('More than one store in Provider context');
                    }
                    parentNode = parentNode.$parent;
                }

                // 3.最后才是连接上store，并做一些初始化操作
                connect.call(this, actionCreators);
            }
        }
    });
};

export default Provider;
