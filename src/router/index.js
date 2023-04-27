import Vue from 'vue'
import VueRouter from 'vue-router'
import execute from "../components/execute";
import manager from "../components/manager";
import Wfd from "../components/Wfd";
import workflowDetail from "../components/workflowDetail";
import elementui from "../components/elementui";
Vue.use(VueRouter)
// 解决vue-router在3.0版本以上重复点报错问题
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}
const routes = [
    // { path: '/', component: Home },
    {
        path: "/detail/:workflowName/:id",
        name: "workflowDetail",
        components: {
            workflowDetail,
        },
        props: true
    },
    {
        path: '/manager',
        name: 'manager',
        components: {
            manager,
        }
    },
    {
        path: '/elementui',
        name: 'elementui',
        components: {
            elementui,
        }
    },
    {
        path: '/arrange',
        name: 'arrange',
        components: {
            Wfd
        },
        props: true
    },
    {
        path: '/execute',
        name: 'execute',
        components: {
            execute,
        }
    },
    // {
    //   path: '/',
    //   name:'app',
    //   components:{
    //     default: App,
    //     editor: Wfd
    //   }
    // },

]

const router = new VueRouter({
    mode: 'history',
    routes
})


export default router