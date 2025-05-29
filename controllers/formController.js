const Form = require('../models/Form');
const aiService = require('../services/aiService');

// @desc    Create a new form
// @route   POST /api/forms
// @access  Private
const createForm = async (req, res) => {
  try {
    const { title, description, elements, settings, status, aiPrompt } = req.body;

    // Create form
    const form = await Form.create({
      title,
      description,
      user: req.user._id,
      elements: elements || [],
      settings,
      status: status || 'draft',
      aiPrompt,
      aiGenerated: Boolean(aiPrompt),
    });

    res.status(201).json(form);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate form structure using AI
// @route   POST /api/forms/generate
// @access  Private
const generateFormWithAI = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    const generatedForm = await aiService.generateForm(prompt);

    res.json(generatedForm);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all forms for a user
// @route   GET /api/forms
// @access  Private
const getForms = async (req, res) => {
  try {
    const forms = await Form.find({ user: req.user._id })
      .select('title description status createdAt updatedAt')
      .sort({ updatedAt: -1 });

    res.json(forms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single form
// @route   GET /api/forms/:id
// @access  Private/Public (depending on form settings)
const getForm = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Check permissions
    if (!form.settings?.access?.isPublic) {
      // If form is not public, check if user is owner or allowed user
      if (!req.user || 
          (form.user.toString() !== req.user._id.toString() && 
           !form.settings.access.allowedUsers.includes(req.user._id))) {
        return res.status(403).json({ message: 'Not authorized to access this form' });
      }
    }

    res.json(form);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a form
// @route   PUT /api/forms/:id
// @access  Private
const updateForm = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Check ownership
    if (form.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this form' });
    }

    const { title, description, elements, settings, status } = req.body;

    // Update form
    const updatedForm = await Form.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        elements,
        settings,
        status,
      },
      { new: true, runValidators: true }
    );

    res.json(updatedForm);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a form
// @route   DELETE /api/forms/:id
// @access  Private
const deleteForm = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Check ownership
    if (form.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this form' });
    }

    await form.remove();

    res.json({ message: 'Form removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get public forms
// @route   GET /api/forms/public
// @access  Public
const getPublicForms = async (req, res) => {
  try {
    const forms = await Form.find({ 
      'settings.access.isPublic': true,
      'status': 'published'
    })
      .select('title description user createdAt')
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.json(forms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Duplicate a form
// @route   POST /api/forms/:id/duplicate
// @access  Private
const duplicateForm = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Check permissions (owner can duplicate or public forms can be duplicated)
    if (!form.settings.access.isPublic && 
        form.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to duplicate this form' });
    }

    // Create new form with same content
    const newForm = await Form.create({
      title: `Copy of ${form.title}`,
      description: form.description,
      user: req.user._id,
      elements: form.elements,
      settings: form.settings,
      status: 'draft', // Always start as draft
      aiGenerated: form.aiGenerated,
      aiPrompt: form.aiPrompt,
    });

    res.status(201).json(newForm);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createForm,
  generateFormWithAI,
  getForms,
  getForm,
  updateForm,
  deleteForm,
  getPublicForms,
  duplicateForm,
};