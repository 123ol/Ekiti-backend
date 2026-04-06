import mongoose from 'mongoose'

const AlertSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    lga: { type: String, trim: true }, // which LGA this alert applies to (null = all)
    severity: {
      type: String,
      enum: ['critical', 'high', 'moderate', 'low'],
      default: 'moderate',
    },
    // Ionicons icon name for the mobile app
    icon: { type: String, default: 'warning-outline' },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

AlertSchema.index({ isActive: 1, severity: 1 })

export default mongoose.model('Alert', AlertSchema)
