<template lang="pug">
#members
  #members-calendar
  #members-modal.modal.fade
    .modal-dialog.modal-padding
      .modal-content
        .modal-header
          button.close(type="button", data-dismiss="modal" aria-hidden="true") &times;
          h4.modal-title 按部门筛选
        .modal-body
          member-teams(@select="selectTeam")
</template>

<script>
import MemberTeams from '@/components/MemberTeams'

export default {
  name: 'members',
  data () {
    return {
      teamMembers: null
    }
  },
  mounted () {
    this.refresh()
    this.$store.watch((state) => state.events, this.refresh)
  },
  methods: {
    selectTeam (members) {
      this.teamMembers = members
      this.refresh()
      $('#members-modal').modal('hide')
    },
    refresh () {
      $('#members-calendar').fullCalendar('destroy')
      $('#members-calendar').fullCalendar({
        // Theme options
        themeSystem: 'bootstrap3',

        // Appearance options
        height: 'auto',
        timezone: 'local',
        header: {
          left: 'prev,next today',
          center: 'title',
          right: (this.$_.size(this.$store.state.memberTeams) > 1 ? 'selectTeam ' : '') +
          'timelineDay,timelineWeek,timelineMonth,timelineYear'
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
        resources: this.teamMembers
        ? this.$_.values(this.$store.state.members)
          .filter((member) => this.$_.includes(this.teamMembers, member.id))
        : this.$_.values(this.$store.state.members),

        customButtons: {
          selectTeam: {
            text: '按部门',
            click: () => $('#members-modal').modal()
          }
        },

        // License
        schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source'
      })

      if (this.$store.state.params.day) {
        $('#members-calendar').fullresources('gotoDate', $.fullCalendar.moment(this.$store.state.params.day))
      }
    }
  },
  components: { MemberTeams }
}
</script>
