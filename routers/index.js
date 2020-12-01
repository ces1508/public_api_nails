const users = require('./users')
const services = require('./services')
const employes = require('./employes')
const reservations = require('./reservations')
const notifications = require('./notifications')
const decorations = require('./decorations')
const categoriesRouter = require('./categories')
module.exports = {
  users,
  services,
  employes,
  reservations,
  notifications,
  decorations,
  categories: categoriesRouter
}
