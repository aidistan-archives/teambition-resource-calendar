<template lang="pug">
.app-header
  nav.navbar.navbar-default
    ul.nav.navbar-nav
      li(v-for="(name, displayName) in menuItems", :class="{ active: $route.name === name }")
        a(v-link="{ name: name }") {{ displayName }}
</template>

<script>
export default {
  data: function () {
    return {
      menuItems: {
        calendar: '资源日历',
        conflicts: '冲突检测',
        statistics: '利用统计'
      }
    }
  }
}
</script>

<style lang="scss">
.app-header {
  ul.navbar-nav {
    float: none;
    text-align: center;

    & > li {
      float: none;
      display: inline-block;
    }
  }
}
</style>
