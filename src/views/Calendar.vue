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
        right: 'timelineDay, timelineWeek, timelineMonth, timelineYear'
      },
      buttonText: { today: '今天', year: '年', month: '月', week: '周', day: '日' },
      firstDay: '1',
      dayNamesShort: ['日', '一', '二', '三', '四', '五', '六'],

      // View options
      views: {
        timelineDay: {
          titleFormat: 'YYYY 年 M 月 D 日',
          slotLabelFormat: ['H:mm']
        },
        timelineWeek: {
          titleFormat: 'YYYY 年 M 月 D 日',
          slotLabelFormat: ['M/D ddd', 'H:mm']
        },
        timelineMonth: {
          titleFormat: 'YYYY 年 M 月',
          slotLabelFormat: 'D ddd'
        },
        timelineYear: {
          titleFormat: 'YYYY 年',
          slotLabelFormat: ['M 月', 'D ddd']
        }
      },
      defaultView: 'timelineDay',
      minTime: '08:00:00',
      maxTime: '18:00:00',
      timeFormat: 'H:mm',
      eventOverlap: false,

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
      eventMouseover: (event, jsEvent, view) => {
        $(jsEvent.currentTarget).popover({
          container: 'body',
          content: `${event.title} (${event.start.format('h:mm')} - ${event.end.format('h:mm')})`,
          delay: { 'show': 500, 'hide': 100 },
          placement: 'bottom',
          trigger: 'manual'
        })

        $(jsEvent.currentTarget).popover('show')
      },
      eventMouseout: (event, jsEvent, view) => {
        $(jsEvent.currentTarget).popover('hide')
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
