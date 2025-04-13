-- Add supplier_name column to incoming_box_stock table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'incoming_box_stock' 
                   AND column_name = 'supplier_name') THEN
        ALTER TABLE incoming_box_stock ADD COLUMN supplier_name TEXT;
    END IF;
END$$;