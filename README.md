# 🚀 QuickGPT

QuickGPT is a full-stack AI chat application where users can interact with an AI model, generate text and images, and manage conversations with a credit-based system.

---

## 🧠 Features

* 🔐 User Authentication (JWT-based login/signup)
* 💬 AI Chat (text generation)
* 🖼️ Image Generation
* 🧾 Chat History (stored in database)
* 💳 Credit-Based Usage System
* 🌐 Community Gallery (published images)
* 🎨 Dark/Light Mode UI

---

## 🛠️ Tech Stack

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

* OpenAI API (text generation)
* ImageKit (image handling)
* Stripe (payments)

---

## ⚙️ Installation & Setup

### 1. Clone the repository

git clone https://github.com/ritikrajput12/QuickGPT.git

cd QuickGPT

---

### 2. Setup Backend

cd server

npm install

Create a `.env` file in server folder and add:

MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret
OPENAI_API_KEY=your_api_key
STRIPE_SECRET_KEY=your_stripe_key
IMAGEKIT_URL_ENDPOINT=your_url

Run backend:

npm run server

---

### 3. Setup Frontend

cd ../client

npm install

npm run dev

---

## 📂 Project Structure

QuickGPT/
│
├── client/   → React frontend
├── server/   → Node/Express backend
├── .gitignore
└── README.md

---

## 🔄 Application Flow

1. User logs in → JWT token generated
2. User sends prompt → frontend sends request to backend
3. Backend validates user + credits
4. Request sent to AI API
5. Response stored in MongoDB
6. Response returned to frontend and displayed

---

## 🔒 Security

* JWT-based authentication
* Protected API routes
* Environment variables for sensitive data

---

## 🚧 Improvements (Future Scope)

* Streaming responses (real-time typing)
* Chat pagination
* Better error handling
* Rate limiting
* Multi-AI provider support

---

## 👨‍💻 Author

Ritik Rajput
GitHub: https://github.com/ritikrajput12

---

## ⭐ If you like this project

Give it a star on GitHub!
