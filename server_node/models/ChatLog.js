const mongoose = require('mongoose');

const ChatLogSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  questionsAndAnswers: [
    {
      question: {
        type: String,
        required: true,
      },
      answer: {
        type: String,
        required: true,
      },
    }
  ],
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ChatLog', ChatLogSchema);
