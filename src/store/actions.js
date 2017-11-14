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
    .then(() => commit('DATA', prepareData()))
    .catch((err) => commit('STATUS', err.message))
  }

  function loadForProject () {
    return Vue.api({
      url: `/v2/projects/${state.params.id}/members`,
      method: 'GET'
    })
    .then((res) => res.json())
    .then((tbMembers) => {
      members = Vue._(tbMembers).keyBy('_userId').mapValues((tbMember) => (
        { id: tbMember._userId, title: tbMember.name, eventCount: 0 }
      )).value()
    })
    .then(() => Vue.api({
      url: `/projects/${state.params.id}/tags`,
      method: 'GET'
    }))
    .then((res) => res.json())
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
    .then((res) => res.json())
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
    .then((res) => res.json())
    .then((tbMembers) => {
      members = Vue._(tbMembers).keyBy('_userId').mapValues((tbMember) => (
        { id: tbMember._userId, title: tbMember.name, eventCount: 0 }
      )).value()
    })
    .then(() => Vue.api({
      url: `/organizations/${state.params.id}/projects/public`,
      method: 'GET'
    }))
    .then((res) => res.json())
    .then((projects) => {
      return Promise.all(Vue._.map(projects, (project) => {
        return Vue.api({
          url: `/projects/${project._id}/events?startDate=${Vue.m().subtract(1, 'year').toISOString()}`,
          method: 'GET'
        })
        .then((res) => res.json())
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

  function prepareData () {
    let data = {
      events,
      members: Vue._.pickBy(members, (m) => m.eventCount > 0),
      resources: Vue._.pickBy(resources, (r) => r.eventCount > 0),
      resourceLevels
    }

    // if (params.type === 'organization' && params.id === '50c32afae8cf1439d35a87e6') {
    //   return filterByResources(['大会议室', '小会议室', '中心区域'])
    // } else if (params.type === 'project' && params.id === '579b610c44092feb5ee5e6ef') {
    //   return filterByResources(['场地::小黑屋', '设备::投影仪#ff5722'])
    // } else {
    return data
    // }

    // function filterByResources (resourceTitles) {
    //   let resources = Vue._.pickBy(data.resources, (r) => resourceTitles.indexOf(r._title) > -1)
    //   let resourceIds = Vue._.map(resources, 'id')
    //
    //   let events = Vue._.map(data.events, (e) => {
    //     if (e.resourceId) {
    //       return resourceIds.indexOf(e.resourceId) > -1 ? e : null
    //     } else {
    //       e.resourceIds = Vue._.filter(e.resourceIds, (id) => resourceIds.indexOf(id) > -1)
    //       return e.resourceIds.length > 0 ? e : null
    //     }
    //   })
    //   events = Vue._.filter(events, (e) => e !== null)
    //
    //   return { events, resources, resourceLevels: resourceLevels }
    // }
  }
}
