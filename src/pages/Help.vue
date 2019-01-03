<template lang="pug">
#help.container(v-html="content")
</template>

<script>
import { Converter } from 'showdown'

export default {
  name: 'help',
  data () {
    return {
      content: ''
    }
  },
  created () {
    this.$store.dispatch('spinner', true)
    .then(() => this.$api({
      url: `/tasks/5c2e3162246d450018b17e7b`,
      method: 'GET'
    }))
    .then((task) => {
      this.content = new Converter().makeHtml(task.note)
    })
    .then(() => this.$store.dispatch('spinner', false))
  }
}
</script>

<style lang="scss">
#help {
  max-width: 800px;
  font-size: 110%;

  h3 { margin-top: 1em; }
  h4 { font-weight: bold; margin-top: 1em; font-size: 1em; }
}
</style>
