-- Add table_id to passes
ALTER TABLE passes 
ADD COLUMN IF NOT EXISTS table_id UUID REFERENCES tables(id) ON DELETE SET NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_passes_table_id ON passes(table_id);
CREATE INDEX IF NOT EXISTS idx_passes_table_confirmed ON passes(table_id) WHERE table_id IS NOT NULL;
