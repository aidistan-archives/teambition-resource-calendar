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
