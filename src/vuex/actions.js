import Vue from 'vue'

const name2rgb = {
  red: '#ff5722',
  yellow: '#ffc107',
  green: '#bbc34a',
  blue: '#03a9f4',
  purple: '#ab47bc',
  gray: '#a6a6a6'
}

if (process.env.NODE_ENV === 'production') {
  Vue.http.options.credentials = true
} else {
  Vue.http.headers.common['Authorization'] = process.env.ACCESS_TOKEN
}

export function loadEventsAndResources ({ dispatch }, { params }) {
  let events = []
  let resources = {}
  let resourceLevels = []

  if (!Vue._.includes(['project', 'organization'], params.type)) {
    dispatch('UPDATE_STATUS', '【参数错误】未指定类别')
  } else if (params.type === 'project' && !params.id) {
    dispatch('UPDATE_STATUS', '【参数错误】未指定项目')
  } else if (params.type === 'organization' && !params.id) {
    dispatch('UPDATE_STATUS', '【参数错误】未指定企业')
  } else {
    (
      params.type === 'project'
      ? loadForProject()
      : loadForOrganization()
    ).then((res) => {
      dispatch('UPDATE_DATA', prepareData())
      dispatch('UPDATE_STATUS', '')
    }).catch((err) => {
      dispatch('UPDATE_STATUS', err)
    })
  }

  function loadForProject () {
    return Vue.http({
      url: `https://api.teambition.com/api/projects/${params.id}/tags`,
      method: 'GET'
    }).then((res) => {
      for (let tag of res.json()) {
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
        if (res.json().length === 0) {
          return Promise.reject('未找到任何未发生的日程，请在项目中新建')
        }

        for (let event of res.json()) {
          let obj = {
            id: event._id,
            title: event.title,
            start: event.startDate,
            end: event.endDate,
            url: `https://www.teambition.com/project/${params.id}/events/event/${event._id}`
          }

          if (Vue._.isEmpty(event.tagIds)) {
            if (event.location) {
              ensureResource(event.location)
              obj.resourceId = event.location
            } else {
              ensureResource('null', { level_0: '其他资源' })
              obj.resourceId = 'null'
            }
          } else {
            obj.resourceIds = event.tagIds
          }

          if (obj.resourceId) {
            resources[obj.resourceId].eventCount += 1
          } else {
            for (let id of obj.resourceIds) resources[id].eventCount += 1
          }

          events.push(obj)
        }
      })
    })
  }

  function loadForOrganization () {
    resourceLevels = [{ group: false, field: 'level_0' }]

    return Vue.http({
      url: `https://api.teambition.com/api/organizations/${params.id}/projects`,
      method: 'GET',
      params: {
        all: 1
      }
    }).then((res) => {
      return Promise.all(Vue._.map(
        Vue._.filter(res.json(), o => o.visibility !== 'project'), (project) => {
          return Vue.http({
            url: `https://api.teambition.com/api/projects/${project._id}/events`,
            method: 'GET'
          }).then((res) => {
            for (let event of res.json()) {
              let obj = {
                id: event._id,
                title: event.title,
                start: event.startDate,
                end: event.endDate,
                url: `https://www.teambition.com/project/${project._id}/events/event/${event._id}`
              }

              if (event.location) {
                ensureResource(event.location)
                obj.resourceId = event.location
              } else {
                ensureResource('null', { level_0: '其他资源' })
                obj.resourceId = 'null'
              }

              if (obj.resourceId) {
                resources[obj.resourceId].eventCount += 1
              } else {
                for (let id of obj.resourceIds) resources[id].eventCount += 1
              }

              events.push(obj)
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
