# AlgoSync

A comprehensive platform for managing and solving coding problems with chatbot assistance. AlgoSync helps you organize your DSA practice, track your progress, and get intelligent coding assistance through an integrated AI chatbot.

## 🚀 Live Demo

- **Frontend**: [https://algosyncv1.vercel.app](https://algosyncv1.vercel.app)
- **Backend API**: [https://algosync-backend-production.up.railway.app](https://algosync-backend-production.up.railway.app)

## ✨ Features

### 📚 Question Management
- **Smart Question Parsing**: Paste question content and automatically extract title, description, difficulty, examples, constraints, and tags
- **Platform Integration**: Automatic LeetCode URL generation 
- **Progress Tracking**: Mark questions as solved, important
- **Code Storage**: Save and manage your solutions for each question
- **Statistics Dashboard**: Track your progress 

### 🤖 AI-Powered Assistant
- **Intelligent Chatbot**: Get help with coding problems using Gemini AI
- **Context-Aware Responses**: AI understands the current question context
- **Code Generation**: Generate solutions in multiple programming languages
- **Conversational Interface**: Natural language interaction for coding help
- **Code Saving**: You can directly save AI-generated code to your question

### 📝 Notes System
- **Organized Notes**: Create and manage study notes 
- **Pin Important Notes**: Pin frequently used notes for quick access
- **Search Functionality**: Find notes quickly with search capabilities

### 🔐 User Management
- **Secure Authentication**: JWT-based authentication system
- **User Profiles**: Manage your profile and preferences
- **Progress Sync**: Your data syncs across devices

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom glass morphism design
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: React Context + React Query
- **Routing**: React Router DOM
- **Forms**: React Hook Form with Zod validation
- **Animations**: Framer Motion
- **Markdown**: React Markdown with syntax highlighting

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcryptjs
- **AI Integration**: Google Gemini AI API
- **CORS**: Cross-origin resource sharing
- **Validation**: Custom middleware validation

### Deployment
- **Frontend**: Vercel
- **Backend**: Railway
- **Database**: MongoDB Atlas

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB database
- Google Gemini AI API key

## 🚀 Deployment

### Backend (Railway)
1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variable: `VITE_API_URL`
3. Deploy automatically on push

