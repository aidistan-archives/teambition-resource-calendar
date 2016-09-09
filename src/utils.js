import * as sdk from 'tb-apps-sdk'

export default {
  install: function (Vue) {
    Vue._ = require('lodash')
    Vue.tb = sdk

    Object.defineProperties(Vue.prototype, {
      '$_': { value: Vue._ },
      '$tb': { value: Vue.tb }
    })
  }
}
