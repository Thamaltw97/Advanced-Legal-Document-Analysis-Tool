const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/ask', async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  try {
    const response = await axios.post('http://127.0.0.1:5000/api/query', { query: question }, {
      headers: { 'Content-Type': 'application/json' }
    });

    res.json({ answer: response.data.answer });
  } catch (error) {
    console.error('Error querying Python API:', error);
    res.status(500).json({ error: 'Failed to get answer from Python API' });
  }
});

router.post('/askBriefSummary', async (req, res) => {
  const { question } = req.body;

  try {
    const response = await axios.post('http://127.0.0.1:5000/api/query', { query: "Give me a brief summary of 200 words of the given document" }, {
      headers: { 'Content-Type': 'application/json' }
    });

    res.json({ answer: response.data.answer });
  } catch (error) {
    console.error('Error querying Python API:', error);
    res.status(500).json({ error: 'Failed to get answer from Python API' });
  }
});

router.post('/askDetailedSummary', async (req, res) => {
  const { question } = req.body;

  try {
    const response = await axios.post('http://127.0.0.1:5000/api/query', { query: "Give me a detailed summary for each of these questions: Case Information, Parties involved, Legal issues, Facts of the Case, Procedural History, Legal Arguments, Court's Analysis, Decision or Outcome, Implications and Impact, Citations. If any of these has no details give n/a as the detial." }, {
      headers: { 'Content-Type': 'application/json' }
    });

    res.json({ answer: response.data.answer });
  } catch (error) {
    console.error('Error querying Python API:', error);
    res.status(500).json({ error: 'Failed to get answer from Python API' });
  }
});

module.exports = router;
