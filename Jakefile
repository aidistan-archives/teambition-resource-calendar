/* global desc:false, task:false, complete:false */

var _ = require('lodash')
var request = require('superagent')

desc('Delete all test events')
task('delete', {async: true}, function () {
  request
    .get('https://api.teambition.com/api/projects/579b610c44092feb5ee5e6ef/events')
    .query({
      startDate: new Date('2016.08.01'),
      access_token: process.env.ACCESS_TOKEN
    })
    .then((res) => Promise.all(_.map(res.body, (event) => {
      return request
        .delete(`https://api.teambition.com/api/events/${event._id}`)
        .query({ access_token: process.env.ACCESS_TOKEN })
    })))
    .catch((err) => console.log(err.response.body))
    .then(complete)
})

desc('Create test events')
task('create', function () {
  let start = new Date()
  start.setHours(8, 0, 0)
  let end = new Date()
  end.setHours(9, 0, 0)
  request
    .post('https://api.teambition.com/api/events/')
    .query({ access_token: process.env.ACCESS_TOKEN })
    .send({
      _projectId: '579b610c44092feb5ee5e6ef',
      title: '沐浴更衣',
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      tagIds: ['579b643144092feb5ee5f0dc']
    })
    .end()

  start = new Date()
  start.setHours(9, 0, 0)
  end = new Date()
  end.setHours(10, 0, 0)
  request
    .post('https://api.teambition.com/api/events/')
    .query({ access_token: process.env.ACCESS_TOKEN })
    .send({
      _projectId: '579b610c44092feb5ee5e6ef',
      title: '项目会议',
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      tagIds: ['579b640a09e43064077481e8', '579b7b8e44092feb5ee62823']
    })
    .end()

  start = new Date()
  start.setHours(10, 0, 0)
  end = new Date()
  end.setHours(12, 0, 0)
  request
    .post('https://api.teambition.com/api/events/')
    .query({ access_token: process.env.ACCESS_TOKEN })
    .send({
      _projectId: '579b610c44092feb5ee5e6ef',
      title: '自我反省',
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      tagIds: ['579b63ec8c390b9b07a94438']
    })
    .end()

  start = new Date()
  start.setHours(10, 30, 0)
  end = new Date()
  end.setHours(11, 30, 0)
  request
    .post('https://api.teambition.com/api/events/')
    .query({ access_token: process.env.ACCESS_TOKEN })
    .send({
      _projectId: '579b610c44092feb5ee5e6ef',
      title: '冲突日程',
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      tagIds: ['579b63ec8c390b9b07a94438']
    })
    .end()
})
