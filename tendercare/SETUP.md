# Setup Guide

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Start PostgreSQL**
   ```bash
   docker run -d \
     --name school-db \
     -e POSTGRES_PASSWORD=yourpassword \
     -e POSTGRES_DB=school_results \
     -p 5432:5432 \
     postgres:16
   ```

4. **Push database schema**
   ```bash
   npm run db:push
   ```

5. **Create first admin** (using Node.js)
   ```bash
   # Install tsx for running TypeScript
   npm install -D tsx
   
   # Run the script
   npx tsx scripts/create-admin.ts admin@school.com admin123 "Admin Name"
   ```

   Or manually in SQL:
   ```sql
   -- You'll need to hash the password first using Argon2id
   -- Use an online tool or the create-admin script
   INSERT INTO admins (id, email, password_hash, name)
   VALUES (
     gen_random_uuid(),
     'admin@school.com',
     '$argon2id$v=19$m=19456,t=2,p=1$...', -- Replace with actual hash
     'System Administrator'
   );
   ```

6. **Start dev server**
   ```bash
   npm run dev
   ```

7. **Login**
   - Go to http://localhost:5173/login
   - Select "Admin"
   - Use your admin credentials

## Initial Configuration

After logging in as admin:

1. **Create Academic Year**
   - Go to `/admin/promote`
   - Create academic year (e.g., "2024/2025")

2. **Create Classes**
   - Go to `/admin/classes`
   - Create classes: JSS1-A, JSS1-B, JSS2-A, etc.

3. **Create Subjects**
   - Go to `/admin/subjects`
   - Add subjects (e.g., Mathematics, English)
   - Select level: Junior or Senior

4. **Add Students**
   - Go to `/admin/students`
   - Add student records

5. **Create Term**
   - Go to `/admin/terms`
   - Create Term 1, Term 2, or Term 3

6. **Enroll Students**
   - Go to `/admin/enrollments`
   - Assign students to classes for the term

7. **Create Teacher Account** (optional)
   ```sql
   INSERT INTO teachers (id, email, password_hash, name)
   VALUES (
     gen_random_uuid(),
     'teacher@school.com',
     '$argon2id$v=19$m=19456,t=2,p=1$...', -- Hash password
     'Teacher Name'
   );
   ```

## Workflow

### Entering Results (Teacher)

1. Login as teacher
2. Go to `/teacher/results`
3. Select term, class, and subject
4. Click "Load Students"
5. Enter CA and Exam scores
6. Click "Save All Results"

### Publishing Results (Admin)

1. Go to `/admin/terms`
2. Set term status to "Closed" (optional)
3. Click "Publish Results"
4. Go to `/admin/tokens`
5. Generate tokens for students
6. Students can now view results at `/results` using their token

### Annual Promotion (Admin)

1. Go to `/admin/promote`
2. Create new academic year
3. Click "Promote All Students"
4. Reassign sections if needed at `/admin/students`

## Troubleshooting

### Database Connection Issues

- Check `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Check port 5432 is not blocked

### Authentication Issues

- Verify password hash is correct (Argon2id)
- Check session cookie settings
- Clear browser cookies

### Schema Issues

- Run `npm run db:push` to sync schema
- Check Drizzle Studio: `npm run db:studio`

## Production Deployment

1. Set `NODE_ENV=production`
2. Use secure `SESSION_SECRET`
3. Use production PostgreSQL database
4. Set up SSL/TLS
5. Configure proper CORS settings
6. Set up backups for database

