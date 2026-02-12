# 🚀 Fullstack Social Media Application

A modern fullstack social media platform built with **React.js, Node.js, and MongoDB**.  
This project demonstrates real-world architecture, authentication, background jobs, media handling, and deployment.

---

## 🌍 Live Demo

🔗 Deployed on Vercel  
https://social-media-dr4f.vercel.app

---

## 🛠 Tech Stack

### 🎨 Frontend
- React.js
- Tailwind CSS
- Redux Toolkit (State Management)
- Axios (API Requests)
- React Router DOM

### ⚙️ Backend
- Node.js
- Express.js
- MongoDB + Mongoose

### 🔐 Authentication
- Clerk (Secure Authentication & User Management)

### 📦 Background Jobs
- Inngest (Event-driven background tasks)

### 📧 Email Service
- Brevo / Nodemailer

### 🖼 Media Management
- ImageKit (Image & Video Upload + Optimization)

### 🚀 Deployment
- Vercel

---

## ✨ Features

### 🔐 Authentication
- Secure Sign Up & Sign In
- Protected Routes
- JWT Token-based API authentication
- Persistent sessions

### 🏠 Feed
- View posts from connected users
- Dynamic content loading
- Refresh functionality

### ➕ Create Post
- Upload images
- Add captions
- Store media in ImageKit
- Save post data in MongoDB

### 📖 Stories
- Create text, image, or video stories
- Stories automatically delete after 24 hours
- Background deletion handled using Inngest

### 💬 Real-time Messaging
- Chat between users
- Dynamic routing (`/messages/:userId`)
- Live updates using Server-Sent Events (SSE)

### 👤 Profile System
- View your profile
- View other users’ profiles
- Dynamic routing (`/profile/:profileId`)

### 🤝 Connections
- Manage and view user connections

### 🔎 Discover
- Explore new users
- Expand your network

### ❌ Custom 404 Page
- Not Found route handling

---

## 📂 Project Structure

