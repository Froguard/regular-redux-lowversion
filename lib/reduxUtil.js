/**
 * diy一个辅util去操作redux相关的东西
 *
 * Created by hzwangfei3 on 2017/4/10.
 */
import Type from 'json-toy/lib/typeOf';
const ACTION_TYPE_REDUX_INIT = '@@redux/INIT';// redux/lib/createStore.js之下的ActionTypes.INIT
const ACTION_TYPE_INIT = '@@INIT';
const initActionTypes = [ACTION_TYPE_REDUX_INIT, ACTION_TYPE_INIT];
//
export default {
    /**
     * diy一个reducers合并器, 返回一个标准意义上的redux的reducer
     *（备注：redux提供的combineReducers，用起来略嫌麻烦，暂时不用，具体后面找到合理的食用姿势，再用吧）
     * @param reducerCons reducer的包装类，其结构为 {ActionTypes:[...],reducer:(state,action)=>{...}}
     * @returns {Function} reducer(state,action){...}
     */
    combineReducers(reducerCons){
        let reducerConKeys = Object.keys(reducerCons);
        // console.log(reducerConKeys);
        return (state, action) => {
            // console.log('> 总reducer开始处理action', action);
            let targetReducerCon = null;
            let k;
            for(let i=0; i<reducerConKeys.length; i++){
                k = reducerConKeys[i];
                let reducerConK = reducerCons[k];
                if(reducerConK){
                    if(Type.isArray(reducerConK.ActionTypes)){
                        // 通过action.type来选择具体需要用来处理的reducer
                        reducerConK.ActionTypes = [...new Set(reducerConK.ActionTypes)];// 去重
                        if(reducerConK.ActionTypes.includes(action.type)){
                            targetReducerCon = reducerConK;
                            // console.log(`  查找到对应的reducer为'${k}',并使用这个reducer开始开始处理`);
                            break;
                        }
                    }else{
                        console.error(`reducerCon对象${k}ActionTypes字段异常，请检查是否为数组对象`);
                    }
                }
            }
            let res;
            if(targetReducerCon && Type.isFunction(targetReducerCon.reducer)){
                res = targetReducerCon.reducer(state, action);
            }else{
                if(targetReducerCon){
                    console.warn(`reducerCon对象${k}的reducer属性异常（非function类型），请检查`);
                }else{
                    !initActionTypes.includes(action.type) && console.warn(`未找到该action对应的的reducer.\n请检查action.type='${action.type}'的action是否有reducer与之对应`);
                }
                res = state;
            }
            return res;
        };
    },

    /**
     * 将actionCreators函数和store.dispatch函数合并，并生成同名属性，挂在到一个对象，并返回这个对象
     * eg:
     * // 合并前：
     *    let action1 = actionCreators.myAct1(...args1); // 先创建action
     *    store.dispatch(action1);                      // 然后再派发
     *    let action2 = actionCreators.myAct2(...args2);
     *    store.dispatch(action2);
     *    let action3 = actionCreators.myAct3(...args3);
     *    store.dispatch(action3);
     *    ...
     * // 合并后：
     *    let actionsDsp =  mergeDispatchAndActionCreators(actionCreators, store); // 只做一次合并
     *    actionsDsp.myAct1(..args1); // 省略繁琐的手动创建action的过程，自动创建action，然后自动调用dispatch派发
     *    actionsDsp.myAct2(..args2);
     *    actionsDsp.myAct3(..args3);
     *    ...
     * @param actionCreators
     * @param store
     * @return {Object}
     */
    mergeDispatchAndActionCreators(actionCreators, store){
        let res = {};
        Object.keys(actionCreators).forEach(actName => {
            if(typeof(actionCreators[actName]) === 'function'){
                res[actName] = (...args) => store.dispatch(actionCreators[actName](...args));
            }
        });
        return res;
    },

    /**
     * 判定obj之下的属性对应的属性值是否唯一
     * 备注：本项目中使用string作为ActionType的值，而非Symbol，所以需要进行重复值检查！
     *      不使用Symbol的原因是序列化问题导致的调试不便问题，比如ReduxDevTool就不支持Symbol类型的ActionType
     * @param actionTypesObj
     * @returns {boolean}
     */
    checkActionTypesUnique(actionTypesObj){
        let res;
        let valArr = Object.keys(actionTypesObj).map(k => actionTypesObj[k]);
        let uniqueValArr = Array.from(new Set(valArr));
        let isUnique = valArr.length === uniqueValArr.length;
        if(isUnique){
            res = { isUnique };
        }else{
            let unqValues = [];
            let repeatValues = [];
            valArr.forEach(v=>{
                if(unqValues.includes(v)){
                    repeatValues.push(v);
                }else{
                    unqValues.push(v);
                }
            });
            res = {isUnique: false, repeatValues};
        }
        return res;
    }
};

