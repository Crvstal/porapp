# School Results Management System

A web application for managing student results in Nigerian secondary schools (JSS1-SSS3).

## Features

- **Admin Dashboard**: Manage students, classes, subjects, terms, and publish results
- **Teacher Interface**: Enter and edit CA/Exam scores
- **Student Access**: View published results via token (no login required)
- **Annual Promotion**: Automated student promotion workflow
- **Token-Based Access**: Secure token system for student result viewing

## Tech Stack

- **Framework**: SvelteKit (SSR + forms)
- **Database**: PostgreSQL 16+
- **Auth**: Lucia (session-based)
- **ORM**: Drizzle (type-safe queries)

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 16+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd tendercare
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Generate SvelteKit TypeScript config** (fixes module resolution errors)
   ```bash
   npm run dev
   # Or just: npx svelte-kit sync
   ```
   This creates the `.svelte-kit/tsconfig.json` file that the main tsconfig extends.

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set:
   ```
   DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/school_results
   SESSION_SECRET=your-secret-key-change-this-in-production
   ```

5. **Start PostgreSQL database**
   ```bash
   # Using Docker
   docker run -d \
     --name school-db \
     -e POSTGRES_PASSWORD=yourpassword \
     -e POSTGRES_DB=school_results \
     -p 5432:5432 \
     postgres:16
   ```

6. **Push database schema**
   ```bash
   npm run db:push
   ```

7. **Create first admin account**
   
   You'll need to hash a password first. You can use a simple script or manually insert:
   
   ```sql
   -- Connect to database and run:
   -- First, install oslo: npm install oslo
   -- Then use Node.js to hash password, or use online Argon2id hasher
   
   INSERT INTO admins (id, email, password_hash, name)
   VALUES (
     gen_random_uuid(),
     'admin@school.com',
     -- Replace with actual Argon2id hash of your password
     '$argon2id$v=19$m=19456,t=2,p=1$...',
     'System Administrator'
   );
   ```

8. **Start development server**
   ```bash
   npm run dev
   ```

9. **Open in browser**
   ```
   http://localhost:5173
   ```

## Usage

### Initial Setup (Admin)

1. **Login** as admin at `/login`
2. **Create Academic Year** at `/admin/promote`
3. **Create Classes** at `/admin/classes` (e.g., JSS1-A, JSS1-B, etc.)
4. **Create Subjects** at `/admin/subjects` (specify Junior or Senior level)
5. **Add Students** at `/admin/students`
6. **Create Term** at `/admin/terms`
7. **Enroll Students** (assign students to classes for the term)

### Teacher Workflow

1. **Login** as teacher at `/login`
2. **Enter Results** at `/teacher/results`:
   - Select term, class, and subject
   - Load students
   - Enter CA and Exam scores
   - Save results

### Publishing Results (Admin)

1. **Close Term** at `/admin/terms` (set status to "closed")
2. **Publish Results** at `/admin/terms` (click "Publish Results")
3. **Generate Tokens** at `/admin/tokens` for students
4. Students can now view results at `/results` using their token

### Annual Promotion (Admin)

1. **Create New Academic Year** at `/admin/promote`
2. **Promote All Students** at `/admin/promote`
3. **Reassign Sections** at `/admin/students` (if needed)

## Database Schema

Key tables:
- `admins` - Administrator accounts
- `teachers` - Teacher accounts
- `students` - Student records (no auth)
- `sessions` - Lucia session storage
- `academic_years` - Academic year records
- `terms` - Term records (1, 2, 3 per year)
- `classes` - Class definitions (JSS1-A, etc.)
- `subjects` - Subject definitions (Junior/Senior level)
- `enrollments` - Student enrollment per term
- `results` - CA/Exam scores
- `result_tokens` - Student access tokens

## Marking Scheme

- **Junior Subjects (JSS1-JSS3)**: CA Max = 30, Exam Max = 70
- **Senior Subjects (SSS1-SSS3)**: CA Max = 20, Exam Max = 80

## Development

```bash
# Run development server
npm run dev

# Type checking
npm run check

# Database migrations
npm run db:push      # Push schema changes
npm run db:studio    # Open Drizzle Studio
npm run db:generate  # Generate migration files
```

## Project Structure

```
src/
├── lib/
│   ├── server/
│   │   ├── db/          # Database schema and client
│   │   ├── auth.ts      # Lucia configuration
│   │   └── utils.ts     # Utility functions
│   └── components/      # Reusable components
├── routes/
│   ├── admin/           # Admin routes (protected)
│   ├── teacher/         # Teacher routes (protected)
│   ├── results/         # Public student result viewing
│   └── login/           # Login page
└── hooks.server.ts      # Session validation
```

## Security Notes

- Passwords are hashed using Argon2id
- Sessions are stored server-side (Lucia)
- Student access is token-based (no login)
- Results are locked after publishing
- All forms have server-side validation

## License

MIT

