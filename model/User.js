const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
// const uuid = require('uuid'); // Import uuid to generate unique userId

const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true }, // Add userId with uniqueness
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  gender: { type: String, required: true },
  status: { type: String, required: true },
  designation: { type: String, required: true },
  profilePicture: { type: String },
});

// Hash password before saving
// UserSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

module.exports = mongoose.model('User', UserSchema);
