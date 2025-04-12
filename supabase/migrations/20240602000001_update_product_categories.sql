-- Update product categories to more specific names

-- Update from Sneakers to Boys Shoes or Girls Shoes
UPDATE products
SET category = 'Boys Shoes'
WHERE category = 'Sneakers' AND name ILIKE '%boys%';

UPDATE products
SET category = 'Girls Shoes'
WHERE category = 'Sneakers' AND name ILIKE '%girls%';

-- Default remaining Sneakers to Boys Shoes
UPDATE products
SET category = 'Boys Shoes'
WHERE category = 'Sneakers';

-- Update from Boots to Boys Shoes or Girls Shoes
UPDATE products
SET category = 'Boys Shoes'
WHERE category = 'Boots' AND name ILIKE '%boys%';

UPDATE products
SET category = 'Girls Shoes'
WHERE category = 'Boots' AND name ILIKE '%girls%';

-- Default remaining Boots to Boys Shoes
UPDATE products
SET category = 'Boys Shoes'
WHERE category = 'Boots';

-- Update from Men's Sandals to Boys Sandals
UPDATE products
SET category = 'Boys Sandals'
WHERE category = 'Men''s Sandals';

-- Update from Women's Sandals to Girls Sandals
UPDATE products
SET category = 'Girls Sandals'
WHERE category = 'Women''s Sandals';
