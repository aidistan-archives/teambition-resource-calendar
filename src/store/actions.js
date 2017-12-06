import Vue from 'vue'

const name2rgb = {
  red: '#ff5722',
  yellow: '#ffc137',
  green: '#bbc34a',
  blue: '#03a9f4',
  purple: '#ab47bc',
  gray: '#a6a6a6'
}

export function spinner ({ commit }, ifShow) {
  commit('SPINNER', { ifShow })
}

export function loadEventsAndResources ({ commit, state }) {
  let events = []
  let members = {}
  let memberTeams = {}
  let resources = {}
  let resourceLevels = []

  if (!Vue._.includes(['project', 'organization'], state.params.type)) {
    commit('STATUS', '【参数错误】未指定类别')
  } else if (state.params.type === 'project' && !state.params.id) {
    commit('STATUS', '【参数错误】未指定项目')
  } else if (state.params.type === 'organization' && !state.params.id) {
    commit('STATUS', '【参数错误】未指定企业')
  } else {
    return (state.params.type === 'project' ? loadForProject() : loadForOrganization())
    .then(() => commit('DATA', {
      events,
      members: Vue._.pickBy(members, (m) => m.eventCount > 0),
      memberTeams,
      resources: Vue._.pickBy(resources, (r) => r.eventCount > 0),
      resourceLevels
    }))
    .catch((err) => commit('STATUS', err.message))
  }

  function loadForProject () {
    return Vue.api({
      url: `/v2/projects/${state.params.id}/members`,
      method: 'GET'
    })
    .then((tbMembers) => {
      members = Vue._(tbMembers).keyBy('_userId').mapValues((tbMember) => (
        { id: tbMember._userId, title: tbMember.name, eventCount: 0 }
      )).value()
    })
    .then(() => Vue.api({
      url: `/projects/${state.params.id}/tags`,
      method: 'GET'
    }))
    .then((tags) => {
      for (let tag of tags) {
        let name = tag.name

        ensureResource(tag._id, {
          title: name,
          _title: name,
          eventColor: name2rgb[tag.color]
        })

        if (/#[0-9a-f]{6}$/.test(name)) {
          resources[tag._id].title = name.slice(0, -7)
          resources[tag._id].eventColor = name.slice(-7)
        }
      }
    })
    .then(() => {
      let maxLevel = Vue._(resources)
      .map((resource) => resource.title.split('::').length)
      .max() || 1

      resourceLevels = Vue._(Vue._.range(maxLevel)).map((i) => ({
        group: i !== 0,
        field: `level_${i}`
      }))
      .value().reverse()

      for (let id in resources) {
        let columns = resources[id].title.split('::')
        resources[id]['level_0'] = columns.pop()

        Vue._(Vue._.range(1, maxLevel)).each((i) => {
          let col = columns[maxLevel - 1 - i]
          resources[id][`level_${i}`] = col === undefined ? '' : col
        })
      }
    })
    .then(() => Vue.api({
      url: `/projects/${state.params.id}/events?startDate=${Vue.m().subtract(1, 'year').toISOString()}`,
      method: 'GET'
    }))
    .then((tbEvents) => {
      if (tbEvents.length === 0) {
        return Promise.reject(new Error('未找到任何日程，请在项目中新建'))
      }

      for (let tbEvent of tbEvents) {
        let event = {
          id: tbEvent._id,
          title: tbEvent.title,
          start: tbEvent.startDate,
          end: tbEvent.endDate,
          memberIds: Vue._.intersection(tbEvent.involveMembers, Vue._.keys(members)),
          url: `https://www.teambition.com/project/${state.params.id}/events/event/${tbEvent._id}`
        }

        if (Vue._.isEmpty(tbEvent.tagIds)) {
          if (tbEvent.location) {
            ensureResource(tbEvent.location)
            event.resourceIds = [tbEvent.location]
          } else {
            ensureResource('null', { title: '其他资源', level_0: '其他资源' })
            event.resourceIds = ['null']
          }
        } else {
          event.resourceIds = tbEvent.tagIds
        }

        for (let id of event.memberIds) members[id].eventCount += 1
        for (let id of event.resourceIds) resources[id].eventCount += 1

        events.push(event)
      }
    })
  }

  function loadForOrganization () {
    resourceLevels = [{ group: false, field: 'level_0' }]

    return Vue.api({
      url: `/v2/organizations/${state.params.id}/members`,
      method: 'GET'
    })
    .then((tbMembers) => {
      members = Vue._(tbMembers).keyBy('_userId').mapValues((tbMember) => (
        { id: tbMember._userId, title: tbMember.name, eventCount: 0 }
      )).value()
    })
    .then(() => Vue.api({
      url: `/organizations/${state.params.id}/teams`,
      method: 'GET'
    }))
    .then((tbTeams) => { memberTeams = Vue._.keyBy(tbTeams, '_id') })
    .then(() => Vue.api({
      url: `/organizations/${state.params.id}/projects/public`,
      method: 'GET'
    }))
    .then((tbProjects) => {
      return Promise.all(Vue._.map(tbProjects, (project) => {
        return Vue.api({
          url: `/projects/${project._id}/events?startDate=${Vue.m().subtract(1, 'year').toISOString()}`,
          method: 'GET'
        })
        .then((tbEvents) => {
          for (let tbEvent of tbEvents) {
            let event = {
              id: tbEvent._id,
              title: tbEvent.title,
              start: tbEvent.startDate,
              end: tbEvent.endDate,
              memberIds: Vue._.intersection(tbEvent.involveMembers, Vue._.keys(members)),
              url: `https://www.teambition.com/project/${project._id}/events/event/${tbEvent._id}`
            }

            if (tbEvent.location) {
              ensureResource(tbEvent.location)
              event.resourceIds = [tbEvent.location]
            } else {
              ensureResource('null', { title: '其他资源', level_0: '其他资源' })
              event.resourceIds = ['null']
            }

            for (let id of event.memberIds) members[id].eventCount += 1
            for (let id of event.resourceIds) resources[id].eventCount += 1

            events.push(event)
          }
        })
      }))
    })
  }

  function ensureResource (id, resource) {
    if (resources[id]) return

    resources[id] = Vue._.assign({
      id: id,
      title: id,
      _title: id,
      eventColor: name2rgb.gray,
      eventTextColor: '#333',
      eventCount: 0,
      level_0: id
    }, resource)
  }
}
