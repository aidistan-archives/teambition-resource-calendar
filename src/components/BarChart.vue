<template lang="pug">
.bar-chart
</template>

<script>
import * as d3 from 'd3'

export default {
  data: function () {
    return {
      d: {},
      selection: null
    }
  },
  props: ['name', 'dimension', 'group', 'domain'],
  ready: function () {
    this.$emit('render')
  },
  events: {
    render: function () {
      let self = this

      let margin = { left: 20, right: 20, top: 20, bottom: 20 }
      let width = $(this.$el).width() - margin.left - margin.right
      let height = Math.min(width, $(window).height() / 2) / 2 - margin.top - margin.bottom

      let x = (this.$_.isDate(this.domain[0]) ? d3.scaleTime() : d3.scaleLinear())
        .domain(this.domain)
        .rangeRound([0, width])
      let y = d3.scaleLinear()
        .domain([0, this.group.top(1)[0].value])
        .range([height, 0])
      let axis = d3.axisBottom()
        .scale(x)
      let brush = d3.brushX(x)
        .extent([[0, 0], [width, height]])

      let g = d3.select(this.$el).html('')
        .append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
        .append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
      g.append('clipPath')
          .attr('id', 'clip-' + this.name + '-background')
        .append('rect')
          .attr('width', width)
          .attr('height', height)
      let gClipRect = g
        .append('clipPath')
          .attr('id', 'clip-' + this.name + '-foreground')
        .append('rect')
          .attr('width', width)
          .attr('height', height)
      g.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(axis)
      g.selectAll('.bar')
          .data(['background', 'foreground'])
        .enter().append('path')
          .attr('class', d => d + ' bar')
      g.selectAll('.foreground.bar')
          .attr('clip-path', 'url(#clip-' + this.name + '-foreground)')
      g.selectAll('.background.bar')
          .attr('clip-path', 'url(#clip-' + this.name + '-background)')
      g.append('g')
          .attr('class', 'brush')
          .call(brush)
          .call(brush.move, x.range())

      brush.on('brush', function () {
        let selection = d3.brushSelection(this)
        gClipRect
          .attr('x', selection[0])
          .attr('width', selection[1] - selection[0])
        self.dimension.filterRange([x.invert(selection[0]), x.invert(selection[1])])
        self.$dispatch('refresh')
      })

      brush.on('end', function () {
        let selection = d3.brushSelection(this)
        if (selection === null) {
          gClipRect.attr('x', null).attr('width', '100%')
          self.dimension.filterAll()
          self.$dispatch('refresh')
        }
      })

      this.d.barPath = function (groups) {
        let segments = []
        for (let group of groups) {
          segments.push('M', x(group.key), ',', height, 'V', y(group.value), 'h9v', height)
        }
        return segments.join('')
      }

      this.$emit('refresh')
    },
    refresh: function () {
      d3.select(this.$el).selectAll('.bar')
        .datum(this.group.all())
        .attr('d', this.d.barPath)
    }
  }
}
</script>

<style lang="scss">
.bar-chart {
  .foreground.bar { fill: steelblue; }
  .background.bar { fill: #ccc; }
}
</style>
