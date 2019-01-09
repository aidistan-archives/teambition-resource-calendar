<template lang="pug">
#config.container
  h3 插件配置
  div.alert.alert-success(v-if="found") 已找到当前{{ type }}的专属配置，请前往 <a :href="url" target="_blank">插件配置任务</a> 修改
  div.alert.alert-danger(v-else) 未找到当前{{ type }}的专属配置，请前往 <a href="https://www.teambition.com/project/579b610c44092feb5ee5e6ef/tasks/scrum/5c2e235bc755cc0018d0e2e3" target="_blank">公共配置分组</a> 创建

  .form-horizontal
    .form-group
      label.col-sm-2.control-label 日期原点
      .col-sm-10
        .form-control {{ startDate }}
        .help-block 忽略该日期之前的所有日程
    .form-group
      label.col-sm-2.control-label 上班时间
      .col-sm-10
        .form-control {{ $store.state.configs.minTime }}
    .form-group
      label.col-sm-2.control-label 下班时间
      .col-sm-10
        .form-control {{ $store.state.configs.maxTime }}
        .help-block 隐藏上班前和下班后的日程
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
    },
    startDate () {
      return this.$m(this.$store.state.configs.startDate).format('YYYY-MM-DD')
    }
  }
}
</script>

<style lang="scss">
#config {
  max-width: 800px;
}
</style>
