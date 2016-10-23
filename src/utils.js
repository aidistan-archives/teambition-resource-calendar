import * as d3 from 'd3'
import * as sdk from 'tb-apps-sdk'

export default {
  install: function (Vue) {
    Vue._ = require('lodash')
    Vue.d3 = d3
    Vue.tb = sdk
    Vue.moment = $.fullCalendar.moment

    Object.defineProperties(Vue.prototype, {
      '$_': { value: Vue._ },
      '$d3': { value: Vue.d3 },
      '$tb': { value: Vue.tb },
      '$moment': { value: Vue.moment }
    })
  }
}
