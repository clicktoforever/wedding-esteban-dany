-- Wedding Invitation Platform - Supabase Schema
-- Author: GitHub Copilot
-- Description: Complete database schema with Row Level Security policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create ENUMs
CREATE TYPE confirmation_status AS ENUM ('pending', 'confirmed', 'declined');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Guests table: Main invitees with unique access tokens
CREATE TABLE guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    access_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Passes table: Individual attendees per guest invitation
CREATE TABLE passes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
    attendee_name TEXT NOT NULL,
    confirmation_status confirmation_status NOT NULL DEFAULT 'pending',
    dietary_restrictions TEXT,
    notes TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Gifts table: Registry items
CREATE TABLE gifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    price NUMERIC(10,2),
    store_url TEXT,
    category TEXT,
    is_purchased BOOLEAN NOT NULL DEFAULT FALSE,
    purchased_by UUID REFERENCES guests(id) ON DELETE SET NULL,
    purchased_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES for Performance
-- ============================================================================

CREATE INDEX idx_guest_token ON guests(access_token);
CREATE INDEX idx_passes_guest ON passes(guest_id);
CREATE INDEX idx_gifts_purchased ON gifts(is_purchased);
CREATE INDEX idx_gifts_category ON gifts(category);

-- ============================================================================
-- TRIGGERS for auto-update timestamps
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_guests_updated_at BEFORE UPDATE ON guests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_passes_updated_at BEFORE UPDATE ON passes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;

-- Guests policies: Can only read own data based on token
CREATE POLICY "Guests can read own data"
    ON guests FOR SELECT
    USING (access_token = current_setting('app.current_token', true));

-- Passes policies: Can read and update own passes
CREATE POLICY "Guests can read own passes"
    ON passes FOR SELECT
    USING (
        guest_id IN (
            SELECT id FROM guests 
            WHERE access_token = current_setting('app.current_token', true)
        )
    );

CREATE POLICY "Guests can update own passes"
    ON passes FOR UPDATE
    USING (
        guest_id IN (
            SELECT id FROM guests 
            WHERE access_token = current_setting('app.current_token', true)
        )
    )
    WITH CHECK (
        guest_id IN (
            SELECT id FROM guests 
            WHERE access_token = current_setting('app.current_token', true)
        )
    );

-- Gifts policies: Everyone can read, authenticated guests can purchase unpurchased gifts
CREATE POLICY "Anyone can read gifts"
    ON gifts FOR SELECT
    USING (true);

CREATE POLICY "Authenticated guests can purchase available gifts"
    ON gifts FOR UPDATE
    USING (
        is_purchased = false OR 
        purchased_by IN (
            SELECT id FROM guests 
            WHERE access_token = current_setting('app.current_token', true)
        )
    )
    WITH CHECK (
        is_purchased = false OR 
        purchased_by IN (
            SELECT id FROM guests 
            WHERE access_token = current_setting('app.current_token', true)
        )
    );

-- ============================================================================
-- SEED DATA for Development/Testing
-- ============================================================================

-- Insert sample guests
INSERT INTO guests (name, email, phone, access_token) VALUES
    ('Carlos Maldonado', 'carlos@example.com', '+1234567890', 'test_token_carlos_123'),
    ('María García', 'maria@example.com', '+1234567891', 'test_token_maria_456'),
    ('Juan Pérez', 'juan@example.com', '+1234567892', 'test_token_juan_789');

-- Insert sample passes
INSERT INTO passes (guest_id, attendee_name, confirmation_status) VALUES
    ((SELECT id FROM guests WHERE name = 'Carlos Maldonado'), 'Carlos Maldonado', 'pending'),
    ((SELECT id FROM guests WHERE name = 'Carlos Maldonado'), 'Daniela López', 'pending'),
    ((SELECT id FROM guests WHERE name = 'Carlos Maldonado'), 'Lupita Maldonado', 'pending'),
    ((SELECT id FROM guests WHERE name = 'María García'), 'María García', 'confirmed'),
    ((SELECT id FROM guests WHERE name = 'María García'), 'Pedro García', 'confirmed'),
    ((SELECT id FROM guests WHERE name = 'Juan Pérez'), 'Juan Pérez', 'pending');

-- Insert sample gifts
INSERT INTO gifts (name, description, price, category, image_url, store_url) VALUES
    ('Juego de Sábanas King', 'Sábanas 100% algodón egipcio, color blanco', 89.99, 'Recámara', 'https://cdn.builder.io/api/v1/image/assets%2FTEMP%2Fsabanas.jpg', 'https://amazon.com/sabanas'),
    ('Cafetera Espresso', 'Cafetera italiana de aluminio para 6 tazas', 45.99, 'Cocina', 'https://cdn.builder.io/api/v1/image/assets%2FTEMP%2Fcafetera.jpg', 'https://amazon.com/cafetera'),
    ('Set de Toallas', 'Set de 6 toallas de baño + 6 toallas de manos', 65.00, 'Baño', 'https://cdn.builder.io/api/v1/image/assets%2FTEMP%2Ftoallas.jpg', 'https://amazon.com/toallas'),
    ('Licuadora', 'Licuadora de alta potencia con vaso de vidrio', 120.00, 'Cocina', 'https://cdn.builder.io/api/v1/image/assets%2FTEMP%2Flicuadora.jpg', 'https://amazon.com/licuadora'),
    ('Juego de Ollas', 'Set de 8 piezas de acero inoxidable', 199.99, 'Cocina', 'https://cdn.builder.io/api/v1/image/assets%2FTEMP%2Follas.jpg', 'https://amazon.com/ollas'),
    ('Edredón Matrimonial', 'Edredón de plumas de ganso, color gris', 150.00, 'Recámara', 'https://cdn.builder.io/api/v1/image/assets%2FTEMP%2Fedredon.jpg', 'https://amazon.com/edredon');

-- ============================================================================
-- HELPER FUNCTIONS (Optional)
-- ============================================================================

-- Function to get guest stats (for admin dashboard)
CREATE OR REPLACE FUNCTION get_wedding_stats()
RETURNS TABLE (
    total_guests BIGINT,
    total_passes BIGINT,
    confirmed_passes BIGINT,
    declined_passes BIGINT,
    pending_passes BIGINT,
    total_gifts BIGINT,
    purchased_gifts BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM guests) as total_guests,
        (SELECT COUNT(*) FROM passes) as total_passes,
        (SELECT COUNT(*) FROM passes WHERE confirmation_status = 'confirmed') as confirmed_passes,
        (SELECT COUNT(*) FROM passes WHERE confirmation_status = 'declined') as declined_passes,
        (SELECT COUNT(*) FROM passes WHERE confirmation_status = 'pending') as pending_passes,
        (SELECT COUNT(*) FROM gifts) as total_gifts,
        (SELECT COUNT(*) FROM gifts WHERE is_purchased = true) as purchased_gifts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
