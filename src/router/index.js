import Vue from 'vue'
import VueRouter from 'vue-router'
import execute from "../components/execute";
import manager from "../components/manager";
import Wfd from "../components/Wfd";
import workflowDetail from "../components/workflowDetail";
import elementui from "../components/elementui";
Vue.use(VueRouter)

const routes = [
    // { path: '/', component: Home },
    {
        path: "/detail/:id",
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