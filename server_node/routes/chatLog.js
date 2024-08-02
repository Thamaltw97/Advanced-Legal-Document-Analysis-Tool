// routes/chatLog.js
const express = require('express');
const router = express.Router();
const ChatLog = require('../models/ChatLog');

router.post('/save', async (req, res) => {
  const { userEmail, title, questionsAndAnswers } = req.body;

  if (!userEmail || !title || !questionsAndAnswers) {
    return res.status(400).json({ msg: 'Please provide all required fields' });
  }

  try {
    const newChatLog = new ChatLog({
      userEmail,
      title,
      questionsAndAnswers,
    });

    const savedChatLog = await newChatLog.save();
    res.json(savedChatLog);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/user/:email', async (req, res) => {
    const { email } = req.params;

    try {
        const chatLogs = await ChatLog.find({ userEmail: email }).sort({ date: -1 });
        res.json(chatLogs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
