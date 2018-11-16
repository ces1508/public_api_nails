const Datasource = require('../database')
const limit = 25

const allNotifications = async (req, res) => {
  let { page = 1 } = req.query
  let userId = req.user.id
  let skip = parseInt(limit * (page - 1))
  let notifications = await Datasource.getAllNotfications(userId, skip)
  if (notifications.error) return res.status(500).json({ error: { code: 'INTERNAL SERVER ERROR' } })
  res.json(notifications)
}

const singleNotfications = async (req, res) => {
  let noticationId = req.params.id
  let notifcation = await Datasource.getSingleNotifcation(noticationId)
  if (notifcation.userId !== req.user.id) return res.status(413).send('unAuthorizade')
  await Datasource.changeStateNotification(notifcation.id) // set state VIEW = true
  if (notifcation.error) return res.status(500).json({ error: { code: 'INTERNAL SERVER ERROR' } })
  res.json(notifcation)
}

module.exports = {
  allNotifications,
  singleNotfications
}
