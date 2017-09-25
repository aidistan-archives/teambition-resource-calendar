import Vue from 'vue'
import Router from 'vue-router'
import Calendar from '@/pages/Calendar'
import Conflicts from '@/pages/Conflicts'
import Statistics from '@/pages/Statistics'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    { path: '*', redirect: '/calendar' },
    { path: '/calendar', name: 'calendar', component: Calendar },
    { path: '/conflicts', name: 'conflicts', component: Conflicts },
    { path: '/statistics', name: 'statistics', component: Statistics }
  ]
})
