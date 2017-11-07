<template lang="pug">
#members
</template>

<script>
export default {
  name: 'members',
  mounted () {
    this.refresh()
    this.$store.watch((state) => state.events, this.refresh)
  },
  methods: {
    refresh () {
      $('#members').fullCalendar('destroy')
      $('#members').fullCalendar({
        // Theme options
        themeSystem: 'bootstrap3',

        // Appearance options
        height: 'auto',
        timezone: 'local',
        header: {
          left: 'prev,next today',
          center: 'title',
          right: 'timelineDay,timelineWeek,timelineMonth,timelineYear'
        },
        buttonText: { prev: '<', next: '>', today: '今天', year: '年', month: '月', week: '周', day: '日' },
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
        events: this.$_(this.$store.state.events)
        .cloneDeep().map((e) => {
          e.resourceIds = e.memberIds
          return e
        }),
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
            content: `${event.title} (${event.start.format('H:mm')} - ${event.end.format('H:mm')})`,
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
        resourceColumns: [{ labelText: '', field: 'title' }],
        resources: this.$_.values(this.$store.state.members),

        // License
        schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source'
      })

      if (this.$store.state.params.day) {
        $('#members').fullresources('gotoDate', $.fullCalendar.moment(this.$store.state.params.day))
      }
    }
  }
}
</script>
