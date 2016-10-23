import Vue from 'vue'
import Vuex from 'vuex'
import * as actions from './actions'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    status: '数据加载中...',
    events: [],
    moments: null,
    resources: {},
    resourceLevels: []
  },
  mutations: {
    UPDATE_DATA (state, data) {
      state.events = data.events
      state.resources = data.resources
      state.resourceLevels = data.resourceLevels
    },
    UPDATE_STATUS (state, status) {
      state.status = status
    }
  },
  actions
})
