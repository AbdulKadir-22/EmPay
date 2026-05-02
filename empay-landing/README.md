# EmPay Landing & Dashboard

A premium, high-performance frontend for the EmPay HRMS. Designed with a focus on aesthetics and user experience, utilizing glassmorphism and modern design principles.

## 🎨 Design Philosophy

- **Glassmorphism**: Subtle translucency, blur effects, and vibrant gradients.
- **Premium UX**: Smooth scrolling, shimmering skeleton loaders, and interactive hover states.
- **Role-Aware UI**: The interface dynamically adapts based on the logged-in user's role (Admin, HR, Payroll, Employee).

## 🛠️ Tech Stack

- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React & React Icons
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router DOM 7

## 🚀 Key Features

- **Dynamic Landing Page**: Features sections for Hero, Stats, Modules, and Roles.
- **Developer Team Page**: A dedicated page showcasing the team behind EmPay with animated profile cards.
- **Attendance Interface**: Interactive check-in/out dashboard with work hour tracking.
- **Leave Management**: Visual leave balance cards and simplified application forms.
- **Advanced Data Tables**: Built-in sorting, global filtering, and smooth pagination for large records.

## 🏁 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure API URL:**
   The frontend communicates with the backend at `http://localhost:5000` by default. Update the base URL in your axios config if needed.

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## 📂 Folder Structure

- `src/components/ui`: Reusable UI components (Buttons, GlassCards, Skeletons, DataTable).
- `src/components/sections`: Landing page modular sections.
- `src/pages`: Main application pages and route handlers.
- `src/hooks`: Custom React Query hooks for data fetching and mutations.
- `src/context`: Authentication and Theme providers.

---
Experience the future of HRMS today.
