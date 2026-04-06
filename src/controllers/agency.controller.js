import Agency from '../models/Agency.model.js'

// GET /api/agencies
export const getAgencies = async (req, res) => {
  const filter = {}
  if (req.query.status) filter.status = req.query.status
  const agencies = await Agency.find(filter).sort({ name: 1 })
  res.status(200).json({ agencies })
}

// POST /api/agencies
export const createAgency = async (req, res, next) => {
  try {
    const { name, code, description, type } = req.body
    if (!name) return res.status(400).json({ message: 'Agency name is required' })

    const exists = await Agency.findOne({ name: { $regex: `^${name.trim()}$`, $options: 'i' } })
    if (exists) return res.status(400).json({ message: 'An agency with this name already exists' })

    const agency = await Agency.create({ name: name.trim(), code, description, type })
    res.status(201).json({ message: 'Agency created', agency })
  } catch (err) {
    next(err)
  }
}

// PATCH /api/agencies/:id
export const updateAgency = async (req, res, next) => {
  try {
    const { name, code, description, type, status } = req.body
    const agency = await Agency.findById(req.params.id)
    if (!agency) return res.status(404).json({ message: 'Agency not found' })

    if (name)        agency.name        = name.trim()
    if (code !== undefined) agency.code = code?.toUpperCase().trim() || ''
    if (description !== undefined) agency.description = description
    if (type)        agency.type        = type
    if (status)      agency.status      = status

    await agency.save()
    res.status(200).json({ message: 'Agency updated', agency })
  } catch (err) {
    next(err)
  }
}

// DELETE /api/agencies/:id
export const deleteAgency = async (req, res, next) => {
  try {
    const agency = await Agency.findByIdAndDelete(req.params.id)
    if (!agency) return res.status(404).json({ message: 'Agency not found' })
    res.status(200).json({ message: 'Agency deleted' })
  } catch (err) {
    next(err)
  }
}
