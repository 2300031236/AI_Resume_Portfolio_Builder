# API Documentation - AI Resume & Portfolio Builder

All APIs operate under the base URL: `http://localhost:8080`

---

## Authentication Endpoints

### 1. Register User
- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "name": "Alex Mercer",
    "email": "alex@university.edu",
    "password": "securepassword123"
  }
  ```
- **Response**: `200 OK` (User registered successfully!)

### 2. Login
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "email": "alex@university.edu",
    "password": "securepassword123"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "id": 1,
    "name": "Alex Mercer",
    "email": "alex@university.edu",
    "profileImageUrl": "https://res.cloudinary.com/..."
  }
  ```

### 3. Password Reset
- **URL**: `/api/auth/password-reset`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "email": "alex@university.edu",
    "newPassword": "newsecurepassword456"
  }
  ```
- **Response**: `200 OK` (Password reset successful!)

### 4. Upload Profile Image
- **URL**: `/api/auth/profile-image`
- **Method**: `POST`
- **Auth Required**: Yes (Bearer Token)
- **Request Body**: Multipart form data with key `file` (image binary)
- **Response**: `200 OK` (Returns updated User profile object)

---

## Resume Management Endpoints

### 1. Save Resume
- **URL**: `/api/resumes`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "template": "modern",
    "atsScore": 85,
    "resumeData": "{\"personalInfo\": {\"name\": \"Alex\"}, \"education\": []}"
  }
  ```
- **Response**: `200 OK` (Returns saved Resume object)

### 2. Update Resume
- **URL**: `/api/resumes/{id}`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Request Body**: Same as Save Resume
- **Response**: `200 OK` (Returns updated Resume object)

### 3. Export PDF
- **URL**: `/api/resumes/{id}/pdf`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response**: Binary stream of type `application/pdf`

### 4. Get Dashboard Statistics
- **URL**: `/api/resumes/dashboard`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response**: `200 OK`
  ```json
  {
    "welcomeMessage": "Welcome back, Alex!",
    "resumeCount": 2,
    "portfolioCount": 1,
    "avgAtsScore": 78,
    "recentActivity": ["Modified resume using modern template on 2026-06-22"],
    "careerRecommendations": ["Full-Stack Software Engineer", "React Developer"]
  }
  ```

---

## ATS Score Analyzer Endpoints

### 1. Analyze Resume Text
- **URL**: `/api/ats/analyze`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "resumeText": "Alex Mercer, CS Graduate. Skills: Java, React, SQL...",
    "jobDescription": "We are looking for a Software Developer with experience in Java Spring Boot and Docker..."
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "atsScore": 75,
    "missingKeywords": ["Docker", "Spring Boot", "Unit Testing"],
    "keywordMatchPercentage": 72.5,
    "improvementSuggestions": [
      "Explicitly list Docker in skills section.",
      "Add Spring Boot details to project description."
    ]
  }
  ```

---

## Cover Letter Generator Endpoints

### 1. Generate Cover Letter
- **URL**: `/api/cover-letters/generate`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "companyName": "Tech Corp",
    "jobRole": "Full-Stack Developer Intern",
    "jobDescription": "Build React pages and Java REST endpoints."
  }
  ```
- **Response**: `200 OK` (`{"coverLetter": "Dear Hiring Manager..."}`)

---

## Portfolio Generator Endpoints

### 1. Save Portfolio
- **URL**: `/api/portfolios`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "theme": "dark",
    "portfolioData": "{\"hero\":{\"title\":\"Alex\"},\"skills\":[\"Java\"]}"
  }
  ```
- **Response**: `200 OK` (Returns saved Portfolio object)

### 2. Retrieve Public Portfolio Config (Unsecured)
- **URL**: `/api/public/portfolios/{userId}`
- **Method**: `GET`
- **Auth Required**: No
- **Response**: `200 OK` (Returns Portfolio object for public site sharing)
