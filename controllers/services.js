const Datasource = require('../database')
const getServices = async (req, res) => {
  let services = await Datasource.getAllServicesByCategory(req.params.categoryId)
  if (services.error) return res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR' , message: services.error.message} })
  res.status(200).json(services)
}

module.exports = {
  getServices
}
