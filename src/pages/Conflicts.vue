<template lang="pug">
#conflicts
</template>

<script>
export default {
  name: 'conflicts',
  data () {
    return {
      checkMembers: true,
      checkResources: true
    }
  },
  mounted () {
    this.refresh()
    this.$store.watch((state) => state.events, this.refresh)
  },
  methods: {
    refresh () {
      let events = []

      for (let i1 = 0; i1 < this.$store.state.events.length; i1 += 1) {
        let e1 = this.$store.state.events[i1]
        for (let i2 = i1 + 1; i2 < this.$store.state.events.length; i2 += 1) {
          let e2 = this.$store.state.events[i2]

          let overlaps = this.$_.union(
            this.checkResources
            ? this.$_.intersection(e1.resourceIds, e2.resourceIds)
              .map((id) => this.$store.state.resources[id].title)
            : [],
            this.checkMembers
            ? this.$_.intersection(e1.memberIds, e2.memberIds)
              .map((id) => this.$store.state.members[id].title)
            : []
          )
          if (overlaps.length === 0) continue

          if (
            $.fullCalendar.moment(e1.start) >= $.fullCalendar.moment(e2.end) ||
            $.fullCalendar.moment(e1.end) <= $.fullCalendar.moment(e2.start)
          ) continue

          for (let e of [e1, e2]) {
            e = this.$_.cloneDeep(e)
            e.title = e.title + ' (' + overlaps.join(', ') + ')'
            events.push(e)
          }
          break
        }
      }

      $('#conflicts').fullCalendar('destroy')
      $('#conflicts').fullCalendar({
        // Theme options
        themeSystem: 'bootstrap3',

        // Appearance options
        height: () => $(document).height() - $('.app-header').height() - 35,
        timezone: 'local',
        header: {
          left: 'prev,next today',
          center: 'title',
          right: 'checkResources,checkMembers listDay,listWeek,listMonth,listYear'
        },
        buttonText: { prev: '<', next: '>', today: '今天', year: '年', month: '月', week: '周', day: '日' },
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

        // Options
        customButtons: {
          checkMembers: {
            text: '仅人员',
            click: () => {
              this.checkMembers = true
              this.checkResources = false
              this.refresh()
            }
          },
          checkResources: {
            text: '仅资源',
            click: () => {
              this.checkMembers = false
              this.checkResources = true
              this.refresh()
            }
          }
        },

        // License
        schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source'
      })

      if (this.$store.state.params.day) {
        $('#conflicts').fullCalendar('gotoDate', $.fullCalendar.moment(this.$store.state.params.day))
      }
    }
  }
}
</script>
