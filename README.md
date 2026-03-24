# QuickGPT

QuickGPT is a full-stack AI-based web application where users can interact with an AI model, generate images, and manage their usage through a credit-based system.

Live Demo: https://quick-gpt-5k67.vercel.app

---

## Overview

This project is built to understand how real-world AI applications work. It includes authentication, API integration, payments, and database handling in a single system.

Users can log in, send prompts, generate responses and images, and track their usage through credits.

---

## Features

* User authentication (JWT-based login and signup)
* AI chat (text generation using API)
* Image generation
* Chat history stored in database
* Credit-based usage system
* Community gallery for shared images
* Light and dark mode UI

---

## Tech Stack

### Frontend

* React.js
* Context API
* Tailwind CSS
* Axios

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)
* JWT Authentication

### Services

* OpenAI API
* ImageKit
* Stripe

---

## Setup

### Clone the repository

```bash id="g6qv03"
git clone https://github.com/ritikrajput12/QuickGPT.git
cd QuickGPT
```

---

### Backend setup

```bash id="r8p4b1"
cd server
npm install
```

Create a `.env` file in the server folder and add:

```env id="0k4k9j"
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret
OPENAI_API_KEY=your_api_key
STRIPE_SECRET_KEY=your_stripe_key
IMAGEKIT_URL_ENDPOINT=your_url
```

Run backend:

```bash id="0jccco"
npm run server
```

---

### Frontend setup

```bash id="6uxr3i"
cd ../client
npm install
npm run dev
```

---

## Project Structure

```id="5v5n2k"
QuickGPT/
├── client/
├── server/
└── README.md
```

---

## How it works

1. User logs in and receives a JWT token
2. User sends a prompt from the frontend
3. Backend verifies user and available credits
4. Request is sent to the AI service
5. Response is stored in the database
6. Result is returned and displayed on the UI

---

## Future Improvements

* Streaming responses
* Better error handling
* Chat pagination
* Rate limiting
* Support for multiple AI providers

---

## Author

Ritik Rajput
https://github.com/ritikrajput12
