const route = require('express').Router()
const { allNotifications, singleNotfications } = require('../controllers/notifications')
route.get('/', allNotifications)
route.get('/:id', singleNotfications)
route.delete('/:id', (req, res) => res.send('we are working in this enpoind'))
module.exports = route
