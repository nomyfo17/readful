# Readful - Your Digital Reading Sanctuary

A beautiful platform for reading, sharing, and discovering EPUB books. Built with Next.js, TypeScript, Tailwind CSS, and Framer Motion.

## Features

### Core Features
- **EPUB Reading**: Upload and read EPUB files with a beautiful reading experience
- **Author System**: Become an author, upload books, and track your audience
- **Read Tracking**: Monitor how many people are reading your books (like YouTube views)
- **Bookmark System**: Save your reading progress - **one bookmark per book** that updates when you move pages
- **PWA Support**: Installable on any device, works offline

### Routes

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/` | Landing page | No |
| `/app` | Reading feed | No (optional) |
| `/app/search` | Search books | No |
| `/app/following` | Books from followed authors | Yes |
| `/app/bookmarks` | Your saved books | Yes |
| `/app/books/[id]` | Read a specific book | No |
| `/author` | Author dashboard | **Yes** |
| `/author/upload` | Upload EPUB books | **Yes** |
| `/author/books` | Your uploaded books | **Yes** |
| `/author/followers` | Your followers | **Yes** |
| `/author/data` | Analytics | **Yes** |
| `/settings` | Settings hub | **Yes** |
| `/settings/profile` | Profile settings | **Yes** |
| `/settings/bookmarks` | Bookmark settings | **Yes** |
| `/settings/notifications` | Notifications | **Yes** |
| `/settings/security` | Security settings | **Yes** |
| `/settings/preferences` | Reading preferences | **Yes** |
| `/settings/author` | Author settings | **Yes** |
| `/auth/login` | Login | No |
| `/auth/signin` | Sign up | No |
| `/docs` | Documentation | No |

### Authentication Rules
- **`/app` routes**: Public access, optional login
- **`/author` routes**: **MANDATORY login** - authors only
- **`/settings` routes**: **MANDATORY login** - account settings
- **`/auth` routes**: Public access

## Bookmark System

The bookmark system has been designed with specific requirements:

1. **One Bookmark Per Book**: Each user can only have one bookmark per book
2. **Automatic Update**: When you move to a new page, the bookmark is automatically updated
3. **Move Bookmark**: If you want to move a bookmark from one book to another:
   - The old bookmark is deleted
   - A new bookmark is created for the new book
   - This is handled automatically by the API

### API Endpoints

```typescript
// Create or update bookmark (moves if exists)
POST /api/bookmarks
Body: { bookId, chapterId?, page?, notes? }

// Get all bookmarks
GET /api/bookmarks

// Delete bookmark
DELETE /api/bookmarks
Body: { bookmarkId }

// Move bookmark to new book (special endpoint)
PATCH /api/bookmarks/move
Body: { oldBookId, newBookId, chapterId?, page?, notes? }
```

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes, NextAuth
- **Database**: PostgreSQL (Prisma ORM)
- **PWA**: next-pwa with Workbox
- **Icons**: Lucide React
- **EPUB**: epubjs, react-epub-viewer

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/nomyfo17/readful.git
   cd readful
   ```

2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your database URL and secrets:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/readful?schema=public"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   ```

4. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

5. Push database schema:
   ```bash
   npx prisma db push
   ```

6. Run development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000)

## Deployment

### Vercel Deployment

1. Push to GitHub:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. Import project in Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect Next.js

3. Set environment variables in Vercel:
   ```
   DATABASE_URL=postgresql://user:password@your-db-host:5432/readful?schema=public
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=your-production-secret
   ```

### Neon DB Setup

#### For Local Development with Neon

1. Sign up for [Neon](https://neon.tech)
2. Create a new project
3. Get your database connection string from Neon dashboard
4. Set it in your `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@ep-cool-name-123456.us-east-2.aws.neon.tech/readful?sslmode=require"
   ```

#### For Vercel Production with Neon

1. **Option A: Neon Serverless Driver (Recommended)**
   
   Install Neon serverless driver:
   ```bash
   npm install @neondatabase/serverless
   ```
   
   Update your `prisma/schema.prisma`:
   ```prisma
datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
     directUrl = env("DIRECT_URL")
   }
   ```
   
   Set both environment variables in Vercel:
   ```
   DATABASE_URL=postgresql://user:password@ep-cool-name-123456.us-east-2.aws.neon.tech/readful?sslmode=require
   DIRECT_URL=postgresql://user:password@ep-cool-name-123456.us-east-2.aws.neon.tech/readful?sslmode=require&pgbouncer=false
   ```

2. **Option B: Use Connection Pooling**
   
   Neon provides connection pooling. Use the pooled connection URL:
   ```env
   DATABASE_URL=postgresql://user:password@ep-cool-name-123456.pooler.us-east-2.aws.neon.tech/readful?sslmode=require
   ```

3. **Option C: Vercel PostgreSQL (Simplest)**
   
   Vercel now offers built-in PostgreSQL:
   ```bash
   vercel storage connect
   ```
   
   This creates a PostgreSQL database automatically connected to your Vercel project.

### Important: Vercel Serverless Functions

Vercel runs in serverless functions. Make sure:

1. **Database connection pooling is enabled** (Neon provides this)
2. **Prisma client is properly instantiated** (we use singleton pattern in `src/lib/db.ts`)
3. **Environment variables are set in Vercel dashboard**

### Configure vercel.json for Neon

Your `vercel.json` should look like:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next",
      "config": { 
        "installCommand": "npm install --legacy-peer-deps",
        "zeroConfig": true
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/"
    }
  ]
}
```

## Project Structure

```
readful/
├── prisma/
│   └── schema.prisma          # Database schema
├── public/
│   ├── uploads/               # EPUB and image uploads
│   └── icons/                 # PWA icons
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── auth/         # Authentication endpoints
│   │   │   ├── books/        # Book endpoints
│   │   │   ├── reads/        # Read tracking
│   │   │   └── bookmarks/    # Bookmark endpoints
│   │   ├── app/              # App section
│   │   ├── author/           # Author section (protected)
│   │   ├── settings/         # Settings section (protected)
│   │   ├── auth/             # Auth pages
│   │   └── docs/             # Documentation
│   ├── components/
│   │   ├── ui/              # UI components
│   │   ├── BookCard.tsx      # Book card component
│   │   ├── Navbar.tsx        # Navigation
│   │   └── Footer.tsx        # Footer
│   ├── contexts/
│   │   └── AuthContext.tsx  # Authentication context
│   ├── lib/
│   │   ├── auth.ts          # NextAuth configuration
│   │   ├── db.ts            # Prisma client
│   │   └── utils.ts         # Utility functions
│   ├── styles/
│   │   └── globals.css      # Global styles
│   └── middleware.ts        # Route protection middleware
├── .env.example
├── next.config.ts
├── package.json
├── tsconfig.json
└── vercel.json
```

## Database Schema

The Prisma schema includes:

- **User**: User accounts with author profiles
- **Book**: EPUB books with metadata
- **Read**: Reading tracking (like YouTube views)
- **Bookmark**: One per book per user, with chapter/page tracking
- **Following**: Follow authors
- **Chapter**: Book chapters
- **Account/Session**: NextAuth session management

## Authentication

Uses NextAuth with credentials provider:
- Email/password login
- Session management
- JWT strategy
- Prisma adapter

## EPUB Handling

- Upload EPUB files up to 50MB
- Automatic metadata extraction
- Cover image support
- Sample chapter support
- Advanced metadata (ISBN, series, maturity rating, etc.)

## PWA Configuration

The app is configured as a PWA with:
- Manifest.json for installability
- Service worker with caching strategies
- Offline support for static assets
- EPUB caching for better performance

## Bookmark Logic

The bookmark system implements your specific requirements:

```typescript
// When creating a bookmark:
1. Check if user already has a bookmark for this book
2. If YES: Update the existing bookmark (move it)
3. If NO: Create a new bookmark

// When moving a bookmark:
1. Delete the old bookmark
2. Create a new bookmark for the new book
3. This is handled by the PATCH /api/bookmarks/move endpoint

// Result: Each user can only have ONE bookmark per book
// The bookmark updates automatically when they move pages
```

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database?schema=public
DIRECT_URL=postgresql://user:password@host:port/database?sslmode=require&pgbouncer=false

# NextAuth
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-secret-key-here

# Optional: For Neon DB
NEON_DB_URL=postgresql://user:password@ep-cool-name-123456.us-east-2.aws.neon.tech/readful
```

## Scripts

```bash
# Development
npm run dev

# Build
npm run build

# Start production server
npm run start

# Database
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema to database
npm run db:migrate     # Create migrations
npm run db:studio      # Open Prisma Studio
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Push to the branch
5. Open a pull request

## License

MIT

## Support

- Documentation: [/docs](https://your-app.vercel.app/docs)
- Issues: [GitHub Issues](https://github.com/nomyfo17/readful/issues)
- Community: Join our Discord

---

**Built with ❤️ by Readful Team**

*Your Digital Reading Sanctuary*
