const { calculateEstimate } = require('../src/estimate/estimateService');

function calculateEstimateController(req, res) {
  try {
    const result = calculateEstimate(req.body || {});

    if (result && result.error) {
      return res.status(400).json({ error: result.error });
    }

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}

module.exports = {
  calculateEstimate: calculateEstimateController
};


