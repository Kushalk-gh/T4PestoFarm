-- Create admin user for PestoFarm
-- Run this SQL after starting the backend to create the admin user

-- Insert admin user with ROLE_ADMIN
INSERT INTO users (email, fullname, role, mobile, password, email_verified, created_at)
VALUES ('admin@pestofarm.com', 'Admin User', 'ROLE_ADMIN', '1234567890', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', true, NOW())
ON CONFLICT (email) DO NOTHING;

-- Verify the admin user was created
SELECT id, email, fullname, role, email_verified FROM users WHERE email = 'admin@pestofarm.com';
