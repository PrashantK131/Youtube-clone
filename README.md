# YouTube Clone — MERN Stack Capstone

A full-stack YouTube clone where users can view and interact with videos. This project helps to understand how to build a real-world application using MongoDB, Express, React (Vite) and Node.js**.


## Features

| Category | Feature |
|---|---|
| **Home Page** | Video grid, sticky filter chips (10 categories), search by title, responsive layout |
| **Authentication** | Register (username, email, password, channel name), JWT login, form validation with error messages |
| **Video Player** | HTML5 video player, like/dislike toggle (persisted), view counter |
| **Comments** | Add, edit, delete comments — full CRUD directly on the video page |
| **Channel Page** | Channel banner, avatar, bio, video grid; owners can edit/delete their videos |
| **Video Upload** | Upload form with title, description, URL, thumbnail, category |
| **Search & Filter** | Search bar in header filters by title |
| **Responsive** | Mobile, tablet and desktop layouts |


## 📁 Project Structure

```
youtube-clone-converted/
├── backend/
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── controllers/
│   │   ├── userController.js   # signup, login, logout, getMe
│   │   ├── videoController.js  # CRUD + like/dislike + search/filter
│   │   └── commentController.js# CRUD with ownership check
│   ├── middleware/
│   │   └── authenticate.js     # JWT middleware (cookie + Bearer header)
│   ├── models/
│   │   ├── User.js
│   │   ├── Video.js
│   │   └── Comment.js
│   ├── routes/
│   │   ├── userRoutes.js
│   │   ├── videoRoutes.js
│   │   └── commentRoutes.js
│   ├── .env                    # Environment variables
│   ├── index.js                # Express entry point
│   ├── seed.js                 # Database seeder
│   └── package.json            # type: "module" (ES Modules)
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar/         # Search bar, sign-in/avatar, hamburger
    │   │   ├── SideNavbar/     # Collapsible sidebar with category links
    │   │   └── VideoCard/      # Reusable video thumbnail card
    |   |   ├── ProtectedRoute/
    │   ├── context/
    │   │   └── AuthContext.jsx # Global auth state (useAuth hook)
    │   ├── pages/
    │   │   ├── Home/           # Video grid + filter chips
    │   │   ├── Video/          # Player + likes/dislikes + comments
    │   │   ├── SignUp/         # Registration with validation
    │   │   ├── Login/          # Login with validation
    │   │   ├── Channel/        # Channel view + video management
    │   │   |── VideoUpload/    # Upload form + Edit form
    |   |   ├── NotFound/  
    |   |  
    │   ├── App.jsx
    │   ├── main.jsx
    │   |── index.css
    |   └── index.html
    ├── vite.config.js          # Proxy to backend, port 5173
    └── package.json
```

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router , Axios, MUI Icons, React Toastify |
| Build Tool | Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Authentication | JWT (cookie + Authorization header) + bcryptjs |
| Module System | **ES Modules** (`import`/`export`) throughout |

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local on port 27017, or MongoDB Atlas URI)

### 1. Clone / extract the project

### 2. Backend setup

```bash
cd backend
npm install
```

Edit `.env` I have used MongoDB Atlas, we can also update MONGO_URI and JWT_SECRET:
```env
PORT=4000
MONGO_URI=mongodb+srv://rahulprashant2001_db_user:4Gva84mCauucaX0p@cluster0.d2db9p9.mongodb.net/?appName=Cluster0
JWT_SECRET=Yt20_Cl26
FRONTEND_URL=http://localhost:5173
```

Seed the database with sample data:
```bash
node seed.js
```

Start the backend server:
```bash
npm run dev      # development (nodemon)
# or
npm start        
```

Backend runs at **http://localhost:4000**

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**


## API Endpoints

### Auth — `/auth`
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/auth/signup` | — | Register new user |
| POST | `/auth/login` | — | Login, returns JWT |
| POST | `/auth/logout` | — | Clear auth cookie |
| GET | `/auth/me` | - | Get current user |
| GET | `/auth/user/:id` | — | Get user by ID |

### Videos — `/api`
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/videos` | — | Get all videos (supports `?search=&category=`) |
| GET | `/api/video/:id` | — | Get single video (increments views) |
| GET | `/api/channel/:userId` | — | Get videos by channel/user |
| POST | `/api/video` | - | Upload new video |
| PUT | `/api/video/:id` | Owner | Update video |
| DELETE | `/api/video/:id` | Owner | Delete video |
| PUT | `/api/video/:id/like` | - | Toggle like |
| PUT | `/api/video/:id/dislike` | - | Toggle dislike |

### Comments — `/api`
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/comments/:videoId` | — | Get comments for a video |
| POST | `/api/comments` | - | Add comment |
| PUT | `/api/comments/:id` | - | Owner | Edit comment |
| DELETE | `/api/comments/:id` | - | Owner | Delete comment |

---

## Sample Test Credentials (after seeding)

All seeded users share the same password:

| Username | Email | Password |
|---|---|---|
| JohnDoe | john@example.com | password123 |
| MusicFan | music@example.com | password123 |
| GamerPro | game@example.com | password123 |
| NewsGuy | news@example.com | password123 |
| TravelSarah | sarah@example.com | password123 |

---

## MongoDB Schema

### User
```js
{ channelName, userName (unique), email (unique), password (hashed),
  about, profilePic, timestamps }
```

### Video
```js
{ user (ref), title, description, videoLink, thumbnail,
  videoType (enum), likes [userId], dislikes [userId], views, timestamps }
```

### Comment
```js
{ user (ref), video (ref), message, timestamps }
```

## 📌 Implementation Details 
    - Code is thoroughly commented to explain complex logics.
    - Github Link: [https://github.com/PrashantK131/Youtube-clone]

## 👨‍💻 Author

[Prashant Kumar]