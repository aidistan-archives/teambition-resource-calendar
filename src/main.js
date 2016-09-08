import Vue from 'vue'
import Resource from 'vue-resource'

Vue.use(Resource)

/* eslint-disable no-new */
new Vue({
  el: 'body',
  components: { app: require('./App') }
})

// Import TB styles
require('tb-styles/dist/styles/ui.min.css')
require('tb-styles/dist/scripts/ui.min.js')
