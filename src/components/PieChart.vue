<template lang="pug">
.pie-chart
</template>

<script>
export default {
  data () {
    return {
      d: {},
      g: {},
      unselected: {}
    }
  },
  props: ['name', 'dimension', 'group'],
  mounted () {
    let width = $(this.$el).width()
    let height = Math.min(width, $(window).height() / 2)
    let radius = Math.min(width, height) / 2

    this.d.arc = this.$d3.arc()
    .outerRadius(radius - 10)
    .innerRadius(0)

    this.g.svg = this.$d3.select(this.$el).html('')
    .append('svg')
    .attr('width', width)
    .attr('height', height + 30)
    .append('g')
    .attr('transform', () => 'translate(' + width / 2 + ',' + height / 2 + ')')

    this.g.title = this.g.svg.append('text')
    .attr('transform', 'translate(' + 0 + ',' + radius + ')')
    .attr('dy', '.75em')

    this.refresh()
  },
  methods: {
    refresh () {
      let pie = this.$d3.pie().sort(null).value(d => d.value)

      this.g.svg.selectAll('path')
        .data(pie(this.group.all()))
          .attr('d', this.d.arc)
          .style('fill', d => this.unselected[d.data.key] ? '#e8e8e8' : 'steelblue')
        .enter().append('path')
          .attr('d', this.d.arc)
          .style('fill', d => this.unselected[d.data.key] ? '#e8e8e8' : 'steelblue')
          .on('mouseenter', d => this.g.title.attr('visibility', 'visible').text(d.data.key))
          .on('mouseleave', () => this.g.title.attr('visibility', 'hidden'))
          .on('click', d => {
            this.unselected[d.data.key] = !this.unselected[d.data.key]
            this.dimension.filterFunction(d => !this.unselected[d])
            this.$emit('refresh')
          })
    }
  }
}
</script>

<style lang="scss">
.pie-chart {
  text {
    text-anchor: middle;
    font-size: 20px;
  }

  path {
    cursor: pointer;
    stroke: #fff;
  }
}
</style>
