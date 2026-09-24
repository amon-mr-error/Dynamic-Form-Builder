# Dynamic Form Builder (FormCraft)

An intelligent, full-stack dynamic form generation, distribution, and response analytics platform powered by Generative AI (Mistral AI).

---

## 📌 Project Overview

**Dynamic Form Builder** is a modern full-stack application that enables users to design, auto-generate, publish, and analyze complex forms effortlessly. Instead of manually writing custom validation rules and schema definitions, users can simply enter a natural language prompt, and the integrated Mistral AI service constructs full form schemas with dynamic validations, field types, and conditional logic.

This repository is structured as a **single monorepo containing both the backend API and frontend web application**.

---

## 📁 Repository Structure

```plaintext
Dynamic-Form-Builder/
├── backend/                  # Node.js + Express.js REST API with AI Integration
│   ├── config/               # Database and configuration files
│   ├── controllers/          # Route controller handlers (User, Form, Response)
│   ├── middleware/           # JWT Authentication & Error handling middlewares
│   ├── models/               # Mongoose data schemas (User, Form, Response)
│   ├── routes/               # API endpoint definitions
│   ├── services/             # Mistral AI / Langchain integration logic
│   ├── .env.example          # Sample environment variables for backend
│   ├── package.json          # Backend dependencies and scripts
│   └── server.js             # Main server entry point
│
├── frontend/                 # React.js SPA (Web Client)
│   ├── public/               # Static assets & HTML template
│   ├── src/
│   │   ├── components/       # Reusable UI components (FormPreview, etc.)
│   │   ├── pages/            # View pages (Login, Register, Dashboard, GenerateForm, FillForm, Responses)
│   │   ├── utils/            # Helper utilities and form builders
│   │   ├── App.js            # Main application router
│   │   └── index.js          # React entry point
│   ├── .env.example          # Sample environment variables for frontend
│   ├── package.json          # Frontend dependencies and scripts
│   └── tailwind.config.js    # Tailwind CSS configuration
├── .gitignore                # Global git ignore rules (ignores node_modules, .env, etc.)
└── README.md                 # Project documentation
```

---

## 🚀 Tech Stack

### **Backend**
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js (v5)
- **Database:** MongoDB with Mongoose ODM
- **AI & LLM:** Mistral AI (`@mistralai/mistralai`), LangChain (`@langchain/mistralai`, `@langchain/core`)
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs
- **Utilities:** CORS, dotenv, multer

### **Frontend**
- **Framework:** React.js (v19)
- **Styling:** Tailwind CSS & PostCSS
- **Routing:** React Router DOM (v7)
- **Icons:** Lucide React
- **HTTP Client:** Axios

---

## ⚙️ Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or later installed)
- [MongoDB](https://www.mongodb.com/) (Local instance running or MongoDB Atlas connection string)
- [Mistral AI API Key](https://console.mistral.ai/)

---

### 1. Backend Setup

1. Open your terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and fill in your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/dynamic-form-builder
   JWT_SECRET=your_jwt_secret_key_here
   MISTRAL_API_KEY=your_mistral_api_key_here
   ```

4. Start the backend server:
   - For development (with nodemon):
     ```bash
     npm run dev
     ```
   - For production:
     ```bash
     npm start
     ```
   The backend API will run at `http://localhost:5000`.

---

### 2. Frontend Setup

1. Open a new terminal tab and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Ensure the API URL points to your running backend:
   ```env
   REACT_APP_URL=http://localhost:5000
   ```

4. Start the React web application:
   ```bash
   npm start
   ```
   The application will launch automatically in your browser at `http://localhost:3000`.

---

## 🔑 Key Features

- **AI-Powered Form Generation:** Automatically generate rich forms (questions, types, validations, placeholders) from natural language prompts using Mistral AI.
- **Dynamic Form Renderer:** Renders multiple field types on-the-fly (text, email, number, textarea, select dropdowns, checkboxes, radio buttons, file uploads).
- **Form Management & Publishing:** Create, update, duplicate, and publish forms with unique public access URLs.
- **Response Tracking & Analytics:** Real-time collection and tabular viewing of user submissions.
- **Secure Authentication:** User signup and signin workflows protected with JWT tokens and salted password hashing.

---

## 📡 Core API Endpoints

### Authentication (`/api/users`)
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Authenticate user & return JWT token
- `GET /api/users/profile` - Fetch current user profile (Protected)

### Forms (`/api/forms`)
- `POST /api/forms/generate` - Generate form schema using Mistral AI (Protected)
- `POST /api/forms` - Create/save a new form (Protected)
- `GET /api/forms` - Get all forms created by the logged-in user (Protected)
- `GET /api/forms/:id` - Get form details by ID (Public/Protected)
- `PUT /api/forms/:id` - Update form schema (Protected)
- `DELETE /api/forms/:id` - Delete form (Protected)
- `PATCH /api/forms/:id/publish` - Toggle publish status of a form (Protected)

### Responses (`/api/responses`)
- `POST /api/responses/:formId` - Submit a response to a published form (Public)
- `GET /api/responses/form/:formId` - Retrieve all responses for a form (Protected)
- `GET /api/responses/:id` - Retrieve a specific submission by ID (Protected)

---

## 📄 License
This project is licensed under the [ISC License](LICENSE).
