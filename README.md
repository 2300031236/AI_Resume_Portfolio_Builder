# AI Resume & Portfolio Builder

An AI-powered web platform designed for students and fresh graduates to generate ATS-optimized resumes, professional cover letters, and themeable developer portfolio websites using Generative AI.

---

## Folder Structure

```text
AI Resume & Portfolio Builder/
│
├── backend/
│   ├── pom.xml                              # Maven build file with Spring Boot, Security, JPA, Cloudinary & OpenPDF
│   └── src/
│       └── main/
│           ├── java/com/ai/resumebuilder/
│           │   ├── config/                  # WebSecurityConfig & CORS Configurations
│           │   ├── controller/              # Auth, Resume, Ats, CoverLetter, Portfolio, Career, AI controllers
│           │   ├── dto/                     # Request and Response payload definitions
│           │   ├── exception/               # Custom exceptions and GlobalExceptionHandler
│           │   ├── model/                   # JPA Entities (User, Education, Project, Experience, etc.)
│           │   ├── repository/              # Spring Data JPA Repository interfaces
│           │   ├── security/                # JWT Utilities, Custom UserDetails & AuthTokenFilter
│           │   ├── service/                 # HuggingFaceService, CloudinaryService, PdfGenerationService, etc.
│           │   └── AiResumeBuilderApplication.java # Spring Boot Main application class
│           └── resources/
│               └── application.properties   # Core backend database & API settings
│
├── frontend/
│   ├── package.json                         # npm configurations with React Router, Axios, and Tailwind CSS v4
│   ├── vite.config.js                       # Vite compiler config with @tailwindcss/vite plugin
│   ├── index.html                           # App entry HTML page
│   └── src/
│       ├── components/                      # Layout, Navbar, Sidebar, PrivateRoute
│       ├── context/                         # AuthContext for session management and Dark Mode state
│       ├── pages/                           # Dashboard, Login, Register, ResumeBuilder, AtsAnalyzer, etc.
│       ├── services/                        # api.js Axios client with interceptors
│       ├── styles/
│       ├── App.jsx                          # Route routing setup
│       ├── index.css                        # Tailwind CSS v4 imports and premium animations
│       └── main.jsx                         # Main React application mount
│
├── schema.sql                               # MySQL database schema definition
├── API_DOCUMENTATION.md                     # Endpoints details and JSON schemas
└── DEPLOYMENT_GUIDE.md                      # Production deployment guide
```

---

## Tech Stack

- **Backend**: Spring Boot (Java 21), Spring Security, JPA/Hibernate, MySQL Driver, JJWT, Cloudinary, OpenPDF.
- **Frontend**: React.js, Tailwind CSS v4, React Router, Axios, Lucide React.
- **AI Model**: Hugging Face Inference API with `google/gemma-4-12B-it`.
- **Database**: MySQL.
- **Storage**: Cloudinary (profile images and documents).

---

## Quick Start Guide

### 1. Database Setup
Create a MySQL database named `ai_resume_builder` and run the script in [schema.sql](file:///c:/Users/mohit/OneDrive/Desktop/AI%20Resume%20&%20Portfolio%2520Builder/schema.sql) to initialize tables.

### 2. Configure Environment Variables
Create an environment file or set env variables:
```bash
# Backend Variables
export DB_HOST=localhost
export DB_PORT=3306
export DB_NAME=ai_resume_builder
export DB_USER=root
export DB_PASSWORD=yourpassword
export HF_API_KEY=your_hugging_face_token
export CLOUDINARY_CLOUD_NAME=your_cloud_name
export CLOUDINARY_API_KEY=your_api_key
export CLOUDINARY_API_SECRET=your_api_secret

# Frontend Variables
# Created under frontend/.env
VITE_API_URL=http://localhost:8080
```

### 3. Run Spring Boot Backend
Navigate to the `backend` folder and run:
```bash
mvn spring-boot:run
```
The backend server starts on port `8080`.

### 4. Run React Frontend
Navigate to the `frontend` folder and run:
```bash
npm install
npm run dev
```
The frontend dev server starts on port `5173`. Open [http://localhost:5173](http://localhost:5173) in your browser.
