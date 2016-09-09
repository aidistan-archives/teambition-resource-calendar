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
      resources: this.$_.filter(this.resources, (o) => o.eventCount > 0),

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
