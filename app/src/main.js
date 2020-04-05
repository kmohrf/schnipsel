import Buefy from 'buefy'
import 'buefy/dist/buefy.css'
import Vue from 'vue'
import VueMeta from 'vue-meta'
import { VueMasonryPlugin } from 'vue-masonry';
import { directive as onClickOutside } from 'vue-on-click-outside'
import Swatches from 'vue-swatches'
import 'vue-swatches/dist/vue-swatches.min.css'
import App from './App.vue'
import router from './router'
import Icon from './components/Icon'
import './registerServiceWorker'

Vue.component('Swatches', Swatches)
Vue.directive('on-click-outside', onClickOutside)
Vue.use(Buefy, {
  defaultIconComponent: Icon,
  defaultIconPack: 'feather',
  customIconPacks: {
    feather: {
      sizes: {
        'default': '24',
        'is-small': '20',
        'is-medium': '28',
        'is-large': '32'
      }
    }
  }
})
Vue.use(VueMeta)
Vue.use(VueMasonryPlugin)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
