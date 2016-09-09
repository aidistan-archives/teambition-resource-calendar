import Vue from 'vue'

const name2rgb = {
  red: '#ff5722',
  yellow: '#ffc107',
  green: '#bbc34a',
  blue: '#03a9f4',
  purple: '#ab47bc',
  gray: '#a6a6a6'
}

export function loadEventsAndResources ({ dispatch }, app) {
  let events = []
  let resources = {}
  let resourceLevels = []

  if (!Vue._.includes(['project', 'organization'], app.params.type)) {
    dispatch('UPDATE_STATUS', '【参数错误】未指定类别')
  } else if (app.params.type === 'project' && !app.params.id) {
    dispatch('UPDATE_STATUS', '【参数错误】未指定项目')
  } else if (app.params.type === 'organization' && !app.params.id) {
    dispatch('UPDATE_STATUS', '【参数错误】未指定企业')
  } else {
    (
      app.params.type === 'project'
      ? loadForProject()
      : loadForOrganization()
    ).then((res) => {
      dispatch('UPDATE_DATA', { events, resources, resourceLevels })
      dispatch('UPDATE_STATUS', '')
    }).catch((err) => {
      dispatch('UPDATE_STATUS', err)
    })
  }

  function loadForProject () {
    return Vue.http({
      url: `https://api.teambition.com/api/projects/${app.params.id}/tags`,
      method: 'GET',
      params: {
        access_token: app.access_token
      }
    }).then((res) => {
      for (let tag of res.json()) {
        let name = tag.name

        resources[tag._id] = {
          id: tag._id,
          title: tag.name,
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
        url: `https://api.teambition.com/api/projects/${app.params.id}/events`,
        method: 'GET',
        params: {
          access_token: app.access_token
        }
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
            url: `https://www.teambition.com/project/${app.params.id}/events/event/${event._id}`
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
      url: `https://api.teambition.com/api/organizations/${app.params.id}/projects`,
      method: 'GET',
      params: {
        all: 1,
        access_token: app.access_token
      }
    }).then((res) => {
      return Promise.all(Vue._.map(
        Vue._.filter(res.json(), o => o.visibility !== 'project'), (project) => {
          return Vue.http({
            url: `https://api.teambition.com/api/projects/${project._id}/events`,
            method: 'GET',
            params: {
              access_token: app.access_token
            }
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
      eventColor: '#a6a6a6',
      eventCount: 0,
      level_0: id
    }, resource)
  }
}
