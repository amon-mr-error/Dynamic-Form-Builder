// aiService.js
const { Mistral } = require('@mistralai/mistralai');
const Response = require('../models/Response');

const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

const model = 'mistral-large-2411';

const chatCompletion = async (messages) => {
  const res = await mistral.chat.complete({
    model,
    messages,
  });
  return res.choices[0].message.content;
};

const generateForm = async (prompt) => {
  try {
    const formPrompt = `You are an expert form builder AI. Based on the following description, create a comprehensive form structure in JSON format.

Description: ${prompt}

Return ONLY a valid JSON object with the following structure:
{
  "title": "Form Title",
  "description": "Form Description",
  "elements": [
    {
      "id": "unique_id",
      "type": "text|textarea|number|email|select|radio|checkbox|date|time|file|rating",
      "label": "Field Label",
      "placeholder": "Placeholder text",
      "validation": {
        "required": true/false,
        "minLength": number,
        "maxLength": number,
        "pattern": "regex pattern"
      },
      "options": [
        { "label": "Option 1", "value": "option1" }
      ]
    }
  ],
  "settings": {
    "submitButtonText": "Submit",
    "successMessage": "Thank you for your submission"
  }
}`;

    const response = await chatCompletion([{ role: 'user', content: formPrompt }]);
    // Remove Markdown code block markers if present
    const cleaned = response.replace(/```json|```/g, '').trim();
    // console.log('AI cleaned response:', cleaned);
    const parsed = JSON.parse(cleaned);

    parsed.elements = parsed.elements.map((el, i) => ({
      ...el,
      id: el.id || `field_${Date.now()}_${i}`,
    }));

    return parsed;
  } catch (error) {
    console.error('Form generation error:', error);
    throw new Error('Failed to generate form');
  }
};


const analyzeResponse = async (response, form) => {
  try {
    const responseData = response.responses.map((r) => {
      const field = form.elements.find((f) => f.id === r.elementId);
      return { field: field?.label || r.elementId, value: r.value };
    });

    const prompt = `Analyze the following form response and provide insights:

Form Title: ${form.title}
Response Data: ${JSON.stringify(responseData)}

Provide analysis in the following JSON format:
{
  "sentiment": "positive|neutral|negative",
  "keywords": ["keyword1", "keyword2"],
  "summary": "Brief summary of the response",
  "flags": ["flag1", "flag2"]
}`;

    const result = await chatCompletion([{ role: 'user', content: prompt }]);
    return JSON.parse(result);
  } catch (error) {
    console.error('Response analysis error:', error);
    return {
      sentiment: 'neutral',
      keywords: [],
      summary: 'Unable to analyze response',
      flags: [],
    };
  }
};

const generateInsights = async (formId) => {
  try {
    const responses = await Response.find({ form: formId }).populate('form', 'title elements').limit(100);

    if (responses.length === 0) {
      return {
        overallTrends: 'No responses available for analysis',
        recommendations: [],
        patterns: [],
        improvementSuggestions: [],
      };
    }

    const form = responses[0].form;
    const summary = {
      totalResponses: responses.length,
      completionRate: responses.filter(r => r.status === 'complete').length / responses.length,
      averageTime: responses.reduce((acc, r) => acc + (r.metadata?.timeSpent || 0), 0) / responses.length,
      topKeywords: [],
    };

    const formInfo = {
      title: form.title,
      elementCount: form.elements.length,
      elementTypes: [...new Set(form.elements.map(el => el.type))],
    };

    const prompt = `Based on the following form responses data, provide actionable insights:

Form Information: ${JSON.stringify(formInfo)}
Response Summary: ${JSON.stringify(summary)}

Provide insights in JSON format:
{
  "overallTrends": "Description of overall trends",
  "recommendations": ["recommendation1", "recommendation2"],
  "patterns": ["pattern1", "pattern2"],
  "improvementSuggestions": ["suggestion1", "suggestion2"]
}`;

    const result = await chatCompletion([{ role: 'user', content: prompt }]);
    return JSON.parse(result);
  } catch (error) {
    console.error('Insight generation error:', error);
    return {
      overallTrends: 'Unable to generate insights at this time',
      recommendations: [],
      patterns: [],
      improvementSuggestions: [],
    };
  }
};

const optimizeForm = async (formId) => {
  try {
    const responses = await Response.find({ form: formId }).populate('form').limit(50);

    if (responses.length < 10) {
      return {
        message: 'Need more responses (at least 10) to provide optimization suggestions',
        suggestions: [],
      };
    }

    const stats = {};
    responses.forEach(res => {
      res.responses.forEach(r => {
        stats[r.elementId] = stats[r.elementId] || { total: 0, filled: 0 };
        stats[r.elementId].total++;
        if (r.value && r.value !== '') stats[r.elementId].filled++;
      });
    });

    const suggestions = Object.entries(stats).map(([id, s]) => {
      const rate = s.filled / s.total;
      if (rate < 0.5) {
        return `Field ${id} has low fill rate (${Math.round(rate * 100)}%). Consider rewording or making it optional.`;
      }
      return null;
    }).filter(Boolean);

    return {
      message: 'Form optimization analysis completed',
      suggestions,
      fieldAnalysis: stats,
    };
  } catch (error) {
    console.error('Form optimization error:', error);
    throw new Error('Failed to optimize form');
  }
};

const suggestValidations = async (elements) => {
  try {
    const suggestions = elements.map(el => {
      const s = [];
      const label = el.label.toLowerCase();

      if (el.type === 'email') s.push('Add email format validation');
      if (el.type === 'text' && label.includes('name')) s.push('Minimum length (2–3 characters)');
      if (el.type === 'text' && label.includes('phone')) s.push('Phone format validation');
      if (el.type === 'textarea') s.push('Character limit for better UX');
      if (el.type === 'number') s.push('Min/Max value constraints');

      return { elementId: el.id, suggestions: s };
    });

    return suggestions.filter(s => s.suggestions.length);
  } catch (error) {
    console.error('Validation suggestion error:', error);
    return [];
  }
};

module.exports = {
  generateForm,
  analyzeResponse,
  generateInsights,
  optimizeForm,
  suggestValidations,
};
