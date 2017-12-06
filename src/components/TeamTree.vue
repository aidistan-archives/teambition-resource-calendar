<template lang="pug">
ul.list-group
  li.list-group-item(v-for="id in orderedTeams", v-show="itemStates[id].shown", @click="select(id)")
    span(:style="{ paddingLeft: teamItems[id].indent + 'em' }") {{ teamItems[id].name }}
    span.caret(v-show="teamItems[id].children.length > 0", :class="{ pulled: itemStates[id].pulled }", @click.stop="togglePulled(id)")
    span.badge {{ teamItems[id].members.length }}
</template>

<script>
export default {
  data () {
    return {
      itemStates: {}
    }
  },
  computed: {
    // Format data in memberTeams
    teamItems () {
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
    // Order all teams by relationships
    orderedTeams () {
      let makeChildrenArray = (id) => {
        let array = []

        this.$_(this.teamItems)
        .filter((team) => team.parent === id)
        .each((team) => array.push(team.id, makeChildrenArray(team.id)))

        return array
      }
      let orderedTeams = this.$_.flattenDeep(makeChildrenArray(null))

      // Initialize item states
      let calculateIndent = (id) => this.teamItems[id].parent ? calculateIndent(this.teamItems[id].parent) + 1.5 : 0
      this.itemStates = this.$_(orderedTeams)
      .map((id) => {
        this.teamItems[id].indent = calculateIndent(id)

        return {
          id,
          pulled: this.teamItems[id].parent === null,
          shown: this.teamItems[id].parent === null ||
            this.teamItems[this.teamItems[id].parent].parent === null
        }
      })
      .keyBy('id').value()

      return orderedTeams
    }
  },
  methods: {
    select (id) {
      this.$emit('select', this.teamItems[id].members)
    },
    togglePulled (id) {
      this.itemStates[id].pulled = !this.itemStates[id].pulled
      this.populateState(id)
    },
    populateState (parent) {
      this.$_.each(this.teamItems[parent].children, (id) => {
        this.itemStates[id].shown = this.itemStates[parent].pulled && this.itemStates[parent].shown
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
  margin-left: 10px;
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
