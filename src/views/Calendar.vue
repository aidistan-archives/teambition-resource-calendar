<template lang="pug">
#calendar
</template>

<script>
import store from '../vuex/store'

export default {
  ready: function () {
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
      dayNamesShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],

      // View options
      views: {
        timelineDay: {
          titleFormat: 'YYYY 年 M 月 D 日',
          slotLabelFormat: ['H:mm'],
          eventOverlap: false
        },
        agendaWeek: {
          titleFormat: 'YYYY 年 M 月 D 日',
          columnFormat: 'ddd M/D',
          slotLabelFormat: ['H:mm'],
          timeFormat: 'H:mm',
          allDaySlot: false
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

      // Resources
      resourceColumns: this.resourceLevels,
      resources: this.$_.values(this.resources),

      // License
      schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source'
    })

    if (this.$root.params.day) {
      $('#calendar').fullCalendar('gotoDate', $.fullCalendar.moment(this.$root.params.day))
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
