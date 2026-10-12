# 🔐 Complete Authentication System

A backend authentication project built while learning from the Sheryians Coding School YouTube Channel. This project explores the implementation of authentication features using Node.js, Express.js, and MongoDB, including JWT access and refresh tokens, token rotation, session management, and email OTP verification.

📚 Learning Source

YouTube Channel: Sheryians Coding School

Project: Complete Authentication System

Purpose: Learning and practicing backend authentication concepts through hands-on implementation.

A backend authentication project built using **Node.js, Express.js, and MongoDB** that demonstrates user registration, email OTP verification, JWT-based authentication, access and refresh tokens, token rotation, and session management.

The project focuses on understanding how authentication systems work in real-world backend applications.

## 🚀 Features

- **User Registration:** Register new users with username, email, and password.
- **Password Hashing:** Hash passwords using Node.js Crypto before storing them in MongoDB.
- **Email OTP Verification:** Verify user email addresses using one-time passwords sent through email.
- **User Login:** Authenticate users using email and password.
- **JWT Authentication:** Generate and verify JSON Web Tokens.
- **Access Token:** Use short-lived access tokens to authorize requests.
- **Refresh Token:** Generate new access tokens when existing access tokens expire.
- **Token Rotation:** Replace refresh tokens during the token-refresh process.
- **Session Management:** Store session information, refresh-token hashes, IP addresses, and user-agent details.
- **Logout:** Revoke the current session and clear the refresh-token cookie.
- **Logout from All Devices:** Provide functionality to invalidate multiple user sessions.
- **Request Validation:** Validate incoming registration requests using `express-validator`.
- **MongoDB Integration:** Store users, OTP records, and session information using Mongoose.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | Backend API framework |
| MongoDB | NoSQL database |
| Mongoose | Database modeling and queries |
| JSON Web Token (JWT) | Token-based authentication |
| Crypto | Password and token hashing |
| Nodemailer | Email delivery |
| express-validator | Input validation |
| cookie-parser | Reading and managing cookies |
| Morgan | HTTP request logging |
| dotenv | Environment variable management |
| Nodemon | Automatic server restart during development |

## 📁 Project Structure

```text
CompleteAuthentication/
│
├── src/
│   ├── config/
│   │   ├── config.js
│   │   └── database.js
│   │
│   ├── controllers/
│   │   └── auth.controller.js
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   └── validation.middleware.js
│   │
│   ├── models/
│   │   ├── otp.model.js
│   │   ├── session.model.js
│   │   └── user.model.js
│   │
│   ├── routes/
│   │   └── auth.route.js
│   │
│   ├── services/
│   │   └── email.service.js
│   │
│   ├── utils/
│   │   └── utils.js
│   │
│   └── app.js
│
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── server.js
└── README.md
```

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/ChetanKhadse906/Complete_Authentication_System.git
```

### 2. Navigate to the Project Directory

```bash
cd Complete_Authentication_System
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory and add the environment variables required by your application.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REFRESH_TOKEN=your_google_refresh_token
GOOGLE_ACCESS_TOKEN=your_google_access_token
GOOGLE_USER=your_email_address
```

Replace the placeholder values with your actual configuration. Make sure the variable names match those used in `src/config/config.js` and `src/services/email.service.js`.

**Security:** Never upload `.env` to GitHub or share your database credentials, JWT secret, or email authentication tokens publicly.

### 5. Start the Development Server

```bash
npm run dev
```

The development server uses Nodemon to restart automatically when files change.

If your application is configured to use port `5000`, it will run at:

```text
http://localhost:5000
```

## 🔄 Authentication Workflow

### 1. User Registration

- The user submits a username, email, and password.
- Registration input is validated.
- The password is hashed using SHA-256.
- The user record is saved in MongoDB.
- An OTP is generated and its hash is stored in the OTP collection.
- An email containing the OTP is sent to the registered address.

### 2. Email Verification

- The user submits the email address and OTP.
- The submitted OTP is hashed and compared with the stored OTP hash.
- If a matching OTP record is found, the user's email verification status is updated.
- The user's OTP records are deleted after successful verification.

### 3. User Login

- The user submits their email and password.
- The application checks whether the user exists and has verified their email.
- The submitted password is hashed and compared with the stored password hash.
- After successful authentication, access and refresh tokens are generated.
- A session record is created in MongoDB.

### 4. Access and Refresh Tokens

**Access token**
- Used to access protected resources.
- Configured to expire after 15 minutes.
- Sent in the login response.

**Refresh token**
- Used to request a new access token.
- Configured to expire after 7 days.
- Stored in an HTTP-only cookie.
- Its hash is stored in the session collection.

### 5. Token Rotation

During token refresh, the application is designed to validate the refresh token, check its session, generate a new access token, and replace the stored refresh-token hash.

### 6. Session Management

- The application stores session information in MongoDB.
- Logout revokes the current session.
- Logout from all devices is intended to revoke multiple active sessions.

## 📡 API Endpoints

The following endpoints are defined in `src/routes/auth.route.js`. Their complete URL depends on the route prefix configured in `src/app.js`.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/register` | Register a new user |
| POST | `/login` | Authenticate a user |
| GET | `/get-me` | Fetch the current user's information |
| GET | `/refresh-token` | Refresh the access token |
| GET | `/logout` | Log out the current session |
| GET | `/logoutAll` | Log out from all devices |
| GET | `/verify-email` | Verify email using OTP |

### Example Request Bodies

**Register — `POST /register`**

```json
{
  "username": "chetan",
  "email": "chetan@example.com",
  "password": "your_password"
}
```

**Login — `POST /login`**

```json
{
  "email": "chetan@example.com",
  "password": "your_password"
}
```

**Verify Email — `/verify-email`**

```json
{
  "email": "chetan@example.com",
  "otp": "123456"
}
```

The verification controller reads the email and OTP from `req.body`. For reliable API behavior, this endpoint should preferably use the `POST` method rather than `GET`.

### Using the Access Token

For the `/get-me` endpoint, the controller reads the access token from the `Authorization` header.

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

The refresh, logout, and logout-all endpoints rely on the refresh-token cookie in the current implementation.

## 🗄️ Database Models

The project contains three primary Mongoose models.

### User Model — `user.model.js`

Stores user information, including:

- Username
- Email
- Password hash
- Email verification status

### OTP Model — `otp.model.js`

Stores email verification information, including:

- Email
- User reference
- Hashed OTP

### Session Model — `session.model.js`

Stores session information, including:

- User reference
- Refresh-token hash
- IP address
- User-agent information
- Session revocation status

The exact fields and schema constraints are defined in their respective model files.

## 🔒 Security Considerations

This project is intended for learning and development. Before using it in production, consider the following improvements:

- Use **Argon2 or bcrypt** for password hashing instead of plain SHA-256, which is not designed for password storage.
- Never return password hashes in API responses.
- Configure secure cookies appropriately for your production environment.
- Add OTP expiration, retry limits, and rate limiting.
- Ensure refresh-token validation, rotation, and session revocation are consistent.
- Use HTTPS in production.
- Validate and sanitize all incoming requests.
- Keep credentials in environment variables.
- Review all authentication and authorization middleware before protecting production routes.

## 🎯 Learning Objectives

By developing this project, you can understand:

- How authentication systems work.
- How to build REST APIs using Express.js.
- How to integrate MongoDB using Mongoose.
- How password hashing works.
- How JWT access and refresh tokens are used.
- How email OTP verification works.
- How session management and token revocation work.
- How middleware, controllers, routes, and services are organized in a backend application.
- How to manage environment variables and publish a project on GitHub.

## 🚀 Future Improvements

- Password reset through email OTP.
- Role-based access control.
- OTP expiration and resend functionality.
- Login rate limiting and brute-force protection.
- Improved refresh-token reuse detection.
- Device and session management dashboard.
- API documentation using Swagger.
- Unit and integration testing.
- Deployment to a cloud hosting platform.

---

⭐ If you find this project useful for learning backend development and authentication, consider giving the repository a star.
