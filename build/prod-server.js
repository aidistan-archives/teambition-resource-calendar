// A simple static server for production use
var express = require('express')
var app = express()

app.use('/', express.static('./dist', { fallthrough: true }))
app.get('*', (req, res) => {
  res.sendFile(require('path').join(__dirname, '../dist/index.html'))
})

console.log('> Starting prod server...')
app.listen(process.env.PORT ||'8080')
