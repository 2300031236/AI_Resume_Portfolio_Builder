# Deployment Guide - AI Resume & Portfolio Builder

This document outlines the hosting strategy and production deployment steps for the **AI Resume & Portfolio Builder** application.

---

## 1. Database Deployment (MySQL)

Set up a production MySQL database instance (e.g. AWS RDS, GCP Cloud SQL, or self-hosted).

1. Connect to your database server and execute the initialization script:
   ```bash
   mysql -u root -p < schema.sql
   ```
2. Ensure database users have correct read-write permissions to the `ai_resume_builder` schema.

---

## 2. Backend Deployment (Spring Boot)

### 2.1 Package the JAR
Compile and package the backend application into a runnable fat JAR file:
1. Navigate to the `backend` directory.
2. Run Maven package:
   ```bash
   mvn clean package -DskipTests
   ```
3. This creates a file named `resumebuilder-0.0.1-SNAPSHOT.jar` inside the `backend/target/` directory.

### 2.2 Configure Production Environment Variables
Set the following environment variables on the production server (e.g., in `/etc/environment` or your host runner configurations):
```bash
# Database settings
export DB_HOST=your-rds-host.amazonaws.com
export DB_PORT=3306
export DB_NAME=ai_resume_builder
export DB_USER=production_user
export DB_PASSWORD=production_password

# API & Secrets
export HF_API_KEY=your_production_hugging_face_api_token
export CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
export CLOUDINARY_API_KEY=your_cloudinary_api_key
export CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Security Settings
export JWT_SECRET=your_long_secure_random_base64_string_here
export JWT_EXPIRATION_MS=86400000 # 24 hours
```

### 2.3 Run the Application
Start the JAR:
```bash
java -jar resumebuilder-0.0.1-SNAPSHOT.jar
```
For background processes on Linux, wrap it inside a `systemd` service:
```ini
# /etc/systemd/system/resuai-backend.service
[Unit]
Description=ResuAI Spring Boot Backend
After=syslog.target

[Service]
User=ubuntu
ExecStart=/usr/bin/java -jar /var/www/backend/resumebuilder-0.0.1-SNAPSHOT.jar
SuccessExitStatus=143
EnvironmentFile=/etc/environment

[Install]
WantedBy=multi-user.target
```
Enable and start the service:
```bash
sudo systemctl enable resuai-backend.service
sudo systemctl start resuai-backend.service
```

---

## 3. Frontend Deployment (React.js)

### 3.1 Bundle Compilation
1. Navigate to the `frontend` directory.
2. Configure your production API target. Create a file named `frontend/.env.production` containing:
   ```env
   VITE_API_URL=https://your-api-domain.com
   ```
3. Run build script:
   ```bash
   npm run build
   ```
4. This compiles static html/css/js files into the `frontend/dist/` directory.

### 3.2 Host with Nginx
Point your web server (e.g., Nginx) to serve the `dist` folder:
```nginx
# /etc/nginx/sites-available/resuai
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Reload Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/resuai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```
Your full-stack application is now live and fully secure!
