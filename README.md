# 🔧 WorkTrade — Direct Hire Skill Exchange Platform

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb)](https://mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Real--time-010101?logo=socket.io)](https://socket.io/)
[![Vite](https://img.shields.io/badge/Vite-Build-646CFF?logo=vite)](https://vitejs.dev/)

> **WorkTrade** is a full-stack **Direct Hire** platform where users can offer and request skilled services from each other. Users send private offers directly to specific providers — chat is unlocked only after a request is accepted.

---

## ✨ Features

- 🔐 **Secure Authentication** — JWT-based login & registration with bcrypt password hashing
- 📋 **Direct Hire Workflow** — Private service requests sent directly to specific providers
- 💬 **Real-time Chat** — Socket.io powered messaging, enabled only after offer acceptance
- 🔍 **Browse Requests** — Discover available service requests from other users
- 👤 **User Profiles** — Manage your skills offered and services needed
- 📊 **Dashboard** — Overview of your active requests, transactions, and reviews
- 🖼️ **Image Uploads** — Cloudinary integration for profile pictures and media
- ⭐ **Reviews & Ratings** — Leave and receive reviews after completed transactions
- 🚨 **Report System** — Report suspicious or inappropriate users
- 🤝 **Smart Matching** — Algorithm to match users based on complementary skills

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI Framework |
| Vite | Build Tool & Dev Server |
| Tailwind CSS v4 | Styling |
| React Router v7 | Client-side Routing |
| Axios | HTTP Requests |
| Socket.io Client | Real-time Communication |
| Framer Motion | Animations |
| Lucide React | Icon Library |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | Server Framework |
| MongoDB + Mongoose | Database & ODM |
| Socket.io | WebSocket Server |
| JWT | Authentication Tokens |
| bcryptjs | Password Hashing |
| Cloudinary | Image Storage |
| Multer | File Upload Handling |
| dotenv | Environment Variables |

---

## 📁 Project Structure

```
WorkTrade/
├── client/                  # React Frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── pages/           # Page components
│   │   │   ├── Auth.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── BrowseRequests.jsx
│   │   │   ├── Chat.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── CreateRequest.jsx
│   │   ├── App.jsx          # Root component & routing
│   │   └── index.css        # Global styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                  # Node.js Backend (Express)
│   ├── config/              # Database & service config
│   ├── middleware/          # Auth middleware
│   ├── models/              # Mongoose models
│   ├── routes/              # API routes
│   │   ├── auth.js
│   │   ├── requests.js
│   │   ├── transactions.js
│   │   ├── reviews.js
│   │   ├── reports.js
│   │   ├── messages.js
│   │   └── matching.js
│   ├── server.js            # Main server entry point
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites

Make sure you have these installed:
- [Node.js](https://nodejs.org/) v18 or higher
- [MongoDB](https://www.mongodb.com/try/download/community) (local) **OR** a [MongoDB Atlas](https://www.mongodb.com/atlas) free cluster
- [Git](https://git-scm.com/)

---

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/WorkTrade.git
cd WorkTrade
```

### 2. Setup the Backend (Server)

```bash
cd server
npm install
```

Create a `.env` file in the `server/` folder:

```bash
cp .env.example .env
```

Edit `server/.env` and fill in your values:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/worktrade
JWT_SECRET=your_super_secret_jwt_key_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Start the backend server:

```bash
npm run dev
```

> ✅ Server runs on **http://localhost:5000**

---

### 3. Setup the Frontend (Client)

Open a **new terminal**:

```bash
cd client
npm install
npm run dev
```

> ✅ Frontend runs on **http://localhost:5173**

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and get JWT token |
| GET | `/api/requests` | Get all service requests |
| POST | `/api/requests` | Create a new request |
| GET | `/api/transactions` | Get user transactions |
| POST | `/api/transactions` | Create a transaction |
| GET | `/api/messages/:userId` | Get messages with a user |
| POST | `/api/reviews` | Submit a review |
| POST | `/api/reports` | Report a user |
| GET | `/api/matching` | Get skill-matched users |

---

## ☁️ Deployment

### Backend → [Render](https://render.com) (Free)
1. Push your code to GitHub
2. Create a new **Web Service** on Render
3. Connect your GitHub repo
4. Set **Root Directory** to `server`
5. Set **Build Command**: `npm install`
6. Set **Start Command**: `npm start`
7. Add all environment variables from `.env`

### Frontend → [Vercel](https://vercel.com) (Free)
1. Create a new project on Vercel
2. Connect your GitHub repo
3. Set **Root Directory** to `client`
4. Set **Build Command**: `npm run build`
5. Set **Output Directory**: `dist`
6. Add environment variable: `VITE_API_URL=https://your-render-backend-url.onrender.com`

---

## 🔑 Environment Variables

### Server (`server/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 5000) | No |
| `MONGODB_URI` | MongoDB connection string | ✅ Yes |
| `JWT_SECRET` | Secret key for JWT tokens | ✅ Yes |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | ✅ Yes |
| `CLOUDINARY_API_KEY` | Cloudinary API key | ✅ Yes |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | ✅ Yes |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 👨‍💻 Author

Built with ❤️ by **[Your Name]**

- GitHub: [@YOUR_USERNAME](https://github.com/YOUR_USERNAME)

---

> ⭐ If you found this project helpful, please give it a star!
