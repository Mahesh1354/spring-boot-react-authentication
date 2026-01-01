# Authentication System – Full Stack (Spring Boot & React)

## 📌 Project Overview

This project is a **Full Stack Authentication System** built using **Spring Boot (Backend)** and **React (Frontend)**.  
It implements core authentication functionalities such as **user registration, login, email verification, and password reset**.

The backend provides secure REST APIs, and the frontend consumes these APIs to deliver a complete authentication flow.

---

## 🛠️ Tech Stack

### Backend
- Java
- Spring Boot
- Spring Security
- JWT (JSON Web Token)
- Maven
- MySQL

### Frontend
- React
- JavaScript
- HTML
- CSS
- Axios

---

## ✨ Implemented Features

### 🔐 Authentication
- User Registration
- User Login
- JWT-based Authentication
- Secure Password Encryption

### 📧 Email Services
- Email Verification after registration
- Password Reset via Email (SMTP)

### 🛡️ Security
- Secured REST APIs using Spring Security
- Environment variable–based secret management
- No sensitive information committed to GitHub

---

## 📂 Project Structure

authentication-system-fullstack/
│
├── backend/ # Spring Boot application
│ ├── controller/
│ ├── service/
│ ├── repository/
│ ├── security/
│ └── resources/
│
├── frontend/ # React application
│ ├── components/
│ ├── pages/
│ └── services/
│
└── README.md


---

## ⚙️ Environment Variables

All sensitive configurations are managed using **environment variables**.

SMTP_USERNAME=your_email@example.com

SMTP_PASSWORD=your_smtp_key

DB_URL=jdbc:mysql://localhost:3306/database_name
DB_USERNAME=database_username
DB_PASSWORD=database_password

JWT_SECRET=your_jwt_secret

> ⚠️ `application.properties` is ignored using `.gitignore` to protect secrets.

---

## 🚀 Run Project Locally

### Backend (Spring Boot)

cd backend
mvn clean install
mvn spring-boot:run

Backend URL: http://localhost:8080

---

### Frontend (React)

cd frontend
npm install
npm start

Frontend URL:
http://localhost:5173


---

## 🔗 Authentication Flow

1. User registers with email and password
2. Verification email is sent
3. User verifies email
4. User logs in with credentials
5. JWT token is generated
6. Token is sent with API requests
7. Protected APIs are accessible

---

## 🔒 Security Practices

- Secrets stored in environment variables
- Passwords encrypted before database storage
- JWT used for stateless authentication
- GitHub Push Protection compliance

---

## 📌 Future Enhancements

- Role-based authorization
- Refresh token support
- OAuth2 / Social login
- Docker support
- Cloud deployment

---

## 👨‍💻 Author

Mahesh Swami  
Java Full Stack Developer  
Spring Boot | React | REST APIs  

---

## ⭐ Project Purpose

This project was built for learning and portfolio development, following real-world authentication and security best practices.

