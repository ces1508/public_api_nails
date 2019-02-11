const express = require('express')
const bodyParser = require('body-parser')
const helmet = require('helmet')
const morgan = require('morgan')
const fs = require('fs')
const path = require('path')
const rfs = require('rotating-file-stream')
const passport = require('passport')
const { strategy } = require('./utils')
const { users, services, employes, reservations, notifications, decorations } = require('./routers')
const { profile } = require('./controllers/user')
require('dotenv').config()

const PORT = process.env.PORT
const logDirectory = path.join(__dirname, 'log')

fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory) // check if dir log exits, else crate dir in root path
const accessLogStream = rfs('access.log', {
  interval: '1d', // set interval
  path: logDirectory
})

const app = express()
app.use(helmet())
app.use(bodyParser.json())
app.use(morgan('combined', { stream: accessLogStream }))
passport.use(strategy)

app.get('/my', passport.authenticate('jwt', { session: false }), profile)
app.use('/', users)
app.use('/services', passport.authenticate('jwt', { session: false }), services)
app.use('/employes', passport.authenticate('jwt', { session: false }), employes)
app.use('/reservations', passport.authenticate('jwt', { session: false }), reservations)
app.use('/notifications', passport.authenticate('jwt', { session: false }), notifications)
app.use('/decorations', passport.authenticate('jwt', { session: false }), decorations)
app.use('*', (req, res) => {
  res.status(403).send('no puedes acceder campeon')
})

app.listen(PORT, error => {
  if (error) process.exit(1)
  console.log('server running in port ', PORT)
})
