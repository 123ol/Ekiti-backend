import Counter from '../models/Counter.model.js'

/**
 * Atomically increments the incident counter and returns
 * a formatted ID like "INC-007".
 */
export const generateIncidentId = async () => {
  const counter = await Counter.findOneAndUpdate(
    { _id: 'incidentId' },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after' }
  )
  return `INC-${String(counter.seq).padStart(3, '0')}`
}
