# Tomblr - Secure Cloud Storage & Management

Tomblr is a premium, high-performance cloud storage solution designed with a modern aesthetic and seamless user experience. It provides secure file hosting, hierarchical folder management, and robust authentication.

## 🚀 Features

### 📁 Advanced File Management

- **Hierarchical Folders**: Create, open, and navigate through nested folders with ease.
- **Recursive Deletion**: Safe and thorough cleanup of folders, automatically removing all child files from both the database and cloud storage (MinIO).
- **Drag & Drop**: Intuitive file uploads with a sleek drop-zone interface.
- **View Modes**: Switch between Grid and List views for optimal organization.
- **Sorting & Rearranging**: Sort files by name, date, or size, and use "Rearrange Mode" for manual ordering.

### 🔐 Premium Authentication

- **Welcome Back Portal**: A redesigned sign-in experience on `/access` featuring Email, Phone (with 🇳🇬 support), and 6-digit PIN authentication.
- **Secure Registration**: Smooth onboarding flow with profile completion.
- **Session Persistence**: Built on NextAuth for secure and reliable access.

### 💎 Modern UI/UX

- **Glassmorphic Design**: A premium interface featuring blurred backgrounds, vibrant gradients, and smooth transitions.
- **Micro-animations**: Staggered entry animations and interactive hover effects powered by Framer Motion.
- **Responsive Layout**: Fully optimized for desktop and mobile workflows.

## � Project Structure

```text
tomblr/
├── app/                    # Next.js App Router pages
│   ├── access/             # Premium Sign-in Portal
│   ├── dashboard/          # File Management Dashboard
│   ├── login/              # Authentication flows
│   ├── register/           # User onboarding
│   └── api/                # Backend API routes
├── components/             # Reusable React components
│   ├── Navbar.tsx          # Navigation system
│   ├── Footer.tsx          # Global footer
│   └── AccessCodeForm.tsx  # Auth components
├── lib/                    # Shared utilities & Server Actions
│   ├── actions.ts          # Auth & user actions
│   ├── file-actions.ts     # Storage & folder management
│   └── prisma.ts           # Database initialization
├── prisma/                 # Database schema & migrations
├── public/                 # Static assets & icons
└── types/                  # TypeScript definitions
```

## �🛠 Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Database**: [Prisma](https://www.prisma.io/) with PostgreSQL
- **Storage**: [MinIO](https://min.io/) (S3 Compatible)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Styling**: Tailwind CSS

## 🏁 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL Database
- MinIO instance

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/gbabudoh/tomblr.git
   cd tomblr
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in `.env.local`:
   ```env
   DATABASE_URL="..."
   NEXTAUTH_SECRET="..."
   MINIO_ENDPOINT="..."
   MINIO_ACCESS_KEY="..."
   MINIO_SECRET_KEY="..."
   ```
4. Push the schema and start the dev server:
   ```bash
   npx prisma db push
   npm run dev
   ```

---

Built with ❤️ by the Tomblr Team.
