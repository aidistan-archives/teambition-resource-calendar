import Vuex from 'vuex'

const state = {
  status: '数据加载中...',
  events: [],
  resources: {},
  resourceLevels: []
}

const mutations = {
  UPDATE_DATA (state, data) {
    state.events = data.events
    state.resources = data.resources
    state.resourceLevels = data.resourceLevels
  },
  UPDATE_STATUS (state, status) {
    state.status = status
  }
}

export default new Vuex.Store({
  state,
  mutations
})
