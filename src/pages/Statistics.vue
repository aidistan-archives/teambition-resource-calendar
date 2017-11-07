<template lang="pug">
#statistics.container
  h2.text-center 按资源统计
  canvas#statistics-resource
  h2.text-center 按时间统计
    small
      span.icon.icon-leave-state(@click="changeType")
  canvas#statistics-datetime
</template>

<script>
import Chart from 'chart.js'

export default {
  name: 'statistics',
  data () {
    return {
      type: 'date',
      dateMax: this.$m().add(30, 'days'),
      dateMin: this.$m().subtract(30, 'days'),
      selectedResourceIds: []
    }
  },
  computed: {
    events () {
      return this.$_.filter(this.$store.state.events, (event) => {
        return this.$m(event.start) > this.dateMin && this.$m(event.end) < this.dateMax
      })
    },
    resources () { return this.$store.state.resources },
    resourceLevels () { return this.$store.state.resourceLevels },
    resourceDatasets () {
      // Count hours by resources
      let hours = {}
      for (let event of this.events) {
        let duration = (this.$m(event.end) - this.$m(event.start)) / 3600000
        for (let id of (event.resourceIds)) {
          hours[id] = (hours[id] || 0) + duration
        }
      }

      // Count hours for each level
      let datasets = {}
      for (let id in this.resources) {
        let levelNames = []
        for (let level of this.resourceLevels) {
          let name = this.resources[id][level.field]
          levelNames.push(name)
          let fullname = levelNames.join('::')

          if (this.$_.get(datasets, `${level.field}.${fullname}`)) {
            datasets[level.field][fullname].hours += hours[id]
            datasets[level.field][fullname].resourceIds.push(id)
          } else {
            this.$_.set(datasets, `${level.field}.${fullname}`, {
              name,
              fullname,
              hours: hours[id],
              resourceIds: [id],
              category: levelNames[0]
            })
          }
        }
      }

      // Pre-process datasets
      datasets = this.$_.map(datasets, (d) => this.$_.sortBy(d, 'fullname'))
      let categories = this.$_.map(datasets[0], (d) => d.name)
      datasets = this.$_.map(datasets, (dataset, level) => {
        return {
          name: dataset.map((d) => d.name),
          fullname: dataset.map((d) => d.fullname),
          resourceIds: dataset.map((d) => d.resourceIds),

          data: dataset.map((d) => d.hours),
          backgroundColor: dataset.map((d) => this.rgbaValue(
            this.$_.indexOf(categories, d.category) % categories.length, level)),
          borderColor: dataset.map((d) => this.rgbaValue(
            this.$_.indexOf(categories, d.category) % categories.length, 0)),
          borderWidth: 1
        }
      }).reverse()

      return datasets
    },
    dateDatasets () {
      let datasets = {}

      for (let id of this.selectedResourceIds) {
        datasets[id] = {}
        for (let m = this.$m(this.dateMin); m < this.dateMax; m = m.add(1, 'day')) {
          datasets[id][m.format('YYYY-MM-DD')] = 0
        }
      }

      for (let event of this.events) {
        for (let m = this.$m(event.start); m < this.$m(event.end); m.add(5, 'minute')) {
          for (let id of event.resourceIds) {
            if (datasets[id]) datasets[id][m.format('YYYY-MM-DD')] += 1
          }
        }
      }

      return this.$_.map(datasets, (dataset, id) => {
        return {
          label: this.resources[id].title,
          data: this.$_.map(dataset, (count, date) => {
            return { x: date, y: count / 12 }
          }),
          borderColor: this.rgbaValue(this.$_.keys(this.resources).indexOf(id), 0),
          backgroundColor: this.rgbaValue(this.$_.keys(this.resources).indexOf(id), 2)
        }
      })
    },
    timeDatasets () {
      let datasets = {}

      for (let id of this.selectedResourceIds) {
        datasets[id] = {}
        for (let i = 0; i < 24; i += 1) {
          datasets[id][`${i}`] = 0
        }
      }

      for (let event of this.events) {
        for (let m = this.$m(event.start); m < this.$m(event.end); m.add(5, 'minute')) {
          for (let id of event.resourceIds) {
            if (datasets[id]) datasets[id][m.format('h')] += 1
          }
        }
      }

      return this.$_.map(datasets, (dataset, id) => {
        return {
          label: this.resources[id].title,
          data: this.$_.map(dataset, (count, time) => {
            return { x: this.$m().hour(time).format('YYYY-MM-DD HH:mm'), y: count / 12 }
          }),
          borderColor: this.rgbaValue(this.$_.keys(this.resources).indexOf(id), 0),
          backgroundColor: this.rgbaValue(this.$_.keys(this.resources).indexOf(id), 2)
        }
      })
    }
  },
  mounted () {
    this.selectedResourceIds = this.$_.keys(this.resources)
    this.refreshResourceChart()
    this.refreshDatetimeChart()

    this.$store.watch((state) => state.resources, () => {
      this.selectedResourceIds = this.$_.keys(this.resources)
      this.refreshResourceChart()
      this.refreshDatetimeChart()
    })

    this.$watch('selectedResourceIds', this.refreshDatetimeChart)
  },
  methods: {
    changeType () {
      this.type = (this.type === 'date' ? 'time' : 'date')
      this.refreshDatetimeChart()
    },
    rgbaValue (i, j) {
      let values = [
        `rgba(255, 99, 132, ${0.618 ** j})`,
        `rgba(54, 162, 235, ${0.618 ** j})`,
        `rgba(255, 206, 86, ${0.618 ** j})`,
        `rgba(75, 192, 192, ${0.618 ** j})`,
        `rgba(153, 102, 255, ${0.618 ** j})`,
        `rgba(255, 159, 64, ${0.618 ** j})`
      ]

      return values[i % values.length]
    },
    /* eslint-disable no-new */
    refreshResourceChart () {
      new Chart($('#statistics-resource'), {
        type: 'doughnut',
        data: { datasets: this.resourceDatasets },
        options: {
          tooltips: {
            callbacks: {
              label (tooltipItem, data) {
                let name = data.datasets[tooltipItem.datasetIndex].name[tooltipItem.index]
                let hour = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]
                let fullname = data.datasets[tooltipItem.datasetIndex].fullname[tooltipItem.index]
                return `${name === '' ? fullname : name}: ${hour}h`
              }
            }
          },
          onClick: (e, eles) => {
            if (eles[0]) {
              this.selectedResourceIds = this.resourceDatasets[eles[0]._datasetIndex].resourceIds[eles[0]._index]
            } else {
              this.selectedResourceIds = this.$_.keys(this.resources)
            }
          }
        }
      })
    },
    refreshDatetimeChart () {
      if (this.type === 'date') {
        new Chart($('#statistics-datetime'), {
          type: 'line',
          data: { datasets: this.dateDatasets },
          options: {
            scales: {
              xAxes: [{ type: 'time', time: { unit: 'day' } }],
              yAxes: [{ ticks: { stepSize: 1 } }]
            },
            tooltips: { mode: 'x' }
          }
        })
      } else {
        new Chart($('#statistics-datetime'), {
          type: 'line',
          data: { datasets: this.timeDatasets },
          options: {
            scales: {
              xAxes: [{ type: 'time', time: { unit: 'hour' } }],
              yAxes: [{ ticks: { stepSize: 1 } }]
            },
            tooltips: { mode: 'x' }
          }
        })
      }
    }
    /* eslint-enable no-new */
  }
}
</script>

<style lang="scss">
canvas + h2 {
  margin-top: 50px;
}

.icon-leave-state {
  cursor: pointer;
  margin-left: 10px;
}
</style>
