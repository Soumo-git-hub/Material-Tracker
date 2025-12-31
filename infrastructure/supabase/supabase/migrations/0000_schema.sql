-- 0000_schema.sql
-- Extensions and Core Tables

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Companies Table
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id),
    full_name TEXT,
    role TEXT DEFAULT 'employee',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Material Requests Table
-- NOTE: requested_by MUST point to profiles(id) to allow PostgREST joins
CREATE TABLE IF NOT EXISTS material_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID DEFAULT NULL,
    company_id UUID REFERENCES companies(id) NOT NULL,
    requested_by UUID REFERENCES profiles(id) NOT NULL, -- Pointed to profiles for joining names
    material_name TEXT NOT NULL,
    quantity NUMERIC NOT NULL,
    unit TEXT NOT NULL,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'fulfilled')) DEFAULT 'pending',
    notes TEXT,
    image_url TEXT,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
