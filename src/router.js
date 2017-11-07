import Vue from 'vue'
import Router from 'vue-router'
import Conflicts from '@/pages/Conflicts'
import Members from '@/pages/Members'
import Resources from '@/pages/Resources'
import Statistics from '@/pages/Statistics'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    { path: '*', redirect: '/resources' },
    { path: '/conflicts', name: 'conflicts', component: Conflicts },
    { path: '/members', name: 'members', component: Members },
    { path: '/resources', name: 'resources', component: Resources },
    { path: '/statistics', name: 'statistics', component: Statistics }
  ]
})
