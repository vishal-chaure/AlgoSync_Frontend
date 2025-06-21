# 🧠 DSA Question Manager

A personalized, AI-assisted web application to manage, organize, and solve Data Structures & Algorithms questions from platforms like LeetCode, GeeksforGeeks, and Codeforces.

> Built with MERN Stack, TailwindCSS, Framer Motion, and integrated with Google Gemini AI.

---

## 🚀 Features

- 🔐 **Authentication** – JWT-based login/signup with account management (update profile, password, avatar)
- 🧮 **Dashboard** – View total and solved questions, filter by difficulty and topic
- 🗃️ **Organized Topics** – Questions grouped by DSA topics like Array, Graph, DP, etc.
- 📌 **Question Bar View** – Horizontal bar for each question (title, links, star, solved checkbox)
- 🧾 **Detailed View Panel** – Slide-in panel showing full question, constraints, examples
- 🤖 **AI Chatbot** – Gemini-powered left-panel chatbot to generate code and explain logic
- 💾 **Save Code** – Save AI-generated or custom code for each question
- ⬇️ **Add Question Page** – Paste full problem text and auto-parse title, description, tags, etc.
- 🧠 **Smart Tagging** – Auto-detect DSA tags from pasted content using BeautifulSoup backend
- 🌐 **Chrome Extension** – Auto-import questions directly from LeetCode/GFG/Codeforces

---

## 🧱 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React, TailwindCSS, Framer Motion |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Authentication | JWT |
| AI | Google Gemini API |
| Chrome Extension | JavaScript (DOM scraping) |
| Parser | Python (BeautifulSoup for parsing question content) |

---

## 📸 Screenshots

> Coming soon (or add actual UI shots here)

---

## 📂 Folder Structure

```bash
/client         # React frontend
/server         # Express backend
/extension      # Chrome extension code
/parser         # Python microservice for parsing