<template lang="pug">
#app.container-fluid
  .row(v-if="status")
    h2(style="text-align: center") {{ status }}
  .row(v-else)
    app-header
    .col-sm-12
      router-view
</template>

<script>
import qs from 'querystring'
import store from './vuex/store'
import { loadEventsAndResources } from './vuex/actions'

export default {
  data: function () {
    return {
      params: qs.parse(window.location.search.substr(1))
    }
  },
  ready: function () {
    this.loadEventsAndResources(this)
  },
  components: {
    'app-header': require('components/AppHeader')
  },
  store,
  vuex: {
    getters: {
      status: state => state.status
    },
    actions: {
      loadEventsAndResources
    }
  }
}

// Import TB styles
require('tb-styles/dist/styles/ui.min.css')
require('tb-styles/dist/scripts/ui.min.js')
</script>

<style lang="scss">
#app {
  user-select: none;
}
</style>
