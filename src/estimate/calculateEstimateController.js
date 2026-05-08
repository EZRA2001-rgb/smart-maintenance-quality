const { calculateEstimate } = require('./estimateService');

function calculateEstimateController(req, res) {
  const result = calculateEstimate(req.body || {});

  if (result?.error) {
    return res.status(400).json({ error: result.error });
  }

  return res.json(result);
}

module.exports = {
  calculateEstimateController
};

