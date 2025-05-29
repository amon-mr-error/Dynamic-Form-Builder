const Response = require('../models/Response');
const Form = require('../models/Form');
const aiService = require('../services/aiService');

// @desc    Submit a form response
// @route   POST /api/responses
// @access  Public/Private (depending on form settings)
const submitResponse = async (req, res) => {
  try {
    const { formId, responses, metadata } = req.body;

    // Get form to check if it exists and is published
    const form = await Form.findById(formId);

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    if (form.status !== 'published') {
      return res.status(400).json({ message: 'Form is not currently accepting responses' });
    }

    // Check if form requires login and user is not logged in
    if (form.settings?.access?.requireLogin && !req.user) {
      return res.status(401).json({ message: 'Login required to submit this form' });
    }

    // Check if form has reached max responses
    if (form.settings?.access?.maxResponses) {
      const responseCount = await Response.countDocuments({ form: formId });
      if (responseCount >= form.settings.access.maxResponses) {
        return res.status(400).json({ message: 'This form has reached its maximum number of responses' });
      }
    }

    // Check if form has expired
    if (form.settings?.access?.expirationDate && new Date() > new Date(form.settings.access.expirationDate)) {
      return res.status(400).json({ message: 'This form has expired' });
    }

    // Create response
    const formResponse = await Response.create({
      form: formId,
      respondent: req.user ? req.user._id : null,
      responses,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: {
        ...metadata,
        device: metadata?.device || req.headers['user-agent'],
        browser: metadata?.browser || req.headers['user-agent'],
      },
    });

    // If AI analysis is needed, do it asynchronously after response
    if (form.settings?.enableAiAnalysis) {
      try {
        const aiAnalysis = await aiService.analyzeResponse(formResponse, form);
        formResponse.aiAnalysis = aiAnalysis;
        await formResponse.save();
      } catch (aiError) {
        console.error('AI analysis error:', aiError);
        // Don't fail the submission if AI analysis fails
      }
    }

    res.status(201).json({
      message: form.settings?.successMessage || 'Form submitted successfully',
      responseId: formResponse._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get responses for a form (form owner only)
// @route   GET /api/responses/form/:formId
// @access  Private
const getFormResponses = async (req, res) => {
  try {
    const { formId } = req.params;
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

    // Check if form exists and user is owner
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    if (form.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view these responses' });
    }

    const skip = (page - 1) * limit;

    const responses = await Response.find({ form: formId })
      .populate('respondent', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Response.countDocuments({ form: formId });

    res.json({
      responses,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalResponses: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single response (form owner only)
// @route   GET /api/responses/:id
// @access  Private
const getResponse = async (req, res) => {
  try {
    const response = await Response.findById(req.params.id)
      .populate('form', 'title user')
      .populate('respondent', 'name email');

    if (!response) {
      return res.status(404).json({ message: 'Response not found' });
    }

    // Check if user is form owner
    if (response.form.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this response' });
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a response (form owner only)
// @route   DELETE /api/responses/:id
// @access  Private
const deleteResponse = async (req, res) => {
  try {
    const response = await Response.findById(req.params.id).populate('form', 'user');

    if (!response) {
      return res.status(404).json({ message: 'Response not found' });
    }

    // Check if user is form owner
    if (response.form.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this response' });
    }

    await response.remove();

    res.json({ message: 'Response removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get response analytics for a form
// @route   GET /api/responses/analytics/:formId
// @access  Private
const getResponseAnalytics = async (req, res) => {
  try {
    const { formId } = req.params;

    // Check if form exists and user is owner
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    if (form.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view analytics' });
    }

    // Get basic stats
    const totalResponses = await Response.countDocuments({ form: formId });
    const completeResponses = await Response.countDocuments({ 
      form: formId, 
      status: 'complete' 
    });

    // Get responses over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const responsesOverTime = await Response.aggregate([
      {
        $match: {
          form: form._id,
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    // Get average completion time
    const avgCompletionTime = await Response.aggregate([
      {
        $match: {
          form: form._id,
          'metadata.timeSpent': { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: null,
          avgTime: { $avg: '$metadata.timeSpent' }
        }
      }
    ]);

    // Get device/browser stats
    const deviceStats = await Response.aggregate([
      {
        $match: { form: form._id }
      },
      {
        $group: {
          _id: '$metadata.device',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // AI-powered insights if available
    let aiInsights = null;
    if (totalResponses > 0) {
      try {
        aiInsights = await aiService.generateInsights(formId);
      } catch (aiError) {
        console.error('AI insights error:', aiError);
      }
    }

    res.json({
      totalResponses,
      completeResponses,
      completionRate: totalResponses > 0 ? (completeResponses / totalResponses) * 100 : 0,
      responsesOverTime,
      averageCompletionTime: avgCompletionTime[0]?.avgTime || 0,
      deviceStats,
      aiInsights,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Export responses to CSV
// @route   GET /api/responses/export/:formId
// @access  Private
const exportResponses = async (req, res) => {
  try {
    const { formId } = req.params;

    // Check if form exists and user is owner
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    if (form.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to export responses' });
    }

    const responses = await Response.find({ form: formId })
      .populate('respondent', 'name email')
      .sort('-createdAt');

    // Create CSV data
    const csvData = responses.map(response => {
      const row = {
        'Response ID': response._id,
        'Submitted At': response.createdAt.toISOString(),
        'Respondent Name': response.respondent?.name || 'Anonymous',
        'Respondent Email': response.respondent?.email || 'N/A',
      };

      // Add form field responses
      response.responses.forEach(resp => {
        const element = form.elements.find(el => el.id === resp.elementId);
        const fieldName = element ? element.label : resp.elementId;
        row[fieldName] = Array.isArray(resp.value) ? resp.value.join(', ') : resp.value;
      });

      return row;
    });

    res.json({ csvData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  submitResponse,
  getFormResponses,
  getResponse,
  deleteResponse,
  getResponseAnalytics,
  exportResponses,
};