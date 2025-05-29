import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: String,
  password: String, // hashed
});

export default mongoose.model('User', userSchema);
