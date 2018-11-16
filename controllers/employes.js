const Datasource = require('../database')

const listEmployes = async (req, res) => {
  let { skip = 0 } = req.query
  let employes = null
  if (Object.getOwnPropertyNames(req.query).length > 0) {
    if (req.query.comuna) {
      employes = await Datasource.getEmployes({ comuna: req.query.comuna }, parseInt(skip))
    }
  } else {
    employes = await Datasource.getEmployes({}, parseInt(skip))
  }
  if (employes.error) return res.status(500).json({ errror: { code: 'INTERNAL SERVER ERROR' } })
  res.json(employes)
}

module.exports = {
  listEmployes
}
