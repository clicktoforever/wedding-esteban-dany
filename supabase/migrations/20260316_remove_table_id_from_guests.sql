ALTER TABLE guests DROP CONSTRAINT IF EXISTS guests_table_id_fkey;
DROP INDEX IF EXISTS idx_guests_table_id;
DROP INDEX IF EXISTS idx_guests_table_confirmed;
ALTER TABLE guests DROP COLUMN IF EXISTS table_id;
