-- 0002_seed.sql
-- Initialize the Demo Site Alpha Company and populate it with sample data

-- 1. Create the Demo Company
INSERT INTO companies (id, name) 
VALUES ('00000000-0000-0000-0000-000000000001', 'Demo Site Alpha')
ON CONFLICT (id) DO NOTHING;

-- 2. Seed material requests for the demo site
DO $$ 
DECLARE 
    temp_user_id UUID;
    DEMO_COMPANY_ID UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
    -- Find the first available user to act as the requester
    SELECT id INTO temp_user_id FROM auth.users LIMIT 1;
    
    IF temp_user_id IS NOT NULL THEN
        -- Ensure a profile exists for this user in the Demo Company (required by foreign key)
        INSERT INTO profiles (id, company_id, full_name, role)
        VALUES (temp_user_id, DEMO_COMPANY_ID, 'Demo Lead', 'admin')
        ON CONFLICT (id) DO UPDATE SET company_id = DEMO_COMPANY_ID;

        -- Clean up existing demo requests to prevent duplicates
        DELETE FROM material_requests WHERE company_id = DEMO_COMPANY_ID;
        
        -- Insert high-quality construction material requests
        INSERT INTO material_requests (company_id, requested_by, material_name, quantity, unit, priority, status, notes)
        VALUES 
        (DEMO_COMPANY_ID, temp_user_id, 'Steel Rebar 12mm', 450, 'kg', 'urgent', 'pending', 'Floor 4 Construction'),
        (DEMO_COMPANY_ID, temp_user_id, 'Portland Cement', 120, 'bags', 'high', 'approved', 'Foundation mixing'),
        (DEMO_COMPANY_ID, temp_user_id, 'PVC Conduit Pipes 20mm', 100, 'meters', 'low', 'pending', 'Electrical rough-ins'),
        (DEMO_COMPANY_ID, temp_user_id, 'Safety Goggles', 25, 'sets', 'medium', 'fulfilled', 'PPE Kit'),
        (DEMO_COMPANY_ID, temp_user_id, 'Ready-Mix Concrete (C30)', 15, 'm3', 'urgent', 'pending', 'Foundation wall');
    END IF;
END $$;
