<template lang="pug">
#app.container-fluid
  app-header
  router-view
  #app-status(v-show="$store.state.status")
    .jumbotron
      h2 {{ $store.state.status }}
      p 请检查插件配置，或联系开发者获取帮助
  #app-spinner(v-show="$store.state.spinner")
    img(src="./assets/loading.gif")
</template>

<script>
import AppHeader from '@/components/AppHeader'

export default {
  name: 'app',
  created () {
    this.$store.dispatch('spinner', true)
    .then(() => this.$store.dispatch('loadEventsAndResources'))
    .then(() => this.$store.dispatch('spinner', false))
  },
  components: {
    AppHeader, Calendar: require('@/pages/Calendar.vue')
  }
}
</script>

<style lang="scss">
#app {
  user-select: none;
}

#app-status,
#app-spinner {
  position: fixed;
  width: 100%;
  height: 100%;

  top: 0;
  left: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  color: #333;
  background-color: #fff;
}
#app-status { z-index: 5; }
#app-spinner { z-index: 10; }
</style>
