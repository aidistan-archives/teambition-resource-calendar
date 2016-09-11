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
import Vuex from 'vuex'
import Utils from './utils'
import Router from 'vue-router'
import Resource from 'vue-resource'

Vue.use(Vuex)
Vue.use(Utils)
Vue.use(Router)
Vue.use(Resource)

let router = new Router()

router.map({
  '/calendar': {
    name: 'calendar',
    component: require('views/Calendar')
  },
  '/conflicts': {
    name: 'conflicts',
    component: require('views/Conflicts')
  },
  '/statistics': {
    name: 'statistics',
    component: require('views/Statistics')
  }
})

router.redirect({
  '*': '/calendar'
})

router.start(require('./App'), '#app')
