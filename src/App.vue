<template lang="pug">
#app.container-fluid
  .row(v-if="$store.state.status")
    h2(style="text-align: center") {{ $store.state.status }}
  .row(v-else)
    app-header
    .col-sm-12
      router-view
</template>

<script>
export default {
  created: function () {
    this.$store.dispatch('loadEventsAndResources', this.$root)
  },
  components: {
    'app-header': require('components/AppHeader')
  }
}
</script>

<style lang="scss">
#app {
  user-select: none;
}
</style>
