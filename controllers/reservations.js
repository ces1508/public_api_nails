const Datasource = require('../database')

const history = async (req, res) => {
  let { skip = 0, state = 'pending' } = req.query
  let userId = req.user.id
  let history = await Datasource.reservationList(userId, state, skip)
  if (history.errors) return res.status(500).json({ error: { code: 'INTERNAL SERVER ERROR' } })
  res.json(history)
}

const create = async (req, res) => {
  let data = req.body
  data.userId = req.user.id
  let employed = await Datasource.validEmployed(data.employedId)
  if (!employed) return res.status(422).json({ error: { message: 'debes enviar un profesional valido' } })
  let servicesIds = data.services.map(service => service.id)
  let services = await Datasource.getServicesByArrayIds(servicesIds)
  services = services.map(service => {
    let cant = data.services.filter(item => item.id === service.id)
    if (cant) return { id: service.id, cant: cant[0].amount }
  })
  let reservation = {
    ...data,
    services,
    date: Math.round(new Date().getTime() / 1000.0),
    state: 'pending'
  }
  let newReservation = await Datasource.reservationCreate(reservation)
  res.status(200).json({ newReservation })
}

const cancelOrder = async (req, res) => {
  let { orderId } = req.params
  let cancel = await Datasource.cancelOrder(orderId)
  if (cancel.error) return res.status(500).json({ error: { code: 'INTERNAL SERVER ERROR' } })
  if (cancel.replaced === 1) return res.json({ status: 'ok' })
  res.status(422).json({ error: { code: 'INTERNAL SERVER ERROR' } })
}

module.exports = {
  history,
  create,
  cancelOrder
}
