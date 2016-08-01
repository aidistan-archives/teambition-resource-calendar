<template lang="pug">
#app
  h2(style="text-align: center") {{ status }}
  #calendar
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
      events: [],
      status: '加载中'
    }
  },
  ready: function () {
    if (!this.params.project) {
      this.status = '未指定项目'
      return
    }

    this.$http({
      url: `https://api.teambition.com/api/projects/${this.params.project}/tags`,
      method: 'GET',
      params: {
        access_token: this.access_token
      }
    }).then((res) => {
      for (let tag of res.json()) {
        let name = tag.name

        this.resources[tag._id] = {
          id: tag._id,
          title: tag.name,
          eventColor: name2rgb[tag.color],
          eventCount: 0
        }

        if (/#[0-9a-f]{6}$/.test(name)) {
          this.resources[tag._id].title = name.slice(0, -7)
          this.resources[tag._id].eventColor = name.slice(-7)
        }
      }

      // 未指定标签的日程
      this.resources['0'] = {
        id: '0',
        title: '其他',
        eventColor: '#a6a6a6',
        eventCount: 0
      }

      let maxLevel = Math.max.apply(
        this, _.map(this.resources, (resource, id) => resource.title.split('::').length)
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
          if (_.isEmpty(event.tagIds)) {
            if (event.location) {
              if (_.isEmpty(this.resources[event.location])) {
                this.resources[event.location] = {
                  id: event.location,
                  title: event.location,
                  eventColor: '#a6a6a6',
                  eventCount: 0,
                  level_0: event.location
                }
              }
              event.tagIds = [event.location]
            } else {
              event.tagIds = ['0']
            }
          }

          this.events.push({
            id: event._id,
            resourceIds: event.tagIds,
            title: event.title,
            start: event.startDate,
            end: event.endDate,
            url: `https://www.teambition.com/project/${this.params.project}/events/event/${event._id}`
          })

          for (let tagId of event.tagIds) this.resources[tagId].eventCount += 1
        }

        if (this.events.length === 0) {
          this.status = '未找到有效的日程'
          return
        } else {
          this.status = ''
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
          resources: _.filter(this.resources, (o) => o.eventCount > 0),

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
