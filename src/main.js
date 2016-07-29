import Vue from 'vue'
import Resource from 'vue-resource'

Vue.use(Resource)

/* eslint-disable no-new */
new Vue({
  el: 'body',
  components: { app: require('./App') }
})
