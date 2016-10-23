<template lang="pug">
#conflicts
</template>

<script>
import store from '../vuex/store'

export default {
  ready: function () {
    let events = []

    for (let e1 of this.events) {
      for (let e2 of this.events) {
        if (e1.id === e2.id) continue

        let overlaps = this.$_.intersection(
          e1.resourceId ? [e1.resourceId] : e1.resourceIds,
          e2.resourceId ? [e2.resourceId] : e2.resourceIds
        )
        if (overlaps.length === 0) continue

        if (
          $.fullCalendar.moment(e1.start) >= $.fullCalendar.moment(e2.end) ||
          $.fullCalendar.moment(e1.end) <= $.fullCalendar.moment(e2.start)
        ) continue

        let event = this.$_.cloneDeep(e1)
        event.title = event.title + ' (' + this.$_.map(overlaps, (id) => this.resources[id].title).join(', ') + ')'
        events.push(event)
        break
      }
    }

    $('#conflicts').fullCalendar({
      // Appearance options
      height: () => $(document).height() - $('.app-header').height() - 35,
      timezone: 'local',
      header: {
        left: 'prev,next today',
        center: 'title',
        right: 'listDay, listWeek, listMonth, listYear'
      },
      buttonText: { today: '今天', year: '年', month: '月', week: '周', day: '日' },
      firstDay: '1',
      dayNamesShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],

      // View options
      views: {
        listDay: {
          titleFormat: 'YYYY 年 M 月 D 日',
          timeFormat: 'H:mm',
          listDayFormat: 'ddd'
        },
        listWeek: {
          titleFormat: 'YYYY 年 M 月 D 日',
          timeFormat: 'H:mm',
          listDayFormat: 'ddd',
          listDayAltFormat: 'YYYY 年 M 月 D 日'
        },
        listMonth: {
          titleFormat: 'YYYY 年 M 月',
          timeFormat: 'H:mm',
          listDayFormat: 'YYYY 年 M 月 D 日',
          listDayAltFormat: 'ddd'
        },
        listYear: {
          titleFormat: 'YYYY 年',
          timeFormat: 'H:mm',
          listDayFormat: 'YYYY 年 M 月 D 日',
          listDayAltFormat: 'ddd'
        }
      },
      defaultView: 'listWeek',
      noEventsMessage: '没有资源冲突的日程',

      // Events
      events: events,
      eventClick: (event) => {
        this.$tb.callService({
          origin: `${window.location.protocol}//${window.location.host}`,
          method: 'open',
          params: {
            _id: event.id,
            type: 'event'
          }
        })

        return false
      },

      // License
      schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source'
    })

    if (this.$root.params.day) {
      $('#conflicts').fullCalendar('gotoDate', $.fullCalendar.moment(this.$root.params.day))
    }
  },
  store,
  vuex: {
    getters: {
      events: state => state.events,
      resources: state => state.resources,
      resourceLevels: state => state.resourceLevels
    }
  }
}
</script>

<style lang="scss">
</style>
