# Hostel Management System

## 📌 Project Overview
This project is a **Hostel Management System** built with **Node.js, Express, MongoDB, and JavaScript**. It includes:
- **Student Login & Check-in System** (with GPS Validation ✅)
- **Faculty Dashboard** (to view all student check-in attempts 📊)
- **JWT Authentication** for secure login 🔐
- **MongoDB Database** for storing user and check-in logs 📁

---

## 🔧 Prerequisites
Before setting up the project, ensure you have the following installed:

### Node.js & npm (Required for backend)
- Download from: [Node.js Official Website](https://nodejs.org/)
- Verify installation:
  ```sh
  node -v
  npm -v
  ```

### MongoDB (Database)
- Download & install **MongoDB Community Edition**:
  - [MongoDB Download Link](https://www.mongodb.com/try/download/community)
- Verify installation:
  ```sh
  mongod --version
  ```
- Start MongoDB Server:
  ```sh
  mongod --dbpath="C:\data\db"   # Windows
  sudo systemctl start mongod       # Linux
  ```

---

## 🚀 Project Setup

### 1️⃣ Clone the Repository
```sh
    git clone https://github.com/your-username/hostel-management-system.git
    cd hostel-management-system
```

### 2️⃣ Install Dependencies
```sh
    npm install
```
This will install the required **Node.js dependencies**:
- `express` → Web framework
- `mongoose` → MongoDB ORM
- `jsonwebtoken` → For authentication
- `bcrypt` → Password hashing
- `cors` → Enabling CORS
- `dotenv` → For environment variables

### 3️⃣ Start MongoDB
- Ensure MongoDB is running before starting the server:
  ```sh
  mongod --dbpath="C:\data\db"  # Windows
  sudo systemctl start mongod     # Linux
  ```
- Connect to MongoDB shell (**for debugging**):
  ```sh
  mongosh
  use hostelDB
  ```

### 4️⃣ Start the Backend Server
```sh
    npm start  # Runs the Express.js Server
```
- **Default Port:** `5000`
- **Server Running at:** `http://localhost:5000`

### 5️⃣ Start the Frontend
- Open `index.html` in a browser OR use a **Live Server** extension in VS Code.

---

## 🎯 Project Features
### ✅ User Authentication
- **Students & Faculty** can log in securely.
- Uses **JWT Tokens** to maintain sessions.

### 📍 GPS-Based Check-in System
- Students **must be physically in the hostel** to check in.
- GPS coordinates are logged into the database.

### 📝 Faculty Dashboard
- Faculty can **search for students by email**.
- View **all check-in attempts** (successful or failed).

### 🛠 Error Handling & Logging
- Every **check-in attempt is logged** (even failed attempts).
- Faculty can **track GPS location** of each check-in.

---

## 🔥 API Endpoints
| Method | Endpoint | Description |
|--------|---------|-------------|
| **POST** | `/api/auth/register` | Register a new user |
| **POST** | `/api/auth/login` | User login |
| **GET** | `/api/auth/user` | Get current logged-in user |
| **POST** | `/api/student/checkin` | Student check-in with GPS |
| **GET** | `/api/faculty/query` | Faculty searches student check-in logs |

---

## 🎯 Future Improvements
- ✅ **Profile Picture Uploads** 📸
- ✅ **Check-out Functionality**
- ✅ **Admin Panel for Reports** 📊

---

## 📞 Support
Need help? Contact us at: **vigneshpalani003@gmail.com**

Happy Coding! 🚀🔥
