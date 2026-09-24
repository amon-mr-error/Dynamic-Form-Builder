const express = require('express');
const {
  createForm,
  generateFormWithAI,
  getForms,
  getForm,
  updateForm,
  deleteForm,
  getPublicForms,
  duplicateForm,
} = require('../controllers/formController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/public', getPublicForms);
router.get('/:id', getForm); // This will handle both public and private forms

// Protected routes
router.route('/')
  .get(protect, getForms)
  .post(protect, createForm);

router.post('/generate', protect, generateFormWithAI);
router.post('/:id/duplicate', protect, duplicateForm);

router.route('/:id')
  .put(protect, updateForm)
  .delete(protect, deleteForm);

module.exports = router;