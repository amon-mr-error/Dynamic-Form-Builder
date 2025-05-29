const mongoose = require('mongoose');

const FormSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a form title'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    elements: [
      {
        id: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          required: true,
          enum: [
            'text',
            'textarea',
            'number',
            'email',
            'password',
            'select',
            'radio',
            'checkbox',
            'date',
            'time',
            'file',
            'heading',
            'paragraph',
            'divider',
            'rating',
            'signature',
          ],
        },
        label: {
          type: String,
          required: true,
        },
        placeholder: String,
        defaultValue: mongoose.Schema.Types.Mixed,
        validation: {
          required: Boolean,
          min: Number,
          max: Number,
          minLength: Number,
          maxLength: Number,
          pattern: String,
          customValidation: String,
        },
        options: [
          {
            label: String,
            value: String,
          },
        ],
        properties: {
          rows: Number,
          columns: Number,
          multiple: Boolean,
          // Any other element-specific properties
        },
        conditionalLogic: {
          enabled: Boolean,
          conditions: [
            {
              elementId: String,
              operator: String, // equals, not equals, contains, etc.
              value: mongoose.Schema.Types.Mixed,
            },
          ],
          action: String, // show, hide
        },
        // For layout purposes
        gridColumn: {
          start: Number,
          end: Number,
        },
        gridRow: {
          start: Number,
          end: Number,
        },
      },
    ],
    settings: {
      submitButtonText: {
        type: String,
        default: 'Submit',
      },
      successMessage: {
        type: String,
        default: 'Form submitted successfully',
      },
      enableCaptcha: {
        type: Boolean,
        default: false,
      },
      emailNotification: {
        enabled: {
          type: Boolean,
          default: false,
        },
        recipients: [String],
        template: String,
      },
      layout: {
        theme: {
          type: String,
          default: 'default',
        },
        backgroundColor: String,
        fontFamily: String,
        fontSize: String,
      },
      access: {
        isPublic: {
          type: Boolean,
          default: true,
        },
        allowedUsers: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
        ],
        requireLogin: {
          type: Boolean,
          default: false,
        },
        expirationDate: Date,
        maxResponses: Number,
      },
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    aiGenerated: {
      type: Boolean,
      default: false,
    },
    aiPrompt: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Form', FormSchema);