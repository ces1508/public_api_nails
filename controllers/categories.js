const Datasource = require('../database')


const getAllCategories = async (req, res) => {
  const categories = await Datasource.getAllCategories()
  res.json({ categories })
}

module.exports = {
  getAllCategories
}
