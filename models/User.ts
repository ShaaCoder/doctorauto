import mongoose, { Schema, model, models } from 'mongoose';

const userSchema = new Schema({
  name: { type: String },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});

const User = models.User || model('User', userSchema);

export default User;
