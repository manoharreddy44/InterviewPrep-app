import mongoose from 'mongoose';


const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: true,
  },
  profilePic: {
    type: String,
    default: "",
  },
  resume: {
    type: String,
    default: "",
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;