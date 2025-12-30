-- 0001_config.sql
-- Security (RLS) and Performance (Indexes) Configuration

-- 1. ENABLE RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_requests ENABLE ROW LEVEL SECURITY;

-- 2. PROFILES POLICIES (Recursive-Safe)
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Authenticated users can view profiles" ON profiles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage own profile" ON profiles
    FOR ALL USING (id = auth.uid());

-- 3. COMPANIES POLICIES
CREATE POLICY "Users can view their companies" ON companies
    FOR SELECT USING (
        id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
        OR id = '00000000-0000-0000-0000-000000000001'
        OR created_by = auth.uid()
    );

CREATE POLICY "Authenticated users can create companies" ON companies
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 4. MATERIAL REQUESTS POLICIES
CREATE POLICY "Users can view requests from their company" ON material_requests
    FOR SELECT USING (
        company_id IN (SELECT p.company_id FROM profiles p WHERE p.id = auth.uid())
    );

CREATE POLICY "Users can create requests for their company" ON material_requests
    FOR INSERT WITH CHECK (
        company_id IN (SELECT p.company_id FROM profiles p WHERE p.id = auth.uid()) 
        AND requested_by = auth.uid()
    );

CREATE POLICY "Users can update requests from their company" ON material_requests
    FOR UPDATE USING (
        company_id IN (SELECT p.company_id FROM profiles p WHERE p.id = auth.uid())
    );

-- 5. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_requests_company ON material_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_requests_requested_by ON material_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_companies_owner ON companies(created_by);
CREATE INDEX IF NOT EXISTS idx_profiles_company ON profiles(company_id);
