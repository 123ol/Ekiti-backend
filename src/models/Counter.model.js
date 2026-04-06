import mongoose from 'mongoose'

const CounterSchema = new mongoose.Schema({
  _id: String,
  seq: { type: Number, default: 0 },
})

export default mongoose.model('Counter', CounterSchema)
