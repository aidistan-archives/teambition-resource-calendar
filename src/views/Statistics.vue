<template lang="pug">
#statistics.row
  .col-sm-6
    #statistics-resources
      h3 按资源
      p(v-if="$loadingRouteData") Loading
      pie-chart(v-else, :dimension.sync="resource", :group.sync="resources")
  .col-sm-6
    #statistics-time
      h3 按时间
      p(v-if="$loadingRouteData") Loading
      bar-chart(v-else, name="date", :dimension.sync="date", :group.sync="dates", :domain="dateDomain")
      p(v-if="$loadingRouteData") Loading
      bar-chart(v-else, name="hour", :dimension.sync="hour", :group.sync="hours", :domain="hourDomain")
</template>

<script>
import * as d3 from 'd3'
import store from '../vuex/store'

export default {
  data: function () {
    return {
      date: null,
      dates: null,
      dateDomain: null,
      hour: null,
      hours: null,
      hourDomain: null,
      resource: null,
      resources: null
    }
  },
  ready: function () {
    this.$broadcast('render')
  },
  route: {
    data: function (transition) {
      let moment = $.fullCalendar.moment
      let moments = []

      for (let event of this.data.events) {
        for (let m = moment(event.start); m < moment(event.end); m = moment(m + 300000)) {
          for (let id of (event.resourceId ? [event.resourceId] : event.resourceIds)) {
            moments.push({
              date: m._d,
              event: event,
              resource: this.data.resources[id]._title
            })
          }
        }
      }

      moments = require('crossfilter')(moments)
      let date = moments.dimension(d => d.date)
      let dates = date.group(d3.timeDay)
      let dateDomain = [moment().add(-30, 'days')._d, moment().add(30, 'days')._d]
      let hour = moments.dimension(d => d.date.getHours() + d.date.getMinutes() / 60)
      let hours = hour.group(Math.floor)
      let hourDomain = [0, 24]
      let resource = moments.dimension(d => d.resource)
      let resources = resource.group()

      transition.next({date, dates, dateDomain, hour, hours, hourDomain, resource, resources})
    }
  },
  events: {
    refresh: function () {
      this.$broadcast('refresh')
    }
  },
  components: {
    'bar-chart': require('components/BarChart'),
    'pie-chart': require('components/PieChart')
  },
  store,
  vuex: {
    getters: {
      data: state => ({ events: state.events, resources: state.resources })
    }
  }
}
</script>

<style lang="scss">
</style>
