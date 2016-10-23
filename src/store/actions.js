import Vue from 'vue'

const name2rgb = {
  red: '#ff5722',
  yellow: '#ffc107',
  green: '#bbc34a',
  blue: '#03a9f4',
  purple: '#ab47bc',
  gray: '#a6a6a6'
}

export const loadEventsAndResources = ({ commit }, { params }) => {
  if (process.env.NODE_ENV === 'production') {
    Vue.http.options.credentials = true
  } else {
    Vue.http.options.params = { access_token: process.env.ACCESS_TOKEN }
  }

  let events = []
  let resources = {}
  let resourceLevels = []

  if (!Vue._.includes(['project', 'organization'], params.type)) {
    commit('UPDATE_STATUS', '【参数错误】未指定类别')
  } else if (params.type === 'project' && !params.id) {
    commit('UPDATE_STATUS', '【参数错误】未指定项目')
  } else if (params.type === 'organization' && !params.id) {
    commit('UPDATE_STATUS', '【参数错误】未指定企业')
  } else {
    (
      params.type === 'project'
      ? loadForProject()
      : loadForOrganization()
    ).then((res) => {
      commit('UPDATE_DATA', prepareData())
      commit('UPDATE_STATUS', '')
    }).catch((err) => {
      commit('UPDATE_STATUS', err.message)
    })
  }

  function loadForProject () {
    return Vue.http({
      url: `https://api.teambition.com/api/projects/${params.id}/tags`,
      method: 'GET'
    }).then((res) => {
      return res.json()
    }).then((tags) => {
      for (let tag of tags) {
        let name = tag.name

        resources[tag._id] = {
          id: tag._id,
          title: tag.name,
          _title: tag.name,
          eventColor: name2rgb[tag.color],
          eventCount: 0
        }

        if (/#[0-9a-f]{6}$/.test(name)) {
          resources[tag._id].title = name.slice(0, -7)
          resources[tag._id].eventColor = name.slice(-7)
        }
      }

      let maxLevel = Vue._.defaultTo(Vue._.max(
        Vue._.map(resources, (resource) => resource.title.split('::').length)
      ), 1)

      resourceLevels = Vue._.map(
        Vue._.range(maxLevel), (i) => Vue._.assign({}, {
          group: i !== 0,
          field: `level_${i}`
        })
      ).reverse()

      for (let id in resources) {
        let columns = resources[id].title.split('::')
        resources[id]['level_0'] = columns.pop()

        Vue._.map(Vue._.range(1, maxLevel), (i) => {
          let col = columns[maxLevel - 1 - i]
          resources[id][`level_${i}`] = col === undefined ? '' : col
        })
      }

      return Vue.http({
        url: `https://api.teambition.com/api/projects/${params.id}/events`,
        method: 'GET'
      }).then((res) => {
        return res.json()
      }).then((tbEvents) => {
        if (tbEvents.length === 0) {
          return Promise.reject('未找到任何未发生的日程，请在项目中新建')
        }

        for (let tbEvent of tbEvents) {
          let event = {
            id: tbEvent._id,
            title: tbEvent.title,
            start: tbEvent.startDate,
            end: tbEvent.endDate,
            url: `https://www.teambition.com/project/${params.id}/events/event/${tbEvent._id}`
          }

          if (Vue._.isEmpty(tbEvent.tagIds)) {
            if (tbEvent.location) {
              ensureResource(tbEvent.location)
              event.resourceId = tbEvent.location
            } else {
              ensureResource('null', { level_0: '其他资源' })
              event.resourceId = 'null'
            }
          } else {
            event.resourceIds = tbEvent.tagIds
          }

          if (event.resourceId) {
            resources[event.resourceId].eventCount += 1
          } else {
            for (let id of event.resourceIds) resources[id].eventCount += 1
          }

          events.push(event)
        }
      })
    })
  }

  function loadForOrganization () {
    resourceLevels = [{ group: false, field: 'level_0' }]

    return Vue.http({
      url: `https://api.teambition.com/api/organizations/${params.id}/projects`,
      method: 'GET' // ,
      // params: {
      //   all: 1
      // }
    }).then((res) => {
      return res.json()
    }).then((projects) => {
      return Promise.all(Vue._.map(
        Vue._.filter(projects, p => p.visibility !== 'project'), (project) => {
          return Vue.http({
            url: `https://api.teambition.com/api/projects/${project._id}/events`,
            method: 'GET'
          }).then((res) => {
            return res.json()
          }).then((tbEvents) => {
            for (let tbEvent of tbEvents) {
              let event = {
                id: tbEvent._id,
                title: tbEvent.title,
                start: tbEvent.startDate,
                end: tbEvent.endDate,
                url: `https://www.teambition.com/project/${project._id}/events/event/${tbEvent._id}`
              }

              if (tbEvent.location) {
                ensureResource(tbEvent.location)
                event.resourceId = tbEvent.location
              } else {
                ensureResource('null', { level_0: '其他资源' })
                event.resourceId = 'null'
              }

              if (event.resourceId) {
                resources[event.resourceId].eventCount += 1
              } else {
                for (let id of event.resourceIds) resources[id].eventCount += 1
              }

              events.push(event)
            }
          })
        }
      ))
    })
  }

  function ensureResource (id, resource) {
    if (resources[id]) return

    resources[id] = Vue._.assign({
      id: id,
      title: id,
      _title: id,
      eventColor: '#a6a6a6',
      eventCount: 0,
      level_0: id
    }, resource)
  }

  function prepareData () {
    let data = {
      events,
      resources: Vue._.pickBy(resources, (r) => r.eventCount > 0),
      resourceLevels
    }

    if (params.type === 'organization' && params.id === '50c32afae8cf1439d35a87e6') {
      return filterByResources(['大会议室', '小会议室', '中心区域'])
    // } else if (params.type === 'project' && params.id === '579b610c44092feb5ee5e6ef') {
    //   return filterByResources(['场地::小黑屋', '设备::投影仪#ff5722'])
    } else {
      return data
    }

    function filterByResources (resourceTitles) {
      let resources = Vue._.pickBy(data.resources, (r) => resourceTitles.indexOf(r._title) > -1)
      let resourceIds = Vue._.map(resources, 'id')

      let events = Vue._.map(data.events, (e) => {
        if (e.resourceId) {
          return resourceIds.indexOf(e.resourceId) > -1 ? e : null
        } else {
          e.resourceIds = Vue._.filter(e.resourceIds, (id) => resourceIds.indexOf(id) > -1)
          return e.resourceIds.length > 0 ? e : null
        }
      })
      events = Vue._.filter(events, (e) => e !== null)

      return { events, resources, resourceLevels: resourceLevels }
    }
  }
}
