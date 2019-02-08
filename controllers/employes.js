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

const employesAvailables = async (req, res) => {
  let { skip = 0, distance = 5, unit = 'km', lat, long, intialDate, endDate } = req.query
  intialDate = Math.round(new Date().getTime() / 1000.0)
  endDate = new Date()
  endDate = Math.round(new Date(endDate.setDate(endDate.getDate() + 1)).getTime() / 1000.0)
  let coordinates = { lat: parseFloat(lat), long: parseFloat(long) }
  let employes = await Datasource.professionalsAvailables(parseInt(distance), unit, coordinates, 25, parseInt(skip), intialDate, endDate)
  if (employes.error) return res.status(400).json(employes)
  res.json(employes)
}

module.exports = {
  listEmployes,
  employesAvailables
}
