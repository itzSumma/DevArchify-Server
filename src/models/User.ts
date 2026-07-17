import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  image: { type: String },
  role: { type: String, default: 'user' },
  createdAt: { type: Date, default: Date.now }
});


export const User = mongoose.models.User || mongoose.model('User', UserSchema);