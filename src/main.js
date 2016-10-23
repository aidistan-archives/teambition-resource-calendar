// Import jQuery
window.$ = window.jQuery = require('jquery')
// Import TB styles
require('tb-styles/dist/styles/ui.min.css')
require('tb-styles/dist/scripts/ui.min.js')
// Import fullcalendar-scheduler
require('fullcalendar-scheduler/node_modules/fullcalendar/dist/fullcalendar.css')
require('fullcalendar-scheduler/dist/scheduler.css')
require('fullcalendar-scheduler/dist/scheduler.js')

import Vue from 'vue'
import Router from 'vue-router'
import Resource from 'vue-resource'
import qs from 'querystring'
import store from './store'
import utils from './utils'

Vue.use(utils)
Vue.use(Router)
Vue.use(Resource)

let router = new Router({
  routes: [
    {
      path: '/calendar',
      name: 'calendar',
      component: require('views/Calendar')
    },
    {
      path: '/conflicts',
      name: 'conflicts',
      component: require('views/Conflicts')
    },
    {
      path: '/statistics',
      name: 'statistics',
      component: require('views/Statistics')
    },
    {
      path: '*',
      redirect: '/calendar'
    }
  ]
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  template: '<App/>',
  data: function () {
    return {
      params: qs.parse(window.location.search.substr(1))
    }
  },
  router: router,
  store,
  components: {
    App: require('./App')
  }
})
