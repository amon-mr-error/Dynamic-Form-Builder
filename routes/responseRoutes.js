const express = require('express');
const {
  submitResponse,
  getFormResponses,
  getResponse,
  deleteResponse,
  getResponseAnalytics,
  exportResponses,
} = require('../controllers/responseController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public route (for form submissions)
router.post('/', submitResponse);

// Protected routes (form owners only)
router.get('/form/:formId', protect, getFormResponses);
router.get('/analytics/:formId', protect, getResponseAnalytics);
router.get('/export/:formId', protect, exportResponses);
router.route('/:id')
  .get(protect, getResponse)
  .delete(protect, deleteResponse);

module.exports = router;