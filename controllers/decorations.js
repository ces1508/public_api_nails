const Datasource = require('../database')

exports.list = async (req, res) => {
  let { page } = req.query
  let skip = 0
  const limit = 20
  if (page > 1) {
    skip = parseInt(page * limit)
  }
  let decorations = await Datasource.listDecorations(skip, limit)
  if (decorations.error) return res.status(500).json({ error: { message: 'estamos presentando problemas, por favor intenta mas tarde' } })
  res.json({ data: decorations })
}
