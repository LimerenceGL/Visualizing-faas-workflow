import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import '../src/font.css'
import router from "../src/router/index";
import VueCompositionApi from '@vue/composition-api';

Vue.use(VueCompositionApi);
Vue.use(ElementUI);


Vue.config.productionTip = false;
new Vue({
  router,
  render: h => h(App),
  store: setupPinia(),
}).$mount('#app');
