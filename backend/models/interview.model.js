import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  interview_type: {
    type: String,
    enum: ['GD', 'HR', 'TECHNICAL'],
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  response: {
    type: String,
    required: false
  },
  score: {
    type: Object,
    default: {},
    required: true
  }
},
{
  timestamps: true
});

const Interview = mongoose.model('Interview', interviewSchema);

export default Interview;
