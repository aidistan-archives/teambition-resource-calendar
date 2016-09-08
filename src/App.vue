<template lang="pug">
#app.container-fluid
  router-view
</template>

<script>
// Import TB styles
require('tb-styles/dist/styles/ui.min.css')
require('tb-styles/dist/scripts/ui.min.js')
</script>

<style lang="scss">
#app {
  user-select: none;
}
</style>
