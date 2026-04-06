import Alert from '../models/Alert.model.js'

// GET /api/alerts  — public, returns only active alerts
export const getAlerts = async (req, res) => {
  const filter = { isActive: true }

  // Optional filter by LGA
  if (req.query.lga) {
    filter.$or = [
      { lga: new RegExp(req.query.lga, 'i') },
      { lga: null },
      { lga: '' },
    ]
  }

  // Optional filter by severity
  if (req.query.severity) {
    filter.severity = req.query.severity
  }

  const alerts = await Alert.find(filter)
    .populate('createdBy', 'name')
    .sort({ severity: 1, createdAt: -1 }) // critical first
    .limit(50)

  // Format timestamps as relative strings for the app
  const formatted = alerts.map((a) => ({
    _id: a._id,
    title: a.title,
    body: a.body,
    lga: a.lga || 'All LGAs',
    severity: a.severity,
    icon: a.icon,
    isActive: a.isActive,
    createdAt: a.createdAt,
    createdBy: a.createdBy?.name || 'Admin',
  }))

  res.status(200).json({ alerts: formatted, total: formatted.length })
}

// GET /api/alerts/:id  — public
export const getAlert = async (req, res) => {
  const alert = await Alert.findById(req.params.id).populate('createdBy', 'name')
  if (!alert) return res.status(404).json({ message: 'Alert not found' })
  res.status(200).json({ alert })
}

// POST /api/alerts  — IT Admin / Dispatcher only (manage_users acts as proxy; use update_incident)
export const createAlert = async (req, res) => {
  const { title, body, lga, severity, icon } = req.body

  if (!title?.trim() || !body?.trim()) {
    return res.status(400).json({ message: 'title and body are required' })
  }

  const alert = await Alert.create({
    title: title.trim(),
    body: body.trim(),
    lga: lga?.trim() || null,
    severity: severity || 'moderate',
    icon: icon || 'warning-outline',
    isActive: true,
    createdBy: req.user._id,
  })

  res.status(201).json({ message: 'Alert created', alert })
}

// PATCH /api/alerts/:id  — update or deactivate
export const updateAlert = async (req, res) => {
  const { title, body, lga, severity, icon, isActive } = req.body

  const update = {}
  if (title !== undefined) update.title = title.trim()
  if (body !== undefined) update.body = body.trim()
  if (lga !== undefined) update.lga = lga?.trim() || null
  if (severity !== undefined) update.severity = severity
  if (icon !== undefined) update.icon = icon
  if (isActive !== undefined) update.isActive = isActive

  const alert = await Alert.findByIdAndUpdate(req.params.id, update, {
    returnDocument: 'after',
    runValidators: true,
  })

  if (!alert) return res.status(404).json({ message: 'Alert not found' })
  res.status(200).json({ message: 'Alert updated', alert })
}

// DELETE /api/alerts/:id
export const deleteAlert = async (req, res) => {
  const alert = await Alert.findByIdAndDelete(req.params.id)
  if (!alert) return res.status(404).json({ message: 'Alert not found' })
  res.status(200).json({ message: 'Alert deleted' })
}
