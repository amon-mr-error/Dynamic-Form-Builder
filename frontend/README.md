# Dynamic Form Builder - Frontend Client

This directory contains the React Single Page Application (SPA) for the Dynamic Form Builder platform.

## Overview

The web client provides an intuitive interface for:
- Generating dynamic forms from natural language prompts using Mistral AI.
- Live previewing generated forms with multiple question types (text, email, select, radio, checkbox, etc.).
- Submitting form responses.
- Viewing submitted responses and analytics on the user dashboard.
- User authentication (registration and login).

## Tech Stack

- **Framework:** React 19
- **Routing:** React Router v7
- **Styling:** Tailwind CSS & PostCSS
- **Icons:** Lucide React
- **HTTP Client:** Axios

## Setup & Running

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Set `REACT_APP_URL` to your running backend API (default: `http://localhost:5000`):
   ```env
   REACT_APP_URL=http://localhost:5000
   ```

3. **Start Development Server:**
   ```bash
   npm start
   ```
   The application will be accessible at [http://localhost:3000](http://localhost:3000).

4. **Production Build:**
   ```bash
   npm run build
   ```

## Directory Structure

```
frontend/
├── public/                 # Static assets & index.html
├── src/
│   ├── components/         # Reusable UI components
│   │   └── FormPreview.js  # Dynamic form schema previewer
│   ├── pages/              # Route view pages
│   │   ├── DashboardPage.js
│   │   ├── FillFormPage.js
│   │   ├── FormResponsesPage.js
│   │   ├── GenerateFormPage.js
│   │   ├── LoginPage.js
│   │   └── RegisterPage.js
│   ├── utils/              # Helper utilities
│   │   └── formUtils.js
│   ├── App.js              # Application routes & layout
│   ├── index.js            # React entrypoint
│   └── index.css           # Global Tailwind CSS styles
├── package.json
└── tailwind.config.js
```
