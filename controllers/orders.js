const Datasource = require('../database')

const history = async (req, res) => {
  let { skip = 0 } = req.query
  let userId = req.user.id
  let history = await Datasource.historyOrders(userId, skip)
  if (history.errors) return res.status(500).json({ error: { code: 'INTERNAL SERVER ERROR' } })
  res.json(history)
}

const create = async (req, res) => {
  let data = req.body
  data.userId = req.user.id
  let newOrder = await Datasource.createOrder(data)
  if (newOrder.error) return res.status(500).json({ error: { code: 'INTERNAL SERVER ERROR' } })
  if (newOrder.inserted > 0) {
    return res.status(201).json({ status: 'ok' })
  }
  res.status(423).json({ error: { code: 'INTERNAL SERVER ERROR' } })
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
