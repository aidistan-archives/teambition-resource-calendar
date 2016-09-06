<template lang="pug">
#app
  h2(style="text-align: center") {{ status }}
  #calendar
</template>

<script>
import qs from 'querystring'
import _ from 'lodash'
import * as sdk from 'tb-apps-sdk'

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
      resourceLevels: [],
      events: [],
      status: '加载中...'
    }
  },
  ready: function () {
    if (!_.includes(['project', 'organization'], this.params.type)) {
      this.status = '【参数错误】未指定类别'
    } else if (this.params.type === 'project' && !this.params.id) {
      this.status = '【参数错误】未指定项目'
    } else if (this.params.type === 'organization' && !this.params.id) {
      this.status = '【参数错误】未指定企业'
    } else {
      (
        this.params.type === 'project'
        ? this.loadProjectResources()
        : this.loadOrganizationResources()
      ).then(() => {
        this.renderCalendar()
        this.status = ''
      })
    }
  },
  methods: {
    loadProjectResources: function () {
      return this.$http({
        url: `https://api.teambition.com/api/projects/${this.params.id}/tags`,
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

        let maxLevel = _.defaultTo(_.max(
          _.map(this.resources, (resource) => resource.title.split('::').length)
        ), 1)

        this.resourceLevels = _.map(
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

        return this.$http({
          url: `https://api.teambition.com/api/projects/${this.params.id}/events`,
          method: 'GET',
          params: {
            access_token: this.access_token
          }
        }).then((res) => {
          if (res.json().length === 0) {
            this.status = '未找到任何未发生的日程，请在项目中新建'
            return
          }

          for (let event of res.json()) {
            let obj = {
              id: event._id,
              title: event.title,
              start: event.startDate,
              end: event.endDate,
              url: `https://www.teambition.com/project/${this.params.id}/events/event/${event._id}`
            }

            if (_.isEmpty(event.tagIds)) {
              if (event.location) {
                this.ensureResource(event.location)
                obj.resourceId = event.location
              } else {
                this.ensureResource('null', { level_0: '其他资源' })
                obj.resourceId = 'null'
              }
            } else {
              obj.resourceIds = event.tagIds
            }

            if (obj.resourceId) {
              this.resources[obj.resourceId].eventCount += 1
            } else {
              for (let id of obj.resourceIds) this.resources[id].eventCount += 1
            }

            this.events.push(obj)
          }
        })
      })
    },
    loadOrganizationResources: function () {
      this.resourceLevels = [{ group: false, field: 'level_0' }]

      return this.$http({
        url: `https://api.teambition.com/api/organizations/${this.params.id}/projects`,
        method: 'GET',
        params: {
          all: 1,
          access_token: this.access_token
        }
      }).then((res) => {
        return Promise.all(_.map(
          _.filter(res.json(), o => o.visibility !== 'project'), (project) => {
            return this.$http({
              url: `https://api.teambition.com/api/projects/${project._id}/events`,
              method: 'GET',
              params: {
                access_token: this.access_token
              }
            }).then((res) => {
              for (let event of res.json()) {
                let obj = {
                  id: event._id,
                  title: event.title,
                  start: event.startDate,
                  end: event.endDate,
                  url: `https://www.teambition.com/project/${project._id}/events/event/${event._id}`
                }

                if (event.location) {
                  this.ensureResource(event.location)
                  obj.resourceId = event.location
                } else {
                  this.ensureResource('null', { level_0: '其他资源' })
                  obj.resourceId = 'null'
                }

                if (obj.resourceId) {
                  this.resources[obj.resourceId].eventCount += 1
                } else {
                  for (let id of obj.resourceIds) this.resources[id].eventCount += 1
                }

                this.events.push(obj)
              }
            })
          }
        ))
      })
    },
    ensureResource: function (id, resource) {
      if (this.resources[id]) return

      this.resources[id] = _.assign({
        id: id,
        title: id,
        eventColor: '#a6a6a6',
        eventCount: 0,
        level_0: id
      }, resource)
    },
    renderCalendar: function () {
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
            eventOverlap: false,
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
        eventClick: function (event) {
          sdk.callService({
            origin: `${window.location.protocol}//${window.location.host}`,
            method: 'open',
            params: {
              _id: event.id,
              type: 'event'
            }
          })

          return false
        },

        // Resources
        resourceColumns: this.resourceLevels,
        resources: _.filter(this.resources, (o) => o.eventCount > 0),

        // License
        schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source'
      })

      if (this.params.day) {
        $('#calendar').fullCalendar('gotoDate', $.fullCalendar.moment(this.params.day))
      }
    }
  }
}
</script>

<style lang="scss">
#app {
  user-select: none;
}
</style>
