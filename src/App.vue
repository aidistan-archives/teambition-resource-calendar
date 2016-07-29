<template lang="pug">
#app
  #calendar(v-if="params.project")
  h2(v-else, style="text-align: center") 未指定项目
</template>

<script>
import qs from 'querystring'

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
        let name

        if (/#[0-9a-f]{6}$/.test(tag.name)) {
          name = tag.name.slice(0, -7)
          this.resources[name] = {
            eventColor: tag.name.slice(-7)
          }
        } else {
          name = tag.name
          this.resources[name] = {
            eventColor: name2rgb[tag.color]
          }
        }

        this.resources[name].id = name
        this.resources[name].title = name
      }

      this.$http({
        url: `https://api.teambition.com/api/projects/${this.params.project}/events`,
        method: 'GET',
        params: {
          access_token: this.access_token
        }
      }).then((res) => {
        for (let event of res.json()) {
          if (this.resources[event.location]) {
            this.events.push({
              id: event._id,
              resourceId: event.location,
              title: event.title,
              start: event.startDate
            })
          }
        }

        $('#calendar').fullCalendar({
          // Appearances
          height: 'auto',
          lang: 'zh-cn',
          timezone: 'local',

          // View options
          defaultView: 'agendaDay',
          minTime: '08:00:00',
          maxTime: '18:00:00',

          // Data
          events: this.events,
          resources: Object.values(this.resources),

          // GPL License
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
