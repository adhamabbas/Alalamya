const express = require('express');
const { generateReport } = require('../services/Report');
const router = express.Router();

router.get('/', async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const report = await generateReport(startDate, endDate);
    res.status(200).json({
      status: 'success',
      data: report
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});

module.exports = router;
