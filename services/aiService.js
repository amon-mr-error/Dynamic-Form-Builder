const { ChatMistralAI } = require('@langchain/mistralai');
const { ChatPromptTemplate } = require('@langchain/core/prompts');
const { StringOutputParser } = require('@langchain/core/output_parsers');
const Response = require('../models/Response');

// Initialize Mistral AI
const mistral = new ChatMistralAI({
  apiKey: process.env.MISTRAL_API_KEY,
  modelName: process.env.MISTRAL_MODEL || 'mistral-medium',
  temperature: 0.3,
});

// Prompt templates
const formPrompt = ChatPromptTemplate.fromTemplate(
  `You are an expert form builder AI. Based on the following description, create a comprehensive form structure in JSON format.

Description: {prompt}

Return ONLY a valid JSON object with the following structure:
{{
  "title": "Form Title",
  "description": "Form Description",
  "elements": [
    {{
      "id": "unique_id",
      "type": "text|textarea|number|email|select|radio|checkbox|date|time|file|rating",
      "label": "Field Label",
      "placeholder": "Placeholder text",
      "validation": {{
        "required": true/false,
        "minLength": number,
        "maxLength": number,
        "pattern": "regex pattern"
      }},
      "options": [
        {{ "label": "Option 1", "value": "option1" }}
      ]
    }}
  ],
  "settings": {{
    "submitButtonText": "Submit",
    "successMessage": "Thank you for your submission"
  }}
}}`
);

const analysisPrompt = ChatPromptTemplate.fromTemplate(
  `Analyze the following form response and provide insights:

Form Title: {formTitle}
Response Data: {responseData}

Provide analysis in the following JSON format:
{{
  "sentiment": "positive|neutral|negative",
  "keywords": ["keyword1", "keyword2"],
  "summary": "Brief summary of the response",
  "flags": ["flag1", "flag2"]
}}`
);

const insightsPrompt = ChatPromptTemplate.fromTemplate(
  `Based on the following form responses data, provide actionable insights:

Form Information: {formInfo}
Response Summary: {responseSummary}

Provide insights in JSON format:
{{
  "overallTrends": "Description of overall trends",
  "recommendations": ["recommendation1", "recommendation2"],
  "patterns": ["pattern1", "pattern2"],
  "improvementSuggestions": ["suggestion1", "suggestion2"]
}}`
);

const outputParser = new StringOutputParser();

// ---------- Core Functions -----------

const generateForm = async (prompt) => {
  try {
    const chain = formPrompt.pipe(mistral).pipe(outputParser);
    const result = await chain.invoke({ prompt });
    const parsedResult = JSON.parse(result);

    // Add unique IDs if missing
    parsedResult.elements = parsedResult.elements.map((element, index) => ({
      ...element,
      id: element.id || `field_${Date.now()}_${index}`,
    }));

    return parsedResult;
  } catch (error) {
    console.error('AI form generation error:', error);
    throw new Error('Failed to generate form with AI');
  }
};

const analyzeResponse = async (response, form) => {
  try {
    const responseData = response.responses.map(resp => {
      const element = form.elements.find(el => el.id === resp.elementId);
      return {
        field: element ? element.label : resp.elementId,
        value: resp.value,
      };
    });

    const chain = analysisPrompt.pipe(mistral).pipe(outputParser);
    const result = await chain.invoke({
      formTitle: form.title,
      responseData: JSON.stringify(responseData),
    });

    return JSON.parse(result);
  } catch (error) {
    console.error('AI response analysis error:', error);
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

    const responseSummary = {
      totalResponses: responses.length,
      completionRate: responses.filter(r => r.status === 'complete').length / responses.length,
      averageTime: responses.reduce((acc, r) => acc + (r.metadata?.timeSpent || 0), 0) / responses.length,
      topKeywords: [], // Placeholder
    };

    const formInfo = {
      title: form.title,
      elementCount: form.elements.length,
      elementTypes: [...new Set(form.elements.map(el => el.type))],
    };

    const chain = insightsPrompt.pipe(mistral).pipe(outputParser);
    const result = await chain.invoke({
      formInfo: JSON.stringify(formInfo),
      responseSummary: JSON.stringify(responseSummary),
    });

    return JSON.parse(result);
  } catch (error) {
    console.error('AI insights generation error:', error);
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

    const fieldAnalysis = {};
    responses.forEach(response => {
      response.responses.forEach(resp => {
        if (!fieldAnalysis[resp.elementId]) {
          fieldAnalysis[resp.elementId] = { total: 0, filled: 0, errors: 0 };
        }
        fieldAnalysis[resp.elementId].total++;
        if (resp.value && resp.value !== '') {
          fieldAnalysis[resp.elementId].filled++;
        }
      });
    });

    const suggestions = [];
    Object.entries(fieldAnalysis).forEach(([fieldId, stats]) => {
      const fillRate = stats.filled / stats.total;
      if (fillRate < 0.5) {
        suggestions.push(`Field ${fieldId} has low completion rate (${Math.round(fillRate * 100)}%) - consider making it optional or improving the label`);
      }
    });

    return {
      message: 'Form optimization analysis completed',
      suggestions,
      fieldAnalysis,
    };
  } catch (error) {
    console.error('Form optimization error:', error);
    throw new Error('Failed to optimize form');
  }
};

const suggestValidations = async (elements) => {
  try {
    const validationSuggestions = elements.map(element => {
      const suggestions = [];

      switch (element.type) {
        case 'email':
          suggestions.push('Email format validation is automatically applied');
          break;
        case 'text':
          if (element.label.toLowerCase().includes('name')) {
            suggestions.push('Consider adding minimum length validation (2-3 characters)');
          }
          if (element.label.toLowerCase().includes('phone')) {
            suggestions.push('Consider adding phone number format validation');
          }
          break;
        case 'textarea':
          suggestions.push('Consider adding character limits for better UX');
          break;
        case 'number':
          suggestions.push('Consider adding min/max value constraints');
          break;
        default:
          break;
      }

      return {
        elementId: element.id,
        suggestions,
      };
    });

    return validationSuggestions.filter(item => item.suggestions.length > 0);
  } catch (error) {
    console.error('Validation suggestions error:', error);
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
