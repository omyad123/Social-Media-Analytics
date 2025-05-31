import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },

  // Facebook token fields
  facebook_token: {
    type: String,
  },
  facebook_token_expires_at: {
    type: Date,
  },

  // Instagram token fields
  instagram_token: {
    type: String,
  },
  instagram_token_expires_at: {
    type: Date,
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

});

const User = mongoose.model('User', userSchema);

export default User;
