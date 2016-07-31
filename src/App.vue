<template lang="pug">
#app
  #calendar(v-if="params.project")
  h2(v-else, style="text-align: center") 未指定项目
</template>

<script>
import qs from 'querystring'
import _ from 'lodash'

const name2rgb = {
  red: '#ff5722',
  yellow: '#ffc107',
  green: '#bbc34a',
  blue: '#03a9f4',
  purple: '#ab47bc',
  gray: '#a6a6a6'
}

export default {
  data: function () {
    return {
      params: qs.parse(window.location.search.substr(1)),
      resources: {},
      events: []
    }
  },
  ready: function () {
    if (!this.params.project) return

    this.$http({
      url: `https://api.teambition.com/api/projects/${this.params.project}/tags`,
      method: 'GET',
      params: {
        access_token: this.access_token
      }
    }).then((res) => {
      for (let tag of res.json()) {
        let name = tag.name

        this.resources[name] = {
          id: tag._id,
          title: name,
          eventColor: name2rgb[tag.color]
        }

        if (/#[0-9a-f]{6}$/.test(name)) {
          this.resources[name].title = name.slice(0, -7)
          this.resources[name].eventColor = name.slice(-7)
        }
      }

      let maxLevel = Math.max.apply(
        this, _.map(this.resources, (color, name) => name.split('::').length)
      )

      let resourceLevels = _.map(
        _.range(maxLevel), (i) => _.assign({}, {
          group: i !== 0,
          field: `level_${i}`
        })
      ).reverse()

      for (let id in this.resources) {
        let columns = this.resources[id].title.split('::')
        this.resources[id]['level_0'] = columns.pop()

        _.map(_.range(1, maxLevel), (i) => {
          let col = columns[maxLevel - 1 - i]
          this.resources[id][`level_${i}`] = col === undefined ? '' : col
        })
      }

      this.$http({
        url: `https://api.teambition.com/api/projects/${this.params.project}/events`,
        method: 'GET',
        params: {
          access_token: this.access_token
        }
      }).then((res) => {
        for (let event of res.json()) {
          this.events.push({
            id: event._id,
            resourceIds: event.tagIds,
            title: event.title,
            start: event.startDate,
            end: event.endDate,
            url: `https://www.teambition.com/project/${this.params.project}/events/event/${event._id}`
          })
        }

        $('#calendar').fullCalendar({
          // Appearance options
          height: 'auto',
          timezone: 'local',
          header: {
            left: 'prev,next today',
            center: 'title',
            right: 'timelineDay,agendaWeek,month'
          },
          buttonText: { today: '今天', month: '月', week: '周', day: '日' },
          firstDay: '1',
          dayNamesShort: ['日', '一', '二', '三', '四', '五', '六'],

          // View options
          views: {
            timelineDay: {
              titleFormat: 'YYYY 年 M 月 D 日',
              slotLabelFormat: ['H:mm']
            },
            agendaWeek: {
              allDaySlot: false,
              titleFormat: 'YYYY 年 M 月 D 日',
              columnFormat: 'ddd M/D',
              timeFormat: 'H:mm',
              slotLabelFormat: ['H:mm']
            },
            month: {
              titleFormat: 'YYYY 年 M 月',
              timeFormat: 'H:mm'
            }
          },
          defaultView: 'timelineDay',
          minTime: '08:00:00',
          maxTime: '18:00:00',

          // Events
          events: this.events,
          eventOverlap: false,
          eventClick: function (event) {
            if (event.url) {
              window.open(event.url)
              return false
            }
          },

          // Resources
          resourceColumns: resourceLevels,
          resources: Object.values(this.resources),

          // License
          schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source'
        })
      })
    })
  }
}
</script>

<style lang="scss">
#app {
  user-select: none;
}
</style>
