import Incident from '../models/Incident.model.js'

// GET /api/reports/summary
export const getSummary = async (req, res) => {
  const [result] = await Incident.aggregate([
    {
      $facet: {
        byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
        byPriority: [{ $group: { _id: '$priority', count: { $sum: 1 } } }],
        total: [{ $count: 'count' }],
      },
    },
  ])

  const statusMap = Object.fromEntries(result.byStatus.map((s) => [s._id, s.count]))
  const priorityMap = Object.fromEntries(result.byPriority.map((p) => [p._id, p.count]))

  res.status(200).json({
    total: result.total[0]?.count || 0,
    pending: statusMap.pending || 0,
    in_progress: statusMap.in_progress || 0,
    resolved: statusMap.resolved || 0,
    byPriority: {
      low: priorityMap.low || 0,
      medium: priorityMap.medium || 0,
      high: priorityMap.high || 0,
      critical: priorityMap.critical || 0,
    },
  })
}

// GET /api/reports/weekly
export const getWeekly = async (req, res) => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const raw = await Incident.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        incidents: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ])

  // Fill in all 7 days (even those with 0 incidents)
  const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const dataMap = Object.fromEntries(raw.map((r) => [r._id, r.incidents]))

  const weekly = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sevenDaysAgo)
    d.setDate(d.getDate() + i + 1)
    const key = d.toISOString().slice(0, 10)
    return { day: DAY_ABBR[d.getDay()], date: key, incidents: dataMap[key] || 0 }
  })

  res.status(200).json({ weekly })
}

// GET /api/reports/by-channel
export const getByChannel = async (req, res) => {
  const raw = await Incident.aggregate([
    { $group: { _id: '$channel', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ])

  const byChannel = raw.map((r) => ({
    channel: r._id.charAt(0).toUpperCase() + r._id.slice(1),
    count: r.count,
  }))

  res.status(200).json({ byChannel })
}

// GET /api/reports/by-agency
export const getByAgency = async (req, res) => {
  const raw = await Incident.aggregate([
    { $match: { agency: { $nin: [null, ''] } } },
    { $group: { _id: '$agency', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ])

  const byAgency = raw.map((r) => ({ agency: r._id, count: r.count }))
  res.status(200).json({ byAgency })
}

// GET /api/reports/by-lga  — used by app analytics screen
export const getByLGA = async (req, res) => {
  const raw = await Incident.aggregate([
    { $match: { lga: { $nin: [null, ''] } } },
    { $group: { _id: '$lga', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ])

  const byLGA = raw.map((r) => ({ name: r._id, count: r.count }))
  res.status(200).json({ byLGA })
}

// GET /api/reports/by-type  — used by app analytics breakdown
export const getByType = async (req, res) => {
  const raw = await Incident.aggregate([
    { $group: { _id: '$type', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ])

  const byType = raw.map((r) => ({
    type: r._id,
    label: r._id.charAt(0).toUpperCase() + r._id.slice(1),
    count: r.count,
  }))

  res.status(200).json({ byType })
}
