/**
 * redux container
 * Created by hzwangfei3 on 2017/4/11.
 */
import connect from './connect';

/*
 * regularJs-mixin
 * 使用方法：
 *
 *  //
 *  SomeComp.use(Container);
 *
 *  // 需要一个provider，并在其模板中引入子组件
 *  MyProviderCom.use(Provider);
 *  MyProviderCom.component('sub',SomeComp);
 *  let myProCom = new MyProviderCom({store});
 *
 *  父组件的template如下：
 *  <MyProviderCom>
 *      <sub />
 *  </MyProviderCom>
 *
 */
let Container = actionCreators => Component => {
    Component.implement({
        events: {
            $config(){
                // console.log('initContainer...');
                // 连接上store，并做一些初始化操作
                connect.call(this, actionCreators);
            }
        }
    });
};

export default Container