# Dynamic Form Builder - Backend API

This repository contains the backend API service for the Dynamic Form Builder, an AI-powered form generation and management platform. The backend is built using Node.js, Express, MongoDB, and integrates with Mistral AI via Langchain for dynamic form generation.

## Client Applications

This backend acts as the central API for the client applications:

- **React Web Application:** Located in the [`/frontend`](../frontend) directory within this monorepo.
- **React Native Expo Application:** [FormCraft-APK](https://github.com/amon-mr-error/FormCraft-APK)


## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **AI Integration:** Langchain, Mistral AI
- **Security:** JSON Web Tokens (JWT), bcryptjs
- **Middleware:** CORS, Body-parser, Multer

## Key Features

- **AI Form Generation:** Utilizes Mistral AI models to automatically construct detailed form schemas and questions based on natural language prompts.
- **Form Management:** Comprehensive endpoints to create, retrieve, update, delete, duplicate, and publish forms.
- **Response Handling:** Secure endpoints to collect, store, and manage user submissions for published forms.
- **Authentication & Authorization:** Secure user registration and login workflows with route protection using JWT.

## Setup Instructions

### Prerequisites

- Node.js (v18 or newer recommended)
- MongoDB instance (local or MongoDB Atlas)
- Mistral AI API Key

### Environment Variables

Create a `.env` file in the root directory and configure the following variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
MISTRAL_API_KEY=your_mistral_api_key
```

### Installation

1. Install project dependencies:
   ```bash
   npm install
   ```

2. Start the development server (uses nodemon):
   ```bash
   npm run dev
   ```

3. For production deployment, start the standard Node server:
   ```bash
   npm start
   ```

By default, the server will listen on port 5000 or the port defined in your `.env` file.

## API Structure

- `/api/users`: Handles user registration, authentication, and profile endpoints.
- `/api/forms`: Manages form creation, duplication, AI generation (`/api/forms/generate`), and retrieving public/private forms.
- `/api/responses`: Manages form submission data and analytics.

## License

This project is licensed under the ISC License.
