<template lang="pug">
#statistics.row
  .col-sm-6
    #statistics-resources
      h3 按资源
      pie-chart(name="resource", ref="resource", v-on:refresh="refresh",
        :dimension="resource.dimension", :group="resource.group")
  .col-sm-6
    #statistics-time
      h3 按时间
      bar-chart(name="date", ref="date", v-on:refresh="refresh",
        :dimension="date.dimension", :group="date.group", :domain="date.domain")
      bar-chart(name="hour", ref="hour", v-on:refresh="refresh",
        :dimension="hour.dimension", :group="hour.group", :domain="hour.domain")
</template>

<script>
export default {
  data: function () {
    return {
      resource: {},
      date: {},
      hour: {}
    }
  },
  created: function () {
    let moments = []

    for (let event of this.$store.state.events) {
      for (let m = this.$moment(event.start); m < this.$moment(event.end); m = this.$moment(m + 300000)) {
        for (let id of (event.resourceId ? [event.resourceId] : event.resourceIds)) {
          moments.push({
            date: m._d,
            event: event,
            resource: this.$store.state.resources[id]._title
          })
        }
      }
    }

    moments = require('crossfilter')(moments)
    this.resource.dimension = moments.dimension(d => d.resource)
    this.resource.group = this.resource.dimension.group()
    this.date.dimension = moments.dimension(d => d.date)
    this.date.group = this.date.dimension.group(this.$d3.timeDay)
    this.date.domain = [this.$moment().add(-30, 'days')._d, this.$moment().add(30, 'days')._d]
    this.hour.dimension = moments.dimension(d => d.date.getHours() + d.date.getMinutes() / 60)
    this.hour.group = this.hour.dimension.group(Math.floor)
    this.hour.domain = [0, 24]
  },
  methods: {
    refresh: function () {
      this.$refs.resource.refresh()
      this.$refs.date.refresh()
      this.$refs.hour.refresh()
    }
  },
  components: {
    'bar-chart': require('components/BarChart'),
    'pie-chart': require('components/PieChart')
  }
}
</script>

<style lang="scss">
</style>
