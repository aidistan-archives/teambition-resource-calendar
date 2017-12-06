<template lang="pug">
ul.list-group
  li.list-group-item(v-for="id in orderedTeams", v-show="states[id].shown", @click="select(id)")
    span(:style="{ marginLeft: states[id].indent + 'em' }")
    button.btn.btn-default.btn-xs(v-show="teams[id].children.length > 0", @click.stop="togglePulled(id)")
      span.caret(:class="{ pulled: states[id].pulled }")
    span(v-show="teams[id].children.length > 0", :style="{ marginLeft: '0.5em' }")
    span {{ teams[id].name }}
    span.badge {{ teams[id].members.length }}
</template>

<script>
export default {
  data () {
    return {
      states: {}
    }
  },
  computed: {
    // Format data
    teams () {
      return this.$_(this.$store.state.memberTeams)
      .map((team) => {
        return {
          id: team._id,
          name: team.name === 'All' ? '全体成员' : team.name,
          members: this.$_.map(team.hasMembers, '_id'),
          parent: team._parentId,
          children: this.$_(this.$store.state.memberTeams).filter((_team) => _team._parentId === team._id).map('_id').value()
        }
      })
      .keyBy('id').value()
    },
    // Order all teams
    orderedTeams () {
      let makeChildrenArray = (id) => {
        let array = []

        this.$_(this.teams)
        .filter((team) => team.parent === id)
        .each((team) => array.push(team.id, makeChildrenArray(team.id)))

        return array
      }
      let orderedTeams = this.$_.flattenDeep(makeChildrenArray(null))

      // Initialize states
      let calculateIndent = (id) => this.teams[id].parent ? calculateIndent(this.teams[id].parent) + 1.5 : 0
      this.states = this.$_(orderedTeams)
      .map((id) => {
        return {
          id,
          indent: calculateIndent(id),
          pulled: this.teams[id].parent === null,
          shown: this.teams[id].parent === null ||
            this.teams[this.teams[id].parent].parent === null
        }
      })
      .keyBy('id').value()

      return orderedTeams
    }
  },
  methods: {
    select (id) {
      this.$emit('select', this.teams[id].members)
    },
    togglePulled (id) {
      this.states[id].pulled = !this.states[id].pulled
      this.populateState(id)
    },
    populateState (parent) {
      this.$_.each(this.teams[parent].children, (id) => {
        this.states[id].shown = this.states[parent].pulled && this.states[parent].shown
        this.populateState(id)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
li {
  cursor: pointer;
}

.caret {
  display: inline-block;
  width: 0;
  height: 0;
  vertical-align: middle;
  border-top: 6px dashed;
  border-top: 6px solid \9;
  border-right: 4px solid transparent;
  border-left: 4px solid transparent;
}

.caret.pulled {
  border-top: 0;
  border-bottom: 6px solid;
  content: "";
}
</style>
