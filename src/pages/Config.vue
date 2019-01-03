<template lang="pug">
#config.container
  h3 插件配置
  div.alert.alert-success(v-if="found") 已找到当前{{ type }}的专属配置，请前往 <a :href="url" target="_blank">插件配置页</a> 修改
  div.alert.alert-danger(v-else) 未找到当前{{ type }}的专属配置，请前往 <a href="https://www.teambition.com/project/579b610c44092feb5ee5e6ef/tasks/scrum/5c2e235bc755cc0018d0e2e3" target="_blank">插件配置库</a> 创建
</template>

<script>
export default {
  name: 'config',
  computed: {
    found () {
      return this.$store.state.configs._task._id !== undefined
    },
    type () {
      return this.$store.state.params.type === 'project' ? '项目' : '企业'
    },
    url () {
      return 'https://www.teambition.com/task/' + this.$store.state.configs._task._id
    }
  }
}
</script>

<style lang="scss">
#config {
  max-width: 800px;
}
</style>
