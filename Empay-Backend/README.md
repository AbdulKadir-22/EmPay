# EmPay Backend

The backbone of the EmPay HRMS & Payroll system. This service provides a multi-tenant API for managing employees, attendance, leaves, and payroll processing.

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Validation**: Zod
- **Email**: Nodemailer (SMTP)
- **Logging**: Winston
- **Security**: Helmet, Express Rate Limit, JWT

## 📂 Core Modules

- **Auth Service**: Handles registration, login, token refresh, and password management.
- **User Service**: Manages employee profiles and invite workflows.
- **Attendance Service**: Real-time clock-in/out logic with work hour calculations.
- **Leave Service**: Automated leave allocation ($setOnInsert) and multi-step approval system.
- **Payroll Service**: Lifecycle management for payruns, payslip generation, and tax calculations.
- **Mail Service**: Branded HTML email templates for welcomes and OTP resets.

## ⚙️ Environment Variables

Copy the `.env.example` file and fill in your details:

```bash
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=your_mongodb_uri

# JWT
JWT_ACCESS_SECRET=min_32_chars_long_secret
JWT_REFRESH_SECRET=min_32_chars_long_secret

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_NAME=EmPay
SMTP_FROM_EMAIL=your-email@gmail.com
```

> **Note**: For Gmail, you must use an **App Password**. Regular passwords will not work if 2FA is enabled.

## 🚀 Running the Server

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run in development mode:**
   ```bash
   npm run dev
   ```

3. **Run in production:**
   ```bash
   npm start
   ```

4. **Seed initial data (optional):**
   ```bash
   npm run seed
   ```

## 📧 Email Templates

The backend includes polished HTML templates for:
- **Welcome Email**: Sent to new invites with their temporary password and login CTA.
- **OTP Reset**: Secure 6-digit verification codes for password recovery.

---
Built with modularity and scalability in mind.
