<template lang="pug">
#app
  app-header
  .container-fluid
    router-view
</template>

<script>
// Import TB styles
require('tb-styles/dist/styles/ui.min.css')
require('tb-styles/dist/scripts/ui.min.js')

export default {
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
