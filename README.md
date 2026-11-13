# 🚗 AI-Based Car Damage Detection and Cost Estimation System

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Click%20Here-brightgreen?style=for-the-badge)](https://ai-based-car-damage-detection-and-c.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?style=for-the-badge)](https://github.com/rohitmyathri/AI-Based-Car-Damage-Detection-and-Cost-Estimation-System)

## 🌐 Live Demo
👉 **[https://ai-based-car-damage-detection-and-c.vercel.app](https://ai-based-car-damage-detection-and-c.vercel.app)**

> ⚠️ Note: First load may take 30-50 seconds (free hosting cold start)

---

## 📌 About
An AI-powered web application that detects vehicle damage from images using YOLOv8 and estimates repair costs based on damage type, severity, and vehicle category.

---

## ✨ Features
- 🔐 User authentication (signup/login/forgot password with OTP)
- 📸 Upload car damage images
- 🤖 AI-powered damage detection using trained YOLOv8 model
- 🏷️ Detects 6 damage types: **dent, scratch, crack, glass shatter, lamp broken, tire flat**
- 📊 Confidence scores and severity assessment (Minor/Moderate/Severe)
- 💰 Repair cost estimation in ₹ (Indian Rupees)
- 📈 Dashboard with analytics and charts
- 📄 PDF report generation with bounding boxes
- 🔄 Batch analysis (up to 10 images)
- ⚖️ Compare two damage images side by side
- 📱 Responsive UI

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TailwindCSS, Framer Motion, Recharts |
| Backend | Node.js, Express, MongoDB, JWT, Multer, PDFKit |
| ML Model | Python, YOLOv8, PyTorch, Ultralytics |
| Database | MongoDB Atlas |
| Deployment | Vercel (Frontend) + Render (Backend) |

---

## 🚀 Quick Start (Local)

### 1. Clone the repo
```bash
git clone https://github.com/rohitmyathri/AI-Based-Car-Damage-Detection-and-Cost-Estimation-System.git
cd AI-Based-Car-Damage-Detection-and-Cost-Estimation-System
```

### 2. Install dependencies
```bash
npm run install-all
```

### 3. Setup environment files

**backend/.env:**
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_secret_key
NODE_ENV=development
EMAIL_USER=your_gmail
EMAIL_PASSWORD=your_gmail_app_password
FRONTEND_URL=http://localhost:5173
```

**frontend/.env:**
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Install ML dependencies
```bash
cd backend/ml_service
pip install -r requirements.txt
```

### 5. Start the app
```bash
npm run dev
```

Open: **http://localhost:5173**

---

## 📁 Project Structure
```
├── frontend/          # React + Vite + TailwindCSS
├── backend/           # Node.js + Express + MongoDB
│   ├── ml_service/    # Python YOLOv8 ML service
│   ├── routes/        # API routes
│   ├── models/        # MongoDB models
│   └── utils/         # Cost calculator, email service
├── Model/             # Trained YOLOv8 model (best_model.pt)
└── README.md
```

---

## 👨‍💻 Author

**M Rohit**

🎓 B.Tech – Computer Science and Business System

📧 Email: 23211a3230@bvrit.ac.in

🔗 GitHub: [https://github.com/rohitmyathri](https://github.com/rohitmyathri)

💼 LinkedIn: [https://www.linkedin.com/in/m-rohit-3b7160293/](https://www.linkedin.com/in/m-rohit-3b7160293/)

---

## 📄 License
MIT License
