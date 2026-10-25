-- =============================================================================
-- ENTERPRISE RBAC SCHEMA FOR AL WATANEYA AUCTIONS / E-AUCTION PLATFORM
-- Supports: Super Admin, Module Admins, Granular Permissions, Role Mapping
-- =============================================================================

-- 1. ROLES TABLE
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system_role BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. PERMISSIONS TABLE
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) NOT NULL UNIQUE,
    module VARCHAR(50) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. ROLE-PERMISSIONS JUNCTION
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id)
);

-- 4. USER-ROLES RBAC JUNCTION
CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);

-- -----------------------------------------------------------------------------
-- SEED ROLES
-- -----------------------------------------------------------------------------
INSERT INTO roles (name, display_name, description) VALUES
('SUPER_ADMIN', 'Super Administrator', 'Full unconstrained root access across all platform modules, auctions, finances, and system settings'),
('ADMIN', 'Enterprise Administrator', 'Standard administrator with access to sellers, operations, and management workflows'),
('OPERATIONS_MANAGER', 'Operations Manager', 'Dedicated access to technical tests, vehicle inspections, yard logistics, and services'),
('ACCOUNTANT', 'Financial Accountant', 'Access to invoicing, payments, security deposits, and settlement reconciliation'),
('SELLER', 'Vehicle Consignor / Fleet Seller', 'Consignor portal to submit vehicles, view live bids, and receive payout statements'),
('BUYER', 'Registered Bidder', 'Registered and KYC-verified participant in live and silent auction bidding')
ON CONFLICT (name) DO NOTHING;

-- -----------------------------------------------------------------------------
-- SEED PERMISSIONS
-- -----------------------------------------------------------------------------
INSERT INTO permissions (code, module, display_name, description) VALUES
('ADMIN_PORTAL_ACCESS', 'GLOBAL', 'Admin Portal Access', 'Permission to see the Admin link and access the admin console'),
('SUPER_ADMIN_MANAGE_ALL', 'GLOBAL', 'Super Admin Root', 'Manage all tasks, overrides, and administrative operations'),
('SELLERS_MODULE_MANAGE', 'SELLERS', 'Sellers Module', 'Add cars, inspect seller submissions, and manage consigned inventory'),
('OPERATIONS_MODULE_MANAGE', 'OPERATIONS', 'Operations Module', 'Manage technical tests, car photos, washing, and yard workflows'),
('MANAGEMENT_MODULE_MANAGE', 'MANAGEMENT', 'Management Module', 'Manage auction batches, customer list, and employee permissions'),
('ACCOUNTANT_MODULE_MANAGE', 'ACCOUNTANT', 'Accountant Module', 'Manage buyer change invoices, security deposits, and payouts'),
('REPORTS_MODULE_VIEW', 'REPORTS', 'Reports Module', 'View financial, sales, and consignor analytics reports'),
('USERS_RBAC_MANAGE', 'ADMIN', 'RBAC & User Management', 'Assign roles, adjust employee permissions, and manage 500 users')
ON CONFLICT (code) DO NOTHING;

-- -----------------------------------------------------------------------------
-- MAP PERMISSIONS TO ROLES
-- -----------------------------------------------------------------------------
-- SUPER_ADMIN gets ALL permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'SUPER_ADMIN'
ON CONFLICT DO NOTHING;

-- ADMIN gets standard operational permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'ADMIN' AND p.code IN (
    'ADMIN_PORTAL_ACCESS',
    'SELLERS_MODULE_MANAGE',
    'OPERATIONS_MODULE_MANAGE',
    'MANAGEMENT_MODULE_MANAGE',
    'ACCOUNTANT_MODULE_MANAGE',
    'REPORTS_MODULE_VIEW'
)
ON CONFLICT DO NOTHING;

-- OPERATIONS_MANAGER gets Operations and Sellers
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'OPERATIONS_MANAGER' AND p.code IN (
    'ADMIN_PORTAL_ACCESS',
    'SELLERS_MODULE_MANAGE',
    'OPERATIONS_MODULE_MANAGE',
    'REPORTS_MODULE_VIEW'
)
ON CONFLICT DO NOTHING;

-- ACCOUNTANT gets Accountant and Reports
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'ACCOUNTANT' AND p.code IN (
    'ADMIN_PORTAL_ACCESS',
    'ACCOUNTANT_MODULE_MANAGE',
    'REPORTS_MODULE_VIEW'
)
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- ASSIGN SUPER_ADMIN ROLE TO admin@eauction.in AND OTHER ADMIN ACCOUNTS
-- -----------------------------------------------------------------------------
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.email = 'admin@eauction.in' AND r.name = 'SUPER_ADMIN'
ON CONFLICT DO NOTHING;

-- Assign ADMIN role to any user currently having role = 'ADMIN'
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.role = 'ADMIN' AND r.name = 'ADMIN'
ON CONFLICT DO NOTHING;

-- Assign BUYER role to any user currently having role = 'BUYER'
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.role = 'BUYER' AND r.name = 'BUYER'
ON CONFLICT DO NOTHING;

-- Assign SELLER role to any user currently having role = 'SELLER'
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.role = 'SELLER' AND r.name = 'SELLER'
ON CONFLICT DO NOTHING;
