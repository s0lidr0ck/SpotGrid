# SpotGrid Database Migration Setup

## 1. Environment Variables

Create a `.env` file in your project root with these variables:

```env
# Database Configuration (from your EasyPanel setup)
VITE_DB_HOST=your-easypanel-domain
VITE_DB_PORT=5432
VITE_DB_NAME=spotgrid
VITE_DB_USER=spotgrid
VITE_DB_PASSWORD=Make-Jesus-Known
VITE_DB_SSL=true

# Authentication
VITE_JWT_SECRET=your-jwt-secret-here-generate-a-strong-one

# API Configuration
VITE_API_URL=http://localhost:3001
```

## 2. Install Dependencies

Run this command to install the new dependencies:

```bash
npm install
```

## 3. Database Schema Migration

You have two options to set up your database schema:

### Option A: Run SQL migrations manually
1. Connect to your PostgreSQL database
2. Run each migration file in chronological order from `/supabase/migrations/`

### Option B: Use a migration tool
1. Install a migration runner like `node-pg-migrate`
2. Convert your Supabase migrations to the new format

## 4. Next Steps

After setting up the environment variables and schema, you'll need to:
1. Replace Supabase Auth with a custom authentication system
2. Update all database queries to use the new connection
3. Handle Row Level Security logic in your application code
4. Set up file storage if needed

## Connection Details from EasyPanel:
- Service Name: spotgrid-db
- Database Name: spotgrid  
- User: spotgrid
- Password: Make-Jesus-Known
- Image: postgres:17 