import mongoose from 'mongoose'

const RoleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, trim: true },
    permissions: [{ type: String }],
  },
  { timestamps: true }
)

export default mongoose.model('Role', RoleSchema)
