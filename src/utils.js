import _ from 'lodash'
import * as tb from 'tb-apps-sdk'

export default {
  install (Vue) {
    // Import jQuery
    window.$ = window.jQuery = require('jquery')

    // Import TB styles
    require('tb-styles/dist/styles/ui.min.css')
    require('tb-styles/dist/scripts/ui.min.js')

    // Import fullcalendar-scheduler
    require('fullcalendar/dist/fullcalendar.css')
    require('fullcalendar/dist/fullcalendar.js')
    require('fullcalendar-scheduler/dist/scheduler.css')
    require('fullcalendar-scheduler/dist/scheduler.js')

    Vue._ = _
    Vue.m = $.fullCalendar.moment
    Vue.tb = tb
    Vue.api = (options) => {
      options.url = '/api' + options.url
      if (process.env.NODE_ENV === 'production') {
        Vue.http.options.credentials = true
        options.url = 'https://api.teambition.com' + options.url
      } else {
        options.headers = _.assign(options.headers, {
          Authorization: 'OAuth2 ' + process.env.ACCESS_TOKEN
        })
      }
      return Vue.http(options).then((res) => res.json())
    }

    Object.defineProperties(Vue.prototype, {
      '$_': { value: Vue._ },
      '$m': { value: Vue.m },
      '$tb': { value: Vue.tb },
      '$api': { value: Vue.api }
    })
  }
}
