# EmPay - Premium HRMS & Payroll Solution

EmPay is a state-of-the-art, multi-tenant Human Resource Management System (HRMS) and Payroll platform. It features a stunning, glassmorphic user interface inspired by Odoo, providing a seamless experience for administrators, HR officers, payroll officers, and employees.

## 🚀 Project Architecture

The project is structured as a monorepo-style repository with separate directories for the frontend and backend:

- **[Empay Landing (Frontend)](./empay-landing)**: A high-performance React + Vite application featuring a premium UI, role-based dashboards, and interactive modules.
- **[Empay Backend](./Empay-Backend)**: A robust Node.js + Express + MongoDB backend handling multi-tenant logic, role-based access control (RBAC), automated leave allocation, and payroll processing.

## 🛡️ Key Features

- **Role-Based Access Control (RBAC)**: Four distinct roles (Admin, HR, Payroll, Employee) with isolated permissions.
- **Attendance & Leave Management**: Real-time clock-in/out, automated leave allocation, and multi-step approval workflows.
- **Automated Payroll**: Instant salary calculations including PF, Professional Tax, and net pay, with automated payslip generation.
- **Premium UI/UX**: Glassmorphic components, shimmering skeleton loaders, and smooth Framer Motion animations.
- **Email Notifications**: Automated welcome emails for new invites and OTP-based password resets via SMTP/Nodemailer.

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, Framer Motion, TanStack Query (React Query) |
| **Backend** | Node.js, Express, MongoDB (Mongoose), Zod (Validation), Nodemailer (Email) |
| **Auth** | JWT (Access & Refresh Tokens), Bcrypt.js |

## 🏁 Quick Start

### Prerequisites

- Node.js (v18+)
- MongoDB (Local or Atlas)
- SMTP Credentials (for emails)

### Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd EmPay
   ```

2. **Configure Backend:**
   ```bash
   cd Empay-Backend
   cp .env.example .env
   # Edit .env with your MongoDB and SMTP credentials
   npm install
   npm run dev
   ```

3. **Configure Frontend:**
   ```bash
   cd ../empay-landing
   npm install
   npm run dev
   ```

## 👥 Developers

EmPay was built with ❤️ by:
- **Abdulkadir Shaikh** - Lead Developer
- **Rehan Multani** - Co-Developer

---
© 2026 EmPay. Built for the Future of Work.
