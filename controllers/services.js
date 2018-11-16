const Datasource = require('../database')
const getServices = async (req, res) => {
  let services = await Datasource.getAllServices()
  if (services.error) return res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR' } })
  res.status(200).json(services)
}

module.exports = {
  getServices
}
