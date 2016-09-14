<template lang="pug">
.pie-chart
</template>

<script>
import * as d3 from 'd3'

export default {
  data: function () {
    return {
      d: {},
      g: {},
      unselected: {}
    }
  },
  props: ['dimension', 'group'],
  ready: function () {
    this.$emit('render')
  },
  events: {
    render: function () {
      let width = $(this.$el).width()
      let height = Math.min(width, $(window).height() / 2)
      let radius = Math.min(width, height) / 2

      this.d.arc = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(0)

      this.g.svg = d3.select(this.$el).html('')
        .append('svg')
          .attr('width', width)
          .attr('height', height + 30)
        .append('g')
          .attr('transform', () => 'translate(' + width / 2 + ',' + height / 2 + ')')

      this.g.title = this.g.svg.append('text')
        .attr('transform', 'translate(' + 0 + ',' + radius + ')')
        .attr('dy', '.75em')

      this.$emit('refresh')
    },
    refresh: function () {
      let pie = d3.pie()
        .sort(null)
        .value(d => d.value + 1)

      this.g.svg.selectAll('.arc')
        .data(pie(this.group.all()))
        .enter().append('path')
          .attr('d', this.d.arc)
          .style('fill', d => this.unselected[d.data.key] ? '#e8e8e8' : 'steelblue')
          .on('mouseenter', d => this.g.title.attr('visibility', 'visible').text(d.data.key))
          .on('mouseleave', () => this.g.title.attr('visibility', 'hidden'))
          .on('click', d => {
            this.unselected[d.data.key] = !this.unselected[d.data.key]
            this.dimension.filterFunction(d => !this.unselected[d])
            this.$dispatch('refresh')
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
